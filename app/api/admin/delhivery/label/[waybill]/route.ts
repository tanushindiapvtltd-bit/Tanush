import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BASE_URL = process.env.DELHIVERY_BASE_URL ?? "https://track.delhivery.com";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ waybill: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { waybill } = await params;
    const token = process.env.DELHIVERY_API_TOKEN ?? "";

    // packing_slip endpoint: pdf=true returns an S3 link or direct PDF
    const url = `${BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=A4`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Token ${token}`,
            Accept: "application/json, application/pdf, */*",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        return NextResponse.json(
            { error: `Delhivery returned ${res.status}`, detail: body.slice(0, 400) },
            { status: res.status }
        );
    }

    const contentType = res.headers.get("content-type") ?? "";

    // ── Case 1: Delhivery returned the PDF bytes directly ──────────────────────
    if (contentType.includes("application/pdf")) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="label-${waybill}.pdf"`,
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    }

    // ── Case 2: Delhivery returned JSON containing a download URL ──────────────
    const text = await res.text();
    let json: Record<string, unknown>;
    try {
        json = JSON.parse(text);
    } catch {
        return NextResponse.json(
            { error: "Unexpected response from Delhivery", detail: text.slice(0, 400) },
            { status: 502 }
        );
    }

    // Try every known key pattern Delhivery uses across API versions
    const pdfUrl: string | undefined =
        (json?.packages as Array<Record<string, unknown>>)?.[0]?.pdf_download_link as string ||
        (json?.packages as Array<Record<string, unknown>>)?.[0]?.label_url as string ||
        json?.pdf_download_link as string ||
        json?.label_url as string ||
        json?.url as string ||
        undefined;

    if (!pdfUrl) {
        return NextResponse.json(
            { error: "No PDF link found in Delhivery response", detail: json },
            { status: 502 }
        );
    }

    // Fetch the actual PDF from S3 / CDN
    const pdfRes = await fetch(pdfUrl, { cache: "no-store" });
    if (!pdfRes.ok) {
        return NextResponse.json(
            { error: "Failed to fetch PDF from storage", status: pdfRes.status },
            { status: 502 }
        );
    }

    const buffer = await pdfRes.arrayBuffer();
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="label-${waybill}.pdf"`,
            "Cache-Control": "no-store, no-cache, must-revalidate",
        },
    });
}
