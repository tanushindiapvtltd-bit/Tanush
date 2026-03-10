import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RETURN_WINDOW_DAYS = 3;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const { reason } = await req.json();
    if (!reason?.trim()) {
        return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id },
        include: { deliveryTracking: true, returnRequests: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "DELIVERED") {
        return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 });
    }

    // Check 3-day window from delivery
    const deliveredAt = order.deliveryTracking?.deliveredAt ?? order.deliveryTracking?.updatedAt;
    if (!deliveredAt) {
        return NextResponse.json({ error: "Delivery date not found" }, { status: 400 });
    }
    const daysSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
        return NextResponse.json({ error: `Return window of ${RETURN_WINDOW_DAYS} days has passed` }, { status: 400 });
    }

    // One return request per order
    const existing = order.returnRequests.find((r) => r.status !== "REJECTED");
    if (existing) {
        return NextResponse.json({ error: "A return request already exists for this order" }, { status: 400 });
    }

    const returnRequest = await prisma.returnRequest.create({
        data: {
            orderId,
            userId: session.user.id,
            reason: reason.trim(),
        },
    });

    return NextResponse.json(returnRequest, { status: 201 });
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const returnRequests = await prisma.returnRequest.findMany({
        where: { orderId, userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(returnRequests);
}
