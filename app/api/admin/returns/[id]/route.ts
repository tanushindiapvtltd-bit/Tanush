import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createReverseShipment } from "@/lib/delhivery";
import { sendReturnApprovedEmail, sendReturnRejectedEmail } from "@/lib/email";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { action, adminNote } = await req.json(); // action: "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
        return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
    }

    const returnRequest = await prisma.returnRequest.findUnique({
        where: { id },
        include: {
            order: {
                include: {
                    items: true,
                    deliveryTracking: true,
                },
            },
            user: { select: { name: true, email: true } },
        },
    });

    if (!returnRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (returnRequest.status !== "PENDING") {
        return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    const { order, user } = returnRequest;

    if (action === "reject") {
        await prisma.returnRequest.update({
            where: { id },
            data: { status: "REJECTED", adminNote: adminNote ?? null },
        });
        // Notify user
        await sendReturnRejectedEmail(user.email, user.name, order.orderNumber, adminNote ?? "").catch(console.error);
        return NextResponse.json({ success: true, status: "REJECTED" });
    }

    // Approve: create Delhivery reverse shipment
    let returnWaybill = "";
    try {
        const productsDesc = order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ");
        const result = await createReverseShipment({
            orderNumber: order.orderNumber,
            customerName: order.shippingName,
            customerPhone: order.shippingPhone ?? "9999999999",
            customerAddress: order.shippingAddress,
            customerPin: order.shippingZip,
            customerCity: order.shippingCity,
            customerState: order.shippingState,
            productsDesc,
            quantity: order.items.reduce((s, i) => s + i.quantity, 0),
            weight: 500,
            totalAmount: order.total,
        });
        returnWaybill = result.waybill;
    } catch (e) {
        return NextResponse.json(
            { error: `Failed to create Delhivery return: ${e instanceof Error ? e.message : String(e)}` },
            { status: 502 }
        );
    }

    await prisma.returnRequest.update({
        where: { id },
        data: { status: "APPROVED", adminNote: adminNote ?? null, returnWaybill },
    });

    // Notify user
    await sendReturnApprovedEmail(user.email, user.name, order.orderNumber, returnWaybill).catch(console.error);

    return NextResponse.json({ success: true, status: "APPROVED", returnWaybill });
}
