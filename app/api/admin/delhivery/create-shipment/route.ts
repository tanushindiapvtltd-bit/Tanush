import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createShipment } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, weight = 500, length = 10, breadth = 10, height = 10 } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, deliveryTracking: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Use existing Delhivery waybill if already booked, otherwise let Delhivery auto-assign
    const existingWaybill =
        order.deliveryTracking?.carrier === "Delhivery"
            ? (order.deliveryTracking.trackingNumber ?? "")
            : "";

    const productsDesc = order.items.map((i) => i.productName).join(", ").slice(0, 100);
    const paymentMode = order.paymentMethod?.toLowerCase() === "cod" ? "COD" : "Prepaid";

    let result;
    try {
        result = await createShipment({
        waybill: existingWaybill,
        orderNumber: order.orderNumber,
        name: order.shippingName,
        phone: order.shippingPhone ?? "9999999999",
        address: [order.shippingAddress, order.shippingApartment].filter(Boolean).join(", "),
        pincode: order.shippingZip,
        city: order.shippingCity,
        state: order.shippingState,
        country: order.shippingCountry,
        paymentMode,
        codAmount: paymentMode === "COD" ? order.total : undefined,
        totalAmount: order.total,
        weight,
        length,
        breadth,
        height,
        productsDesc,
        quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
        orderDate: order.createdAt.toISOString(),
        sellerInvoice: order.orderNumber,
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Shipment creation failed" }, { status: 422 });
    }

    // Persist to DB — update or create tracking record
    const now = new Date().toISOString();
    const tracking = await prisma.deliveryTracking.upsert({
        where: { orderId },
        create: {
            orderId,
            trackingNumber: result.waybill,
            carrier: "Delhivery",
            currentStatus: "Shipped",
            currentLocation: null,
            history: [
                {
                    status: "Shipped",
                    description: "Shipment booked via Delhivery One",
                    timestamp: now,
                    location: "",
                },
            ],
        },
        update: {
            trackingNumber: result.waybill,
            carrier: "Delhivery",
            currentStatus: "Shipped",
        },
    });

    // Update order status to SHIPPED
    await prisma.order.update({
        where: { id: orderId },
        data: { status: "SHIPPED" },
    });

    return NextResponse.json({ waybill: result.waybill, tracking, message: result.message });
}
