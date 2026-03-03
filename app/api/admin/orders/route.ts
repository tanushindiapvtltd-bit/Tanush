import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
        include: {
            user: { select: { name: true, email: true } },
            items: true,
            deliveryTracking: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
}
