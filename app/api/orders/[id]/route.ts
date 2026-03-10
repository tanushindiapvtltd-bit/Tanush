import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelShipment } from "@/lib/delhivery";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
        where: {
            id,
            userId: session.user.id,
        },
        include: {
            items: {
                include: { product: true },
            },
            deliveryTracking: true,
        },
    });

    if (!order) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(order);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action !== "cancel") {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
        where: { id, userId: session.user.id },
        include: { deliveryTracking: true },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation of PENDING or CONFIRMED orders
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 });
    }

    // Cancel Delhivery shipment if one exists
    if (order.deliveryTracking?.carrier === "Delhivery" && order.deliveryTracking.trackingNumber) {
        try {
            await cancelShipment(order.deliveryTracking.trackingNumber);
            await prisma.deliveryTracking.update({
                where: { id: order.deliveryTracking.id },
                data: { trackingNumber: null, carrier: null, currentStatus: "Cancelled" },
            });
        } catch { /* ignore — still cancel the order */ }
    }

    const updated = await prisma.order.update({
        where: { id },
        data: { status: "CANCELLED" },
    });

    return NextResponse.json(updated);
}
