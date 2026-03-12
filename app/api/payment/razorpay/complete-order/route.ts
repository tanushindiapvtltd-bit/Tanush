import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import crypto from "crypto";

function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TAN-${timestamp}-${random}`;
}

/**
 * POST /api/payment/razorpay/complete-order
 *
 * Called after Razorpay payment succeeds. Does NOT require an active session —
 * instead, it:
 *   1. Verifies the Razorpay signature cryptographically (proves the payment is real)
 *   2. Looks up the userId from PendingRazorpayOrder (stored when user was authenticated)
 *   3. Creates the DB order + marks it PAID/CONFIRMED in one transaction
 *
 * This fixes the mobile UPI redirect issue where the session cookie is lost
 * when the browser returns from the UPI app.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
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
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }
    if (!items?.length || !shippingName || !shippingAddress) {
        return NextResponse.json({ error: "Missing order fields" }, { status: 400 });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // 1. Verify Razorpay signature — this proves the payment happened in our account
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Idempotency: if an order already exists for this razorpay order, return it
    const existingOrder = await prisma.order.findFirst({
        where: { razorpayOrderId },
    });
    if (existingOrder) {
        return NextResponse.json(existingOrder);
    }

    // 3. Look up userId from the pending record (created when user was authenticated)
    const pending = await prisma.pendingRazorpayOrder.findUnique({
        where: { razorpayOrderId },
    });
    if (!pending) {
        return NextResponse.json(
            { error: "Payment session expired. Please contact support with your payment ID: " + razorpayPaymentId },
            { status: 404 }
        );
    }
    if (pending.expiresAt < new Date()) {
        return NextResponse.json(
            { error: "Payment session expired. Please contact support with your payment ID: " + razorpayPaymentId },
            { status: 410 }
        );
    }

    const userId = pending.userId;

    // 4. Validate item quantities
    for (const item of items) {
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
            return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
        }
    }

    // 5. Fetch authoritative prices from DB — never trust client totals
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

    // 6. Server-side total calculation
    const priceMap = new Map(dbProducts.map((p) => [p.id, p.priceNum]));
    const subtotal = items.reduce(
        (sum: number, item: { productId: number; quantity: number }) =>
            sum + (priceMap.get(Number(item.productId)) ?? 0) * Number(item.quantity),
        0
    );
    let resolvedShipping: number;
    if (shippingMethod === "express") {
        resolvedShipping = 2500;
    } else if (subtotal > 499) {
        resolvedShipping = 0; // prepaid: free above ₹499
    } else {
        resolvedShipping = 100;
    }
    const tax = Math.round(subtotal * 0.03);
    const total = subtotal + resolvedShipping + tax;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    try {
        // 7. Create order + mark PAID in a transaction
        const order = await prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    userId,
                    orderNumber: generateOrderNumber(),
                    status: "CONFIRMED",
                    paymentMethod: "RAZORPAY",
                    paymentStatus: "PAID",
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
                    razorpayOrderId,
                    razorpayPaymentId,
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
                            currentStatus: "Confirmed",
                            estimatedDelivery,
                            history: [
                                {
                                    status: "Order Placed",
                                    description: "Your order has been placed successfully",
                                    timestamp: new Date().toISOString(),
                                    location: "",
                                },
                                {
                                    status: "Confirmed",
                                    description: "Payment confirmed. Your order is being processed.",
                                    timestamp: new Date().toISOString(),
                                    location: "",
                                },
                            ],
                        },
                    },
                },
                include: { items: true, deliveryTracking: true },
            });

            // Clean up the pending record
            await tx.pendingRazorpayOrder.delete({ where: { razorpayOrderId } });

            return created;
        });

        // 8. Send confirmation email (non-blocking)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
        });
        if (user) {
            sendOrderConfirmationEmail(
                user.email,
                user.name,
                order.orderNumber,
                order.items.map((i) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
                order.subtotal,
                order.shippingCost,
                order.tax,
                order.total,
                order.paymentMethod,
                estimatedDelivery,
            ).catch(console.error);
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("[complete-order] Error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: "Failed to save order. Please contact support with your payment ID: " + razorpayPaymentId, detail: msg },
            { status: 500 }
        );
    }
}
