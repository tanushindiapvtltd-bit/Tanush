import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateLabel } from "@/lib/shiprocket";

// Allowlisted hostnames for label PDF proxying (SSRF protection)
// Shiprocket stores labels in AWS S3 (ap-south-1) and their own CDN
const SAFE_LABEL_HOST_RE = /(\.|^)(amazonaws\.com|shiprocket\.in|shiprocket\.com)$/i;

function isSafeLabelUrl(rawUrl: string): boolean {
    try {
        const { protocol, hostname } = new URL(rawUrl);
        return protocol === "https:" && SAFE_LABEL_HOST_RE.test(hostname);
    } catch {
        return false;
    }
}

// 5 MB cap for proxied PDF (labels are typically < 200 KB)
const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const shipmentId = Number(body.shipmentId);
    if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
        return NextResponse.json({ error: "shipmentId must be a positive integer" }, { status: 400 });
    }

    let labelUrl: string;
    try {
        ({ labelUrl } = await generateLabel(shipmentId));
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Label generation failed";
        console.error("[Shiprocket label]", msg);
        return NextResponse.json({ error: msg }, { status: 502 });
    }

    // SSRF guard — only fetch from known Shiprocket / AWS S3 domains
    if (!isSafeLabelUrl(labelUrl)) {
        console.error("[Shiprocket label] Blocked unsafe label URL:", labelUrl.slice(0, 100));
        return NextResponse.json({ error: "Label URL points to an unexpected host", labelUrl }, { status: 502 });
    }

    // Proxy the PDF to the browser
    let pdfRes: Response;
    try {
        pdfRes = await fetch(labelUrl, {
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: "Failed to fetch label from storage", labelUrl }, { status: 502 });
    }

    if (!pdfRes.ok) {
        return NextResponse.json({ error: `Storage returned ${pdfRes.status}`, labelUrl }, { status: 502 });
    }

    // Enforce size limit
    const contentLength = Number(pdfRes.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PDF_BYTES) {
        return NextResponse.json({ error: "Label PDF exceeds size limit", labelUrl }, { status: 502 });
    }

    const contentType = pdfRes.headers.get("content-type") ?? "";
    if (contentType.includes("application/pdf")) {
        const buffer = await pdfRes.arrayBuffer();
        if (buffer.byteLength > MAX_PDF_BYTES) {
            return NextResponse.json({ error: "Label PDF exceeds size limit", labelUrl }, { status: 502 });
        }
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="label-${shipmentId}.pdf"`,
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "X-Content-Type-Options": "nosniff",
            },
        });
    }

    // Non-PDF response — return the URL and let the client open it
    return NextResponse.json({ labelUrl });
}
