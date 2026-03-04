import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const returns = await prisma.return.findMany({
        include: {
            order: {
                select: {
                    orderNumber: true,
                    shippingName: true,
                    shippingPhone: true,
                    shippingAddress: true,
                    shippingCity: true,
                    shippingState: true,
                    shippingZip: true,
                    total: true,
                    items: { select: { productName: true, quantity: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(returns);
}
