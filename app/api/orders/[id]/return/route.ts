import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnRequestConfirmationEmail } from "@/lib/email";

const RETURN_WINDOW_DAYS = 7;

const VALID_REASONS = ["DAMAGED", "WRONG_ITEM", "QUALITY_ISSUE", "CHANGED_MIND", "OTHER"] as const;
type ReturnReason = typeof VALID_REASONS[number];

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const body = await req.json();
    const { returnReason, description, proofImages } = body as {
        returnReason: ReturnReason;
        description: string;
        proofImages: string[];
    };

    if (!returnReason || !VALID_REASONS.includes(returnReason)) {
        return NextResponse.json({ error: "Valid return reason is required" }, { status: 400 });
    }
    if (!description?.trim()) {
        return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id },
        include: { deliveryTracking: true, returnRequests: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "DELIVERED") {
        return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 });
    }

    // Check return window from delivery
    const deliveredAt = order.deliveryTracking?.deliveredAt ?? order.deliveryTracking?.updatedAt;
    if (!deliveredAt) {
        return NextResponse.json({ error: "Delivery date not found" }, { status: 400 });
    }
    const daysSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
        return NextResponse.json({ error: `Return window of ${RETURN_WINDOW_DAYS} days has passed` }, { status: 400 });
    }

    // One active return request per order
    const existing = order.returnRequests.find((r) => r.status !== "REJECTED");
    if (existing) {
        return NextResponse.json({ error: "A return request already exists for this order" }, { status: 400 });
    }

    // Calculate refund amount: subtotal + tax (delivery charges excluded)
    const refundAmount = order.subtotal + order.tax;
    const deliveryCharges = order.shippingCost;

    const images = Array.isArray(proofImages) ? proofImages.slice(0, 5) : [];

    const returnRequest = await prisma.returnRequest.create({
        data: {
            orderId,
            userId: session.user.id,
            returnReason,
            reason: description.trim(),
            proofImages: images,
            refundAmount,
            deliveryCharges,
        },
    });

    // Send confirmation email (non-blocking)
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })
        .then((user) => {
            if (user) {
                sendReturnRequestConfirmationEmail(
                    user.email,
                    user.name,
                    order.orderNumber,
                    returnReason,
                    refundAmount,
                    deliveryCharges,
                ).catch(console.error);
            }
        })
        .catch(console.error);

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
