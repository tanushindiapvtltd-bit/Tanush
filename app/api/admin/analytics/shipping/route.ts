import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [allOrders, deliveryTrackings, rtoCases] = await Promise.all([
        prisma.order.findMany({
            select: {
                id: true,
                status: true,
                paymentMethod: true,
                total: true,
                createdAt: true,
            },
        }),
        prisma.deliveryTracking.findMany({
            select: {
                currentStatus: true,
                createdAt: true,
                carrier: true,
            },
        }),
        prisma.rtoCase.count(),
    ]);

    const shipped = allOrders.filter(o => ["SHIPPED", "DELIVERED", "CANCELLED"].includes(o.status));
    const delivered = allOrders.filter(o => o.status === "DELIVERED");
    const cod = allOrders.filter(o => o.paymentMethod === "COD");
    const prepaid = allOrders.filter(o => o.paymentMethod === "RAZORPAY");

    const deliveryRate = shipped.length > 0 ? Math.round((delivered.length / shipped.length) * 100) : 0;
    const rtoRate = shipped.length > 0 ? Math.round((rtoCases / shipped.length) * 100) : 0;

    // Weekly delivery trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
    });
    const weeklyDeliveries = last7Days.map(date => ({
        date,
        count: allOrders.filter(o => o.status === "DELIVERED" && o.createdAt.toISOString().split("T")[0] === date).length,
    }));

    // Status distribution
    const statusCounts: Record<string, number> = {};
    for (const o of allOrders) {
        statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    }
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // RTO trend (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split("T")[0];
    });
    const rtoTrend = last30Days.map(date => ({ date, count: 0 })); // RTO cases don't have timestamps in simple count

    return NextResponse.json({
        summary: {
            totalOrders: allOrders.length,
            shipped: shipped.length,
            delivered: delivered.length,
            deliveryRate,
            rtoCases,
            rtoRate,
            codCount: cod.length,
            prepaidCount: prepaid.length,
            codAmount: cod.reduce((s, o) => s + o.total, 0),
            prepaidAmount: prepaid.reduce((s, o) => s + o.total, 0),
        },
        weeklyDeliveries,
        statusDistribution,
        rtoTrend,
        carrierBreakdown: [
            { name: "Delhivery", count: deliveryTrackings.filter(t => t.carrier === "Delhivery").length },
            { name: "Other", count: deliveryTrackings.filter(t => t.carrier && t.carrier !== "Delhivery").length },
            { name: "Not Assigned", count: deliveryTrackings.filter(t => !t.carrier).length },
        ],
    });
}
