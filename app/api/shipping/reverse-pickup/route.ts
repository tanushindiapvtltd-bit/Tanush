import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RETURN_WINDOW_DAYS = 7;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, reason } = await req.json();
    if (!orderId || !reason?.trim()) {
        return NextResponse.json({ error: "orderId and reason required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { deliveryTracking: true, returnRequest: true },
    });

    if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "DELIVERED") {
        return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 });
    }

    if (order.returnRequest) {
        return NextResponse.json({ error: "Return already requested" }, { status: 409 });
    }

    // Check 7-day window from last delivery history entry
    const rawHistory = order.deliveryTracking?.history;
    const history = Array.isArray(rawHistory) ? rawHistory : [];
    const deliveredEntry = [...history].reverse().find(
        (h) => typeof h === "object" && h !== null && (h as { status?: string }).status === "Delivered"
    );
    if (deliveredEntry) {
        const deliveredAt = new Date((deliveredEntry as { timestamp: string }).timestamp);
        const daysSince = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > RETURN_WINDOW_DAYS) {
            return NextResponse.json(
                { error: `Return window of ${RETURN_WINDOW_DAYS} days has passed` },
                { status: 400 }
            );
        }
    }

    const returnRequest = await prisma.return.create({
        data: {
            orderId,
            reason: reason.trim(),
            status: "REQUESTED",
        },
    });

    return NextResponse.json(returnRequest, { status: 201 });
}
