import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelShipment } from "@/lib/delhivery";

type HistoryEntry = { status: string; description: string; timestamp: string; location: string };

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { waybill, orderId } = await req.json();
    if (!waybill) return NextResponse.json({ error: "waybill required" }, { status: 400 });

    let result;
    try {
        result = await cancelShipment(waybill);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }

    if (orderId) {
        const tracking = await prisma.deliveryTracking.findFirst({ where: { orderId } });
        if (tracking) {
            const rawHistory = tracking.history;
            const history: HistoryEntry[] = Array.isArray(rawHistory)
                ? (rawHistory as HistoryEntry[])
                : typeof rawHistory === "string"
                ? JSON.parse(rawHistory)
                : [];

            history.push({
                status: "Cancelled",
                description: `Delhivery shipment cancelled. ${result.message}`,
                timestamp: new Date().toISOString(),
                location: "",
            });

            await prisma.deliveryTracking.update({
                where: { orderId },
                data: { currentStatus: "Cancelled", trackingNumber: null, carrier: null, history },
            });
            await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
        }
    }

    return NextResponse.json(result);
}
