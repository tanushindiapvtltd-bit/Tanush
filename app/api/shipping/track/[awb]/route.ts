import { NextRequest, NextResponse } from "next/server";
import { incrementTrackingCount } from "@/lib/redis";
import { trackShipment } from "@/lib/delhivery";

const MAX_REQUESTS_PER_MIN = 10;

function maskPhone(phone: string): string {
    if (phone.length < 6) return phone;
    return phone.slice(0, 2) + "X".repeat(phone.length - 4) + phone.slice(-2);
}

function getClientIP(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ awb: string }> }
) {
    const { awb } = await params;
    const ip = getClientIP(req);

    // Rate limit: 10 requests per IP per minute
    const count = await incrementTrackingCount(ip);
    if (count > MAX_REQUESTS_PER_MIN) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: { "Retry-After": "60" },
            }
        );
    }

    try {
        const result = await trackShipment(awb);

        // Mask phone numbers in event descriptions
        const sanitized = {
            ...result,
            events: result.events.map((e) => ({
                ...e,
                instructions: e.instructions
                    ? e.instructions.replace(/\b\d{10}\b/g, (m) => maskPhone(m))
                    : e.instructions,
            })),
        };

        return NextResponse.json(sanitized);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }
}
