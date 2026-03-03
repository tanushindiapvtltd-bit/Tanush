import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
        return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    // Verify order belongs to user and is an unpaid Razorpay order
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id, paymentMethod: "RAZORPAY" },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
        return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    try {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const rpOrder = await razorpay.orders.create({
            amount: Math.round(order.total * 100), // paise
            currency: "INR",
            receipt: `retry_${orderId.slice(-8)}_${Date.now()}`,
        });

        // Update DB order with new Razorpay order ID and reset to PENDING
        await prisma.order.update({
            where: { id: orderId },
            data: {
                razorpayOrderId: rpOrder.id,
                paymentStatus: "PENDING",
                status: "PENDING",
            },
        });

        return NextResponse.json({
            orderId: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
            dbOrderId: order.id,
            shippingName: order.shippingName,
            shippingEmail: order.shippingEmail,
            shippingPhone: order.shippingPhone,
        });
    } catch (error) {
        console.error("[Razorpay] Retry order error:", error);
        return NextResponse.json({ error: "Payment gateway error" }, { status: 500 });
    }
}
