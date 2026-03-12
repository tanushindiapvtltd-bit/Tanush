import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
        await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // Verify order belongs to user
    const dbOrder = await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id },
        select: { id: true },
    });
    if (!dbOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        // Mark as FAILED so the order page can show the correct state
        await prisma.order.update({
            where: { id: orderId, userId: session.user.id },
            data: { paymentStatus: "FAILED" },
        });
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update order to paid
    const order = await prisma.order.update({
        where: { id: orderId, userId: session.user.id },
        data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            razorpayPaymentId,
        },
        include: { deliveryTracking: true },
    });

    // Add payment confirmation to tracking history
    if (order.deliveryTracking) {
        const rawHistory = order.deliveryTracking.history;
        const history: Array<{ status: string; description: string; timestamp: string; location: string }> =
            Array.isArray(rawHistory) ? rawHistory : typeof rawHistory === "string" ? JSON.parse(rawHistory) : [];
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
        await prisma.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });
    }

    return NextResponse.json({ success: true, order });
}
