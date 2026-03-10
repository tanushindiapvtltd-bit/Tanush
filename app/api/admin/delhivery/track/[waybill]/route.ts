import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { trackShipment } from "@/lib/delhivery";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ waybill: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { waybill } = await params;
    const tracking = await trackShipment(waybill);

    // Map Delhivery status codes to internal delivery statuses
    const statusMap: Record<string, string> = {
        "Booked": "Shipped",
        "In Transit": "Shipped",
        "Out For Delivery": "Out for Delivery",
        "Delivered": "Delivered",
        "RTO": "Returned",
        "Pending": "Shipped",
    };
    const mappedStatus = statusMap[tracking.status] ?? tracking.status;

    // Sync latest status to DB
    const existing = await prisma.deliveryTracking.findFirst({
        where: { trackingNumber: waybill },
    });

    if (existing) {
        type HistoryEntry = { status: string; description: string; timestamp: string; location: string };
        let history: HistoryEntry[] =
            Array.isArray(existing.history) ? (existing.history as HistoryEntry[]) : [];

        // Add new scans not already in history
        for (const scan of tracking.scans) {
            const alreadyIn = history.some((h) => h.timestamp === scan.timestamp && h.status === scan.status);
            if (!alreadyIn) {
                history = [
                    ...history,
                    {
                        status: scan.status,
                        description: scan.detail,
                        timestamp: scan.timestamp,
                        location: scan.location,
                    },
                ];
            }
        }

        await prisma.deliveryTracking.update({
            where: { id: existing.id },
            data: {
                currentStatus: mappedStatus,
                currentLocation: tracking.location,
                history,
                ...(mappedStatus === "Delivered" ? { estimatedDelivery: new Date(), deliveredAt: new Date() } : {}),
            },
        });

        // Sync order status
        if (mappedStatus === "Delivered") {
            await prisma.order.update({
                where: { id: existing.orderId },
                data: { status: "DELIVERED" },
            });
        }
    }

    return NextResponse.json(tracking);
}
