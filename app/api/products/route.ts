import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");

    const where = category ? { categoryKey: category } : {};

    const products = await prisma.product.findMany({
        where,
        orderBy: { id: "asc" },
    });

    return NextResponse.json(products);
}
