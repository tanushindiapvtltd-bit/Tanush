import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpayOrderId, orderId } = await req.json();

    if (!razorpayOrderId || !orderId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    try {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Fetch all payments made against this Razorpay order
        const payments = await razorpay.orders.fetchPayments(razorpayOrderId);
        const captured = (payments.items as Array<{ status: string; id: string }>).find(
            (p) => p.status === "captured"
        );

        if (captured) {
            // Payment was actually captured — update DB order to PAID
            const order = await prisma.order.update({
                where: { id: orderId, userId: session.user.id },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    razorpayPaymentId: captured.id,
                },
                include: { deliveryTracking: true },
            });

            if (order.deliveryTracking) {
                const rawHistory = order.deliveryTracking.history;
                const history: Array<{ status: string; description: string; timestamp: string; location: string }> =
                    Array.isArray(rawHistory)
                        ? rawHistory
                        : typeof rawHistory === "string"
                        ? JSON.parse(rawHistory)
                        : [];
                history.push({
                    status: "Confirmed",
                    description: "Payment confirmed. Your order is being processed.",
                    timestamp: new Date().toISOString(),
                    location: "",
                });
                await prisma.deliveryTracking.update({
                    where: { orderId },
                    data: { history, currentStatus: "Confirmed" },
                });
            }

            return NextResponse.json({ paid: true });
        }

        return NextResponse.json({ paid: false });
    } catch (error) {
        console.error("[Razorpay] Check status error:", error);
        return NextResponse.json({ paid: false });
    }
}
