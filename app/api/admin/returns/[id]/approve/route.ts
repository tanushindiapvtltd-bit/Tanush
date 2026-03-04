import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createReversePickup } from "@/lib/delhivery";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const returnRecord = await prisma.return.findUnique({
        where: { id },
        include: {
            order: {
                include: {
                    items: { select: { productName: true, quantity: true } },
                },
            },
        },
    });

    if (!returnRecord) return NextResponse.json({ error: "Return not found" }, { status: 404 });
    if (returnRecord.status !== "REQUESTED") return NextResponse.json({ error: "Return is not in REQUESTED state" }, { status: 400 });

    const order = returnRecord.order;
    const productDesc = order.items.map(i => `${i.productName} x${i.quantity}`).join(", ");

    try {
        const result = await createReversePickup({
            customerName: order.shippingName,
            customerAddress: order.shippingAddress,
            customerPincode: order.shippingZip,
            customerCity: order.shippingCity,
            customerState: order.shippingState,
            customerPhone: order.shippingPhone ?? process.env.DELHIVERY_RETURN_PHONE ?? "9999999999",
            originalOrderNumber: order.orderNumber,
            totalAmount: order.total,
            productDesc,
            weight: 0.5,
        });

        await prisma.return.update({
            where: { id },
            data: {
                status: "AWB_CREATED",
                reverseAwb: result.waybill,
                approvedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, reverseAwb: result.waybill });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create reverse pickup" }, { status: 502 });
    }
}
