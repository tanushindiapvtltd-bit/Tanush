import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapDelhiveryStatus } from "@/lib/delhivery";
import crypto from "crypto";

function verifySignature(body: string, signature: string): boolean {
    const secret = process.env.DELHIVERY_WEBHOOK_SECRET;
    if (!secret || !signature) return true; // skip if not configured
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
    // Return 200 immediately (Delhivery requires fast ack)
    const bodyText = await req.text();
    const signature = req.headers.get("x-delhivery-signature") ?? "";

    // Log raw payload first (idempotency relies on this)
    const log = await prisma.webhookLog.create({
        data: { source: "delhivery", payload: JSON.parse(bodyText || "{}"), signature, processed: false },
    });

    // Async processing — do not block response
    void (async () => {
        try {
            if (!verifySignature(bodyText, signature)) {
                await prisma.webhookLog.update({ where: { id: log.id }, data: { error: "Invalid signature", processed: false } });
                return;
            }

            const payload = JSON.parse(bodyText);

            // Delhivery sends array or single object
            const events = Array.isArray(payload) ? payload : [payload];

            for (const event of events) {
                const waybill = event.waybill ?? event.awb ?? event.AWBNo;
                const status = event.status ?? event.Status;
                if (!waybill || !status) continue;

                // Idempotency check
                const tracking = await prisma.deliveryTracking.findFirst({
                    where: { trackingNumber: waybill },
                    include: { order: { select: { id: true, userId: true } } },
                });
                if (!tracking) continue;

                // Skip if already at this status
                if (tracking.currentStatus === status) continue;

                const location = event.location ?? event.ScannedLocation ?? "";
                const newEntry = {
                    status,
                    description: event.instructions ?? event.Instructions ?? status,
                    timestamp: event.timestamp ?? event.ScanDateTime ?? new Date().toISOString(),
                    location,
                };

                const existingHistory = Array.isArray(tracking.history) ? tracking.history as object[] : [];
                await prisma.deliveryTracking.update({
                    where: { id: tracking.id },
                    data: {
                        currentStatus: status,
                        currentLocation: location,
                        history: [...existingHistory, newEntry],
                    },
                });

                // Sync order status
                const mappedStatus = mapDelhiveryStatus(status);
                const orderStatus = mappedStatus === "Delivered" ? "DELIVERED" :
                    mappedStatus === "Cancelled" ? "CANCELLED" : "SHIPPED";
                await prisma.order.update({
                    where: { id: tracking.orderId },
                    data: { status: orderStatus },
                });

                // Handle RTO
                if (["RTO Initiated", "RTO Out for Delivery", "RTO Delivered"].includes(status)) {
                    const existingRto = await prisma.rtoCase.findUnique({ where: { orderId: tracking.orderId } });
                    if (!existingRto) {
                        await prisma.rtoCase.create({ data: { orderId: tracking.orderId, reason: status } });
                        if (tracking.order?.userId) {
                            const user = await prisma.user.update({
                                where: { id: tracking.order.userId },
                                data: { rtoCount: { increment: 1 } },
                                select: { rtoCount: true },
                            });
                            if (user.rtoCount > 3) {
                                await prisma.user.update({ where: { id: tracking.order.userId }, data: { isHighRisk: true } });
                            }
                        }
                    }
                }

                // Log notification intent (actual email/SMS sending would use Resend here)
                const notifEvent = status === "Delivered" ? "delivered" :
                    status.includes("Out For Delivery") ? "out_for_delivery" :
                    status.includes("RTO") ? "rto" : "shipped";

                await prisma.notificationLog.create({
                    data: {
                        orderId: tracking.orderId,
                        type: "email",
                        event: notifEvent,
                        recipient: "",
                        status: "queued",
                    },
                });
            }

            await prisma.webhookLog.update({ where: { id: log.id }, data: { processed: true } });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("[Webhook/Delhivery] Error:", msg);
            await prisma.webhookLog.update({ where: { id: log.id }, data: { error: msg } }).catch(() => {});
        }
    })();

    return NextResponse.json({ received: true }, { status: 200 });
}
