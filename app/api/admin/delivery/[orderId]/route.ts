import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;
    const {
        trackingNumber,
        carrier,
        estimatedDelivery,
        currentStatus,
        currentLocation,
        addHistoryEntry,
    } = await req.json();

    // Get existing tracking record
    const existing = await prisma.deliveryTracking.findUnique({
        where: { orderId },
    });

    if (!existing) {
        return NextResponse.json({ error: "Tracking not found" }, { status: 404 });
    }

    // Ensure history is always an array (handles both array and legacy string storage)
    const rawHistory = existing.history;
    let history: Array<{
        status: string;
        description: string;
        timestamp: string;
        location: string;
    }> = Array.isArray(rawHistory)
        ? rawHistory
        : typeof rawHistory === "string"
        ? JSON.parse(rawHistory)
        : [];

    if (addHistoryEntry) {
        history = [
            ...history,
            {
                status: currentStatus ?? existing.currentStatus,
                description: addHistoryEntry.description ?? currentStatus ?? "",
                timestamp: new Date().toISOString(),
                location: currentLocation ?? existing.currentLocation ?? "",
            },
        ];
    }

    const tracking = await prisma.deliveryTracking.update({
        where: { orderId },
        data: {
            ...(trackingNumber !== undefined && { trackingNumber }),
            ...(carrier !== undefined && { carrier }),
            ...(estimatedDelivery !== undefined && {
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
            }),
            ...(currentStatus && { currentStatus }),
            ...(currentLocation !== undefined && { currentLocation }),
            history,
        },
    });

    // Also update the order status if status is provided
    if (currentStatus) {
        const statusMap: Record<string, string> = {
            "Order Placed": "PENDING",
            Confirmed: "CONFIRMED",
            Processing: "PROCESSING",
            Shipped: "SHIPPED",
            "Out for Delivery": "SHIPPED",
            Delivered: "DELIVERED",
            Cancelled: "CANCELLED",
        };
        const orderStatus = statusMap[currentStatus];
        if (orderStatus) {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: orderStatus as never },
            });
        }
    }

    return NextResponse.json(tracking);
}
