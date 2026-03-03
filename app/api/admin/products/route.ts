import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
        orderBy: { id: "asc" },
        include: {
            _count: { select: { reviews: true, orderItems: true } },
        },
    });

    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, priceNum, category, categoryKey, mainImage, thumbs, description, specs, inStock } = body;

    if (!name || !price || !priceNum || !category || !categoryKey || !mainImage || !description) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
        data: {
            name,
            price,
            priceNum: parseInt(priceNum),
            category,
            categoryKey,
            mainImage,
            thumbs: thumbs ?? [],
            description,
            specs: specs ?? [],
            inStock: inStock !== false,
        },
    });

    return NextResponse.json(product, { status: 201 });
}
