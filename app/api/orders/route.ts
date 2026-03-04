import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TAN-${timestamp}-${random}`;
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
            items: true,
            deliveryTracking: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
        items,
        shippingName,
        shippingEmail,
        shippingPhone,
        shippingAddress,
        shippingApartment,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        shippingMethod,
        paymentMethod,
        razorpayOrderId,
    } = body;

    if (!items?.length || !shippingName || !shippingAddress || !paymentMethod) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["COD", "RAZORPAY"].includes(paymentMethod)) {
        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Validate item quantities
    for (const item of items) {
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
            return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
        }
    }

    try {
        // Fetch authoritative prices from DB — never trust client-provided totals
        const productIds = items.map((i: { productId: number }) => Number(i.productId));
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, inStock: true, name: true, priceNum: true },
        });
        const outOfStock = dbProducts.filter((p) => !p.inStock);
        if (outOfStock.length > 0) {
            return NextResponse.json(
                { error: `The following items are out of stock: ${outOfStock.map((p) => p.name).join(", ")}` },
                { status: 409 }
            );
        }
        const missingProducts = productIds.filter((id: number) => !dbProducts.find((p) => p.id === id));
        if (missingProducts.length > 0) {
            return NextResponse.json({ error: "One or more products no longer exist" }, { status: 404 });
        }

        // Server-side total calculation — authoritative, not client-provided
        const priceMap = new Map(dbProducts.map((p) => [p.id, p.priceNum]));
        const subtotal = items.reduce((sum: number, item: { productId: number; quantity: number }) =>
            sum + (priceMap.get(Number(item.productId)) ?? 0) * Number(item.quantity), 0);
        const resolvedShipping = shippingMethod === "express" ? 2500 : 0;
        const tax = Math.round(subtotal * 0.03);
        const total = subtotal + resolvedShipping + tax;

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                orderNumber: generateOrderNumber(),
                status: "PENDING",
                paymentMethod: paymentMethod === "COD" ? "COD" : "RAZORPAY",
                paymentStatus: "PENDING",
                subtotal,
                shippingCost: resolvedShipping,
                tax,
                total,
                shippingName,
                shippingEmail,
                shippingPhone: shippingPhone || null,
                shippingAddress,
                shippingApartment: shippingApartment || null,
                shippingCity,
                shippingState,
                shippingZip,
                shippingCountry: shippingCountry ?? "India",
                shippingMethod: shippingMethod ?? "standard",
                razorpayOrderId: razorpayOrderId || null,
                items: {
                    create: items.map((item: {
                        productId: number;
                        productName: string;
                        productImage: string;
                        price: number;
                        quantity: number;
                    }) => ({
                        productId: item.productId,
                        productName: item.productName,
                        productImage: item.productImage,
                        price: Math.round(item.price),
                        quantity: item.quantity,
                    })),
                },
                deliveryTracking: {
                    create: {
                        currentStatus: "Order Placed",
                        history: [
                            {
                                status: "Order Placed",
                                description: "Your order has been placed successfully",
                                timestamp: new Date().toISOString(),
                                location: "",
                            },
                        ],
                    },
                },
            },
            include: {
                items: true,
                deliveryTracking: true,
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("[Orders] Create order error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: "Failed to create order. Please try again.", detail: msg }, { status: 500 });
    }
}
