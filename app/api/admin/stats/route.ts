import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalReviews,
        pendingOrders,
        revenueResult,
        recentOrders,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.count(),
        prisma.review.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.aggregate({
            where: { paymentStatus: "PAID" },
            _sum: { total: true },
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } }, items: true },
        }),
    ]);

    return NextResponse.json({
        totalUsers,
        totalOrders,
        totalProducts,
        totalReviews,
        pendingOrders,
        totalRevenue: revenueResult._sum.total ?? 0,
        recentOrders,
    });
}
