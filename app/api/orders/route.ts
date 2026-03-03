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
        subtotal,
        shippingCost,
        tax,
        total,
        razorpayOrderId,
    } = body;

    if (!items?.length || !shippingName || !shippingAddress || !paymentMethod) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["COD", "RAZORPAY"].includes(paymentMethod)) {
        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Validate all items are in stock
    const productIds = items.map((i: { productId: number }) => i.productId);
    const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, inStock: true, name: true },
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

    const order = await prisma.order.create({
        data: {
            userId: session.user.id,
            orderNumber: generateOrderNumber(),
            status: "PENDING",
            paymentMethod: paymentMethod === "COD" ? "COD" : "RAZORPAY",
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
            subtotal: Math.round(subtotal),
            shippingCost: Math.round(shippingCost ?? 0),
            tax: Math.round(tax ?? 0),
            total: Math.round(total),
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
}
