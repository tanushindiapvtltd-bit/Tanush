import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
        return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
        where: { id: numericId },
    });

    if (!product) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
}
