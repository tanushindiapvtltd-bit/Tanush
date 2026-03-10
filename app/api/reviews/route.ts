import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const reviews = await prisma.review.findMany({
        where: { approved: true },
        include: {
            user: { select: { name: true } },
            product: { select: { id: true, name: true, mainImage: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
}
