import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    const { productId } = await params;

    const reviews = await prisma.review.findMany({
        where: {
            productId: parseInt(productId),
            approved: true,
        },
        include: {
            user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Please sign in to leave a review" }, { status: 401 });
    }

    const { productId } = await params;
    const { rating, title, body, imageUrl } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!body?.trim() || body.trim().length < 10) {
        return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
    }
    if (body.trim().length > 1000) {
        return NextResponse.json({ error: "Review must be under 1000 characters" }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
        where: { userId: session.user.id, productId: parseInt(productId) },
    });
    if (existing) {
        return NextResponse.json(
            { error: "You have already reviewed this product" },
            { status: 409 }
        );
    }

    const review = await prisma.review.create({
        data: {
            userId: session.user.id,
            productId: parseInt(productId),
            rating: parseInt(rating),
            title: title?.trim() || null,
            body: body.trim(),
            imageUrl: imageUrl || null,
            approved: true,
        },
        include: {
            user: { select: { name: true } },
        },
    });

    return NextResponse.json(review, { status: 201 });
}
