import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");

    const where = category ? { categoryKey: category } : {};

    const products = await prisma.product.findMany({
        where,
        orderBy: { id: "asc" },
        include: { reviews: { select: { rating: true } } },
    });

    const result = products.map(({ reviews, ...p }) => {
        const count = reviews.length;
        const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
        return { ...p, avgRating: Math.round(avg * 10) / 10, reviewCount: count };
    });

    return NextResponse.json(result);
}
