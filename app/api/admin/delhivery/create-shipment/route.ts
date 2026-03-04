import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createShipment, mapDelhiveryStatus } from "@/lib/delhivery";

type HistoryEntry = { status: string; description: string; timestamp: string; location: string };

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, weight = 0.5, length, width, height } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, deliveryTracking: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.deliveryTracking?.trackingNumber && order.deliveryTracking.carrier === "Delhivery") {
        return NextResponse.json({ error: "Delhivery shipment already created", waybill: order.deliveryTracking.trackingNumber }, { status: 409 });
    }

    const productDesc = order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ");

    let result;
    try {
        result = await createShipment({
            name: order.shippingName,
            address: [order.shippingAddress, order.shippingApartment].filter(Boolean).join(", "),
            pincode: order.shippingZip,
            city: order.shippingCity,
            state: order.shippingState,
            country: order.shippingCountry,
            phone: order.shippingPhone ?? "",
            orderNumber: order.orderNumber,
            paymentMode: order.paymentMethod === "COD" ? "CoD" : "Prepaid",
            codAmount: order.paymentMethod === "COD" ? order.total : undefined,
            totalAmount: order.total,
            productDesc,
            weight,
            length,
            width,
            height,
            orderDate: new Date(order.createdAt).toISOString().split("T")[0],
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }

    const rawHistory = order.deliveryTracking?.history;
    const history: HistoryEntry[] = Array.isArray(rawHistory)
        ? (rawHistory as HistoryEntry[])
        : typeof rawHistory === "string"
        ? JSON.parse(rawHistory)
        : [];

    history.push({
        status: "Shipped",
        description: `Delhivery shipment created. Waybill: ${result.waybill}`,
        timestamp: new Date().toISOString(),
        location: "",
    });

    await prisma.deliveryTracking.update({
        where: { orderId },
        data: {
            trackingNumber: result.waybill,
            carrier: "Delhivery",
            currentStatus: mapDelhiveryStatus("Manifested"),
            history,
        },
    });

    await prisma.order.update({ where: { id: orderId }, data: { status: "SHIPPED" } });

    return NextResponse.json({ waybill: result.waybill, sortCode: result.sortCode });
}
