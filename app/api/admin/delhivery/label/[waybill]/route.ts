import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLabelUrl } from "@/lib/delhivery";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ waybill: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { waybill } = await params;
    const url = getLabelUrl(waybill);
    // Proxy the label PDF from Delhivery
    const res = await fetch(url, {
        headers: { Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}` },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        return NextResponse.json({ error: "Label not available", status: res.status, detail: body }, { status: res.status });
    }

    // Delhivery returns JSON with a pre-signed S3 pdf_download_link
    const json = await res.json();
    const pdfUrl: string | undefined = json?.packages?.[0]?.pdf_download_link;
    if (!pdfUrl) {
        return NextResponse.json({ error: "No PDF link in response", detail: json }, { status: 502 });
    }

    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) {
        return NextResponse.json({ error: "Failed to fetch PDF from S3" }, { status: 502 });
    }

    const buffer = await pdfRes.arrayBuffer();
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="label-${waybill}.pdf"`,
        },
    });
}
