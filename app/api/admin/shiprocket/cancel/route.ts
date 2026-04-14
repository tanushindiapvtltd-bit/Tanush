import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelOrder } from "@/lib/shiprocket";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { orderId, srOrderId } = body as Record<string, unknown>;

    if (!orderId || typeof orderId !== "string" || !UUID_RE.test(orderId)) {
        return NextResponse.json({ error: "orderId must be a valid UUID" }, { status: 400 });
    }

    const srId = Number(srOrderId);
    if (!Number.isInteger(srId) || srId <= 0) {
        return NextResponse.json({ error: "srOrderId must be a positive integer" }, { status: 400 });
    }

    // Verify the order exists and belongs to a Shiprocket tracking record
    const existing = await prisma.deliveryTracking.findFirst({ where: { orderId } });
    if (!existing) {
        return NextResponse.json({ error: "No delivery tracking record found for this order" }, { status: 404 });
    }
    if (existing.carrier !== "Shiprocket") {
        return NextResponse.json({ error: "This order is not tracked via Shiprocket" }, { status: 409 });
    }

    // Cancel on Shiprocket — throws on failure, so DB is only updated on success
    let result: { success: boolean; message: string };
    try {
        result = await cancelOrder([srId]);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Cancel failed";
        console.error("[Shiprocket cancel]", msg);
        return NextResponse.json({ error: msg }, { status: 502 });
    }

    // Only clear tracking and update order after confirmed cancellation
    type H = { status: string; description: string; timestamp: string; location: string };
    const history: H[] = Array.isArray(existing.history) ? (existing.history as H[]) : [];

    await prisma.deliveryTracking.update({
        where: { id: existing.id },
        data: {
            currentStatus: "Cancelled",
            trackingNumber: null,
            carrier: null,
            history: [
                ...history,
                {
                    status: "Cancelled",
                    description: `Shipment cancelled via Shiprocket (SR Order ID: ${srId})`,
                    timestamp: new Date().toISOString(),
                    location: "",
                },
            ],
        },
    });

    await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });

    return NextResponse.json(result);
}
