import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // All COD orders that are DELIVERED
    const deliveredCOD = await prisma.order.findMany({
        where: { paymentMethod: "COD", status: "DELIVERED" },
        select: {
            id: true,
            orderNumber: true,
            total: true,
            shippingName: true,
            shippingCity: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const totalCollected = deliveredCOD.reduce((s, o) => s + o.total, 0);

    // Group by date
    const byDate: Record<string, { date: string; orders: typeof deliveredCOD; amount: number }> = {};
    for (const order of deliveredCOD) {
        const date = order.createdAt.toISOString().split("T")[0];
        if (!byDate[date]) byDate[date] = { date, orders: [], amount: 0 };
        byDate[date].orders.push(order);
        byDate[date].amount += order.total;
    }

    return NextResponse.json({
        totalCollected,
        totalRemitted: 0, // Manual tracking — not automated
        pendingRemittance: totalCollected,
        orders: deliveredCOD,
        byDate: Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)),
    });
}
