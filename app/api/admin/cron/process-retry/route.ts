import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createShipment } from "@/lib/delhivery";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
    const cronSecret = req.headers.get("x-cron-secret");
    const isAdmin = req.headers.get("x-admin-trigger") === "true";
    if (cronSecret !== process.env.CRON_SECRET && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = await prisma.retryQueue.findMany({
        where: { status: "PENDING", attempts: { lt: MAX_ATTEMPTS } },
        take: 20,
        orderBy: { createdAt: "asc" },
    });

    const results = { processed: 0, succeeded: 0, failed: 0 };

    for (const item of pending) {
        await prisma.retryQueue.update({ where: { id: item.id }, data: { status: "PROCESSING" } });

        try {
            if (item.operation === "create_shipment") {
                const payload = item.payload as { orderId?: string };
                if (!payload.orderId) throw new Error("Missing orderId in payload");

                const order = await prisma.order.findUnique({
                    where: { id: payload.orderId },
                    include: { items: true, deliveryTracking: true },
                });
                if (!order) throw new Error("Order not found");

                const productDesc = order.items.map(i => `${i.productName} x${i.quantity}`).join(", ");
                const result = await createShipment({
                    name: order.shippingName,
                    address: [order.shippingAddress, order.shippingApartment].filter(Boolean).join(", "),
                    pincode: order.shippingZip,
                    city: order.shippingCity,
                    state: order.shippingState,
                    country: order.shippingCountry,
                    phone: order.shippingPhone ?? process.env.DELHIVERY_RETURN_PHONE ?? "9999999999",
                    orderNumber: order.orderNumber,
                    paymentMode: order.paymentMethod === "COD" ? "CoD" : "Prepaid",
                    codAmount: order.paymentMethod === "COD" ? order.total : undefined,
                    totalAmount: order.total,
                    productDesc,
                    weight: 0.5,
                    orderDate: order.createdAt.toISOString().split("T")[0],
                });

                if (order.deliveryTracking) {
                    await prisma.deliveryTracking.update({
                        where: { orderId: order.id },
                        data: { trackingNumber: result.waybill, carrier: "Delhivery", currentStatus: "Shipped" },
                    });
                }
            }

            await prisma.retryQueue.update({ where: { id: item.id }, data: { status: "DONE" } });
            results.succeeded++;
        } catch (err) {
            const newAttempts = item.attempts + 1;
            await prisma.retryQueue.update({
                where: { id: item.id },
                data: {
                    status: newAttempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
                    attempts: newAttempts,
                    lastError: err instanceof Error ? err.message : String(err),
                },
            });
            if (newAttempts >= MAX_ATTEMPTS) {
                console.error("[RetryQueue] Max attempts reached for", item.id, "operation:", item.operation);
            }
            results.failed++;
        }

        results.processed++;
    }

    return NextResponse.json({ success: true, ...results });
}
