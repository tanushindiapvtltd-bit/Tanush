import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createForwardShipment } from "@/lib/shiprocket";

type HistoryEntry = { status: string; description: string; timestamp: string; location: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Terminal order statuses that should not be re-shipped without explicit intent
const TERMINAL_STATUSES = new Set(["DELIVERED"]);

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse body safely
    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { orderId, weight, length, breadth, height } = body as Record<string, unknown>;

    // Validate orderId
    if (!orderId || typeof orderId !== "string" || !UUID_RE.test(orderId)) {
        return NextResponse.json({ error: "orderId must be a valid UUID" }, { status: 400 });
    }

    // Validate dimensions — all must be positive numbers
    const w = Number(weight ?? 500);
    const l = Number(length ?? 10);
    const b = Number(breadth ?? 10);
    const h = Number(height ?? 10);

    if (!Number.isFinite(w) || w <= 0) return NextResponse.json({ error: "weight must be a positive number (grams)" }, { status: 400 });
    if (!Number.isFinite(l) || l <= 0) return NextResponse.json({ error: "length must be a positive number (cm)" }, { status: 400 });
    if (!Number.isFinite(b) || b <= 0) return NextResponse.json({ error: "breadth must be a positive number (cm)" }, { status: 400 });
    if (!Number.isFinite(h) || h <= 0) return NextResponse.json({ error: "height must be a positive number (cm)" }, { status: 400 });

    // Fetch order
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, deliveryTracking: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Block re-shipping delivered orders
    if (TERMINAL_STATUSES.has(order.status)) {
        return NextResponse.json(
            { error: `Cannot book shipment for an order with status ${order.status}` },
            { status: 409 }
        );
    }

    if (order.items.length === 0) {
        return NextResponse.json({ error: "Order has no items" }, { status: 422 });
    }

    const paymentMethod = order.paymentMethod?.toLowerCase() === "cod" ? "COD" : "Prepaid";

    let result;
    try {
        result = await createForwardShipment({
            orderNumber: order.orderNumber,
            orderDate: order.createdAt.toISOString().split("T")[0],
            billingName: order.shippingName,
            billingPhone: order.shippingPhone ?? "9999999999",
            billingEmail: order.shippingEmail ?? "",
            billingAddress: [order.shippingAddress, order.shippingApartment].filter(Boolean).join(", "),
            billingCity: order.shippingCity,
            billingPincode: order.shippingZip,
            billingState: order.shippingState,
            paymentMethod,
            codAmount: paymentMethod === "COD" ? order.total : undefined,
            subTotal: order.total,
            weight: w,
            length: l,
            breadth: b,
            height: h,
            items: order.items.map((i) => ({
                name: i.productName,
                sku: i.sku ?? i.productName,
                units: i.quantity,
                selling_price: i.price,
            })),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Shipment creation failed";
        console.error("[Shiprocket create-shipment]", msg);
        return NextResponse.json({ error: msg }, { status: 422 });
    }

    const now = new Date().toISOString();
    const metaEntry: HistoryEntry = {
        status: "_meta",
        description: `srOrderId:${result.srOrderId}|shipmentId:${result.shipmentId}`,
        timestamp: now,
        location: "",
    };
    const shippedEntry: HistoryEntry = {
        status: "Shipped",
        description: `Booked via Shiprocket — ${result.courierName}`,
        timestamp: now,
        location: "",
    };

    // Persist tracking — upsert manually to handle existing history correctly
    const existing = order.deliveryTracking;
    if (existing) {
        const prevHistory: HistoryEntry[] = Array.isArray(existing.history) ? (existing.history as HistoryEntry[]) : [];
        const filtered = prevHistory.filter((h) => h.status !== "_meta");
        await prisma.deliveryTracking.update({
            where: { id: existing.id },
            data: {
                trackingNumber: result.awb,
                carrier: "Shiprocket",
                currentStatus: "Shipped",
                history: [metaEntry, ...filtered, shippedEntry],
            },
        });
    } else {
        await prisma.deliveryTracking.create({
            data: {
                orderId,
                trackingNumber: result.awb,
                carrier: "Shiprocket",
                currentStatus: "Shipped",
                history: [metaEntry, shippedEntry],
            },
        });
    }

    await prisma.order.update({ where: { id: orderId }, data: { status: "SHIPPED" } });

    return NextResponse.json({
        awb: result.awb,
        srOrderId: result.srOrderId,
        shipmentId: result.shipmentId,
        courierName: result.courierName,
    });
}
