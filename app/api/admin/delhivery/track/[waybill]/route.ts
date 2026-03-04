import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { trackShipment, mapDelhiveryStatus } from "@/lib/delhivery";

type HistoryEntry = { status: string; description: string; timestamp: string; location: string };

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ waybill: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { waybill } = await params;

    let result;
    try {
        result = await trackShipment(waybill);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }

    // Sync latest status to DB
    const tracking = await prisma.deliveryTracking.findFirst({ where: { trackingNumber: waybill } });
    if (tracking) {
        const mappedStatus = mapDelhiveryStatus(result.status);
        if (mappedStatus !== tracking.currentStatus || result.location !== tracking.currentLocation) {
            const rawHistory = tracking.history;
            const history: HistoryEntry[] = Array.isArray(rawHistory)
                ? (rawHistory as HistoryEntry[])
                : typeof rawHistory === "string"
                ? JSON.parse(rawHistory)
                : [];

            history.push({
                status: mappedStatus,
                description: result.status,
                timestamp: new Date().toISOString(),
                location: result.location,
            });

            await prisma.deliveryTracking.update({
                where: { id: tracking.id },
                data: {
                    currentStatus: mappedStatus,
                    currentLocation: result.location,
                    history,
                    ...(result.expectedDelivery
                        ? { estimatedDelivery: new Date(result.expectedDelivery) }
                        : {}),
                },
            });

            // Sync order status
            const orderStatusMap: Record<string, string> = {
                Shipped: "SHIPPED",
                "Out for Delivery": "SHIPPED",
                Delivered: "DELIVERED",
                Cancelled: "CANCELLED",
                Processing: "PROCESSING",
            };
            const orderStatus = orderStatusMap[mappedStatus];
            if (orderStatus) {
                await prisma.order.update({
                    where: { id: tracking.orderId },
                    data: { status: orderStatus as never },
                });
            }
        }
    }

    return NextResponse.json(result);
}
