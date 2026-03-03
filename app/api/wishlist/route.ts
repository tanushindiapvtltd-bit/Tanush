import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
        return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    try {
        const item = await prisma.wishlistItem.create({
            data: { userId: session.user.id, productId: parseInt(productId) },
        });
        return NextResponse.json(item, { status: 201 });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                return NextResponse.json({ error: "Already in wishlist" }, { status: 409 });
            }
            if (e.code === "P2003") {
                return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }
        }
        return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const productId = searchParams.get("productId");
    if (!productId) {
        return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
        where: {
            userId: session.user.id,
            productId: parseInt(productId),
        },
    });

    return NextResponse.json({ success: true });
}
