import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { trackShipment } from "@/lib/shiprocket";

const AWB_RE = /^[A-Za-z0-9_-]{4,50}$/;

const STATUS_MAP: Record<string, string> = {
    "DELIVERED": "Delivered",
    "Delivered": "Delivered",
    "PICKUP SCHEDULED": "Shipped",
    "PICKUP GENERATED": "Shipped",
    "OUT FOR PICKUP": "Shipped",
    "PICKED UP": "Shipped",
    "IN TRANSIT": "Shipped",
    "REACHED AT DESTINATION HUB": "Shipped",
    "OUT FOR DELIVERY": "Out for Delivery",
    "UNDELIVERED": "Shipped",
    "RTO INITIATED": "Returned",
    "RTO DELIVERED": "Returned",
    "CANCELED": "Cancelled",
    "Pending": "Shipped",
};

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const awb = searchParams.get("awb") ?? "";

    if (!awb) return NextResponse.json({ error: "awb query param required" }, { status: 400 });
    if (!AWB_RE.test(awb)) return NextResponse.json({ error: "Invalid AWB format" }, { status: 400 });

    let tracking;
    try {
        tracking = await trackShipment(awb);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Track failed";
        console.error("[Shiprocket track]", msg);
        return NextResponse.json({ error: msg }, { status: 502 });
    }

    const mappedStatus = STATUS_MAP[tracking.status] ?? tracking.status;

    // Sync to DB — only update if record exists for this AWB
    const existing = await prisma.deliveryTracking.findFirst({ where: { trackingNumber: awb } });
    if (existing) {
        type H = { status: string; description: string; timestamp: string; location: string };
        const history: H[] = Array.isArray(existing.history) ? (existing.history as H[]) : [];

        // Build dedup key set: "timestamp|status"
        const seenKeys = new Set(history.map((h) => `${h.timestamp}|${h.status}`));

        const newEntries: H[] = [];
        for (const scan of tracking.scans) {
            const key = `${scan.timestamp}|${scan.status}`;
            // Skip internal meta entries and duplicates
            if (scan.status === "_meta" || seenKeys.has(key)) continue;
            seenKeys.add(key);
            newEntries.push({
                status: scan.status,
                description: scan.detail,
                timestamp: scan.timestamp,
                location: scan.location,
            });
        }

        // Cap total history at 200 entries to avoid unbounded growth
        const merged = [...history, ...newEntries].slice(-200);

        await prisma.deliveryTracking.update({
            where: { id: existing.id },
            data: {
                currentStatus: mappedStatus,
                currentLocation: tracking.location || null,
                history: merged,
                ...(mappedStatus === "Delivered"
                    ? { estimatedDelivery: new Date(), deliveredAt: new Date() }
                    : {}),
            },
        });

        if (mappedStatus === "Delivered") {
            await prisma.order.update({
                where: { id: existing.orderId },
                data: { status: "DELIVERED" },
            });
        }
    }

    return NextResponse.json(tracking);
}
