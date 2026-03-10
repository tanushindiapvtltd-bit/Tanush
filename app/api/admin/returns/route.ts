import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const returns = await prisma.returnRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    total: true,
                    shippingName: true,
                    shippingEmail: true,
                    shippingPhone: true,
                    shippingAddress: true,
                    shippingCity: true,
                    shippingState: true,
                    shippingZip: true,
                    shippingCountry: true,
                    items: { select: { productName: true, quantity: true, price: true } },
                    deliveryTracking: { select: { trackingNumber: true } },
                },
            },
            user: { select: { name: true, email: true } },
        },
    });

    return NextResponse.json(returns);
}
