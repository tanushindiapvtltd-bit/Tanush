import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // Accept items + shippingMethod to recalculate server-side
    // Falls back to legacy `amount` field for backwards compatibility (checkout page sends items now)
    const { items, shippingMethod } = body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    let amountInPaise: number;

    if (Array.isArray(items) && items.length > 0) {
        // ── Preferred path: recalculate total from DB prices ──────────────────
        const productIds: number[] = items.map((i: { productId: number }) => Number(i.productId));

        // Validate quantities
        for (const item of items) {
            const qty = Number(item.quantity);
            if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
                return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
            }
        }

        let dbProducts;
        try {
            dbProducts = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, priceNum: true, inStock: true },
            });
        } catch (dbError) {
            console.error("[Razorpay] DB error fetching products:", dbError);
            return NextResponse.json({ error: "Failed to fetch product details. Please try again." }, { status: 500 });
        }

        if (dbProducts.length !== productIds.length) {
            return NextResponse.json({ error: "One or more products not found" }, { status: 404 });
        }
        if (dbProducts.some((p) => !p.inStock)) {
            return NextResponse.json({ error: "One or more items are out of stock" }, { status: 409 });
        }

        const priceMap = new Map(dbProducts.map((p) => [p.id, p.priceNum]));
        const subtotal = items.reduce(
            (sum: number, item: { productId: number; quantity: number }) =>
                sum + (priceMap.get(Number(item.productId)) ?? 0) * Number(item.quantity),
            0
        );
        const shipping = shippingMethod === "express" ? 2500 : 0;
        const tax = Math.round(subtotal * 0.03);
        const total = subtotal + shipping + tax;

        if (total <= 0) {
            return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
        }

        amountInPaise = total * 100; // convert rupees → paise
    } else {
        return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    try {
        const Razorpay = (await import("razorpay")).default;
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,       // paise — used by Razorpay modal
            currency: order.currency,
        });
    } catch (error) {
        console.error("[Razorpay] Create order error:", error);
        return NextResponse.json({ error: "Payment gateway error" }, { status: 500 });
    }
}
