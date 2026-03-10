import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelShipment } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { waybill, orderId } = await req.json();
    if (!waybill) return NextResponse.json({ error: "waybill required" }, { status: 400 });

    const result = await cancelShipment(waybill);

    if (result.success && orderId) {
        // Update DB
        const existing = await prisma.deliveryTracking.findFirst({
            where: { trackingNumber: waybill },
        });
        if (existing) {
            type HistoryEntry = { status: string; description: string; timestamp: string; location: string };
            const history: HistoryEntry[] =
                Array.isArray(existing.history) ? (existing.history as HistoryEntry[]) : [];
            await prisma.deliveryTracking.update({
                where: { id: existing.id },
                data: {
                    trackingNumber: null,
                    carrier: null,
                    currentStatus: "Cancelled",
                    history: [
                        ...history,
                        {
                            status: "Cancelled",
                            description: `Shipment ${waybill} cancelled via Delhivery One`,
                            timestamp: new Date().toISOString(),
                            location: "",
                        },
                    ],
                },
            });
        }
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
        });
    }

    return NextResponse.json(result);
}
