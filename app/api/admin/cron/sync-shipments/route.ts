import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackShipment, mapDelhiveryStatus } from "@/lib/delhivery";

// Can be called by Vercel cron or manually by admin
// Vercel cron: add to vercel.json - {"crons":[{"path":"/api/admin/cron/sync-shipments","schedule":"0 */2 * * *"}]}
export async function POST(req: NextRequest) {
    const cronSecret = req.headers.get("x-cron-secret");
    const isAdmin = req.headers.get("x-admin-trigger") === "true";
    if (cronSecret !== process.env.CRON_SECRET && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trackings = await prisma.deliveryTracking.findMany({
        where: {
            carrier: "Delhivery",
            trackingNumber: { not: null },
            currentStatus: { notIn: ["Delivered", "Cancelled", "RTO Delivered"] },
        },
        include: { order: { select: { id: true, userId: true, shippingName: true } } },
        take: 50,
    });

    const results = { updated: 0, rto: 0, errors: 0 };

    for (const tracking of trackings) {
        try {
            const live = await trackShipment(tracking.trackingNumber!);
            const mappedStatus = mapDelhiveryStatus(live.status);

            // Build new history entry
            const newEntry = {
                status: live.status,
                description: live.events[0]?.instructions ?? live.status,
                timestamp: live.events[0]?.timestamp ?? new Date().toISOString(),
                location: live.location,
            };

            const existingHistory = Array.isArray(tracking.history) ? tracking.history as object[] : [];
            const updatedHistory = [...existingHistory, newEntry];

            await prisma.deliveryTracking.update({
                where: { id: tracking.id },
                data: {
                    currentStatus: live.status,
                    currentLocation: live.location,
                    estimatedDelivery: live.expectedDelivery ? new Date(live.expectedDelivery) : undefined,
                    history: updatedHistory,
                },
            });

            // Update order status
            if (mappedStatus !== tracking.currentStatus) {
                const orderStatus = mappedStatus === "Delivered" ? "DELIVERED" :
                    mappedStatus === "Cancelled" ? "CANCELLED" : "SHIPPED";
                await prisma.order.update({
                    where: { id: tracking.orderId },
                    data: { status: orderStatus },
                });
            }

            // Handle RTO
            if (live.status === "RTO Initiated" || live.status === "RTO Out for Delivery" || live.status === "RTO Delivered") {
                const existingRto = await prisma.rtoCase.findUnique({ where: { orderId: tracking.orderId } });
                if (!existingRto) {
                    await prisma.rtoCase.create({
                        data: { orderId: tracking.orderId, reason: live.status },
                    });
                    // Increment user RTO count and flag high risk if > 3
                    const order = await prisma.order.findUnique({ where: { id: tracking.orderId }, select: { userId: true } });
                    if (order?.userId) {
                        const user = await prisma.user.update({
                            where: { id: order.userId },
                            data: { rtoCount: { increment: 1 } },
                            select: { rtoCount: true },
                        });
                        if (user.rtoCount > 3) {
                            await prisma.user.update({
                                where: { id: order.userId },
                                data: { isHighRisk: true },
                            });
                        }
                    }
                    results.rto++;
                }
            }

            results.updated++;
        } catch (err) {
            console.error("[SyncShipments] Error for tracking", tracking.id, err);
            results.errors++;
        }
    }

    console.log("[SyncShipments] Done:", results);
    return NextResponse.json({ success: true, total: trackings.length, ...results });
}
