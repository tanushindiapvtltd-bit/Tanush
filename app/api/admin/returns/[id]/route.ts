import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createReverseShipment } from "@/lib/delhivery";
import {
    sendReturnApprovedEmail,
    sendReturnRejectedEmail,
    sendReturnReceivedEmail,
    sendRefundProcessedEmail,
    sendRefundFailedEmail,
} from "@/lib/email";

const VALID_ACTIONS = ["approve", "reject", "mark_received", "process_refund"] as const;
type Action = typeof VALID_ACTIONS[number];

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNote, rejectionReason, inspectionNotes } = body as {
        action: Action;
        adminNote?: string;
        rejectionReason?: string;
        inspectionNotes?: string;
    };

    if (!VALID_ACTIONS.includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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

    const { order, user } = returnRequest;

    // ── APPROVE ────────────────────────────────────────────────────────────────
    if (action === "approve") {
        if (returnRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Only pending requests can be approved" }, { status: 400 });
        }

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
                { error: `Failed to create return shipment: ${e instanceof Error ? e.message : String(e)}` },
                { status: 502 }
            );
        }

        await prisma.returnRequest.update({
            where: { id },
            data: { status: "APPROVED", adminNote: adminNote ?? null, returnWaybill },
        });

        sendReturnApprovedEmail(
            user.email, user.name, order.orderNumber,
            returnWaybill, returnRequest.refundAmount
        ).catch(console.error);

        return NextResponse.json({ success: true, status: "APPROVED", returnWaybill });
    }

    // ── REJECT ─────────────────────────────────────────────────────────────────
    if (action === "reject") {
        if (returnRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Only pending requests can be rejected" }, { status: 400 });
        }

        await prisma.returnRequest.update({
            where: { id },
            data: {
                status: "REJECTED",
                adminNote: adminNote ?? null,
                rejectionReason: rejectionReason ?? adminNote ?? null,
            },
        });

        sendReturnRejectedEmail(
            user.email, user.name, order.orderNumber,
            rejectionReason ?? adminNote ?? ""
        ).catch(console.error);

        return NextResponse.json({ success: true, status: "REJECTED" });
    }

    // ── MARK RECEIVED ──────────────────────────────────────────────────────────
    if (action === "mark_received") {
        if (returnRequest.status !== "APPROVED") {
            return NextResponse.json({ error: "Only approved returns can be marked as received" }, { status: 400 });
        }

        await prisma.returnRequest.update({
            where: { id },
            data: {
                status: "RECEIVED",
                inspectionNotes: inspectionNotes ?? null,
                receivedAt: new Date(),
            },
        });

        sendReturnReceivedEmail(
            user.email, user.name, order.orderNumber, returnRequest.refundAmount
        ).catch(console.error);

        return NextResponse.json({ success: true, status: "RECEIVED" });
    }

    // ── PROCESS REFUND ─────────────────────────────────────────────────────────
    if (action === "process_refund") {
        if (returnRequest.status !== "RECEIVED") {
            return NextResponse.json({ error: "Only received returns can be refunded" }, { status: 400 });
        }

        const refundAmount = returnRequest.refundAmount;
        const paymentMethod = order.paymentMethod;
        const razorpayPaymentId = order.razorpayPaymentId;

        // COD orders: manual refund — just mark processed
        if (paymentMethod === "COD") {
            await prisma.returnRequest.update({
                where: { id },
                data: {
                    status: "REFUND_PROCESSED",
                    refundStatus: "SUCCESSFUL",
                    refundProcessedAt: new Date(),
                    refundProcessedBy: session.user.id,
                    adminNote: adminNote ?? "Manual refund processed for COD order",
                },
            });

            sendRefundProcessedEmail(
                user.email, user.name, order.orderNumber,
                refundAmount, order.deliveryTracking?.trackingNumber ?? null, null
            ).catch(console.error);

            return NextResponse.json({ success: true, status: "REFUND_PROCESSED", method: "manual_cod" });
        }

        // Razorpay refund
        if (!razorpayPaymentId) {
            return NextResponse.json({ error: "No Razorpay payment ID found for this order" }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
        }

        try {
            const Razorpay = (await import("razorpay")).default;
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            const refund = await razorpay.payments.refund(razorpayPaymentId, {
                amount: refundAmount * 100, // rupees → paise
                notes: {
                    reason: "Product Return",
                    order_number: order.orderNumber,
                    return_request_id: id,
                },
            });

            await prisma.returnRequest.update({
                where: { id },
                data: {
                    status: "REFUND_PROCESSED",
                    refundStatus: "SUCCESSFUL",
                    razorpayRefundId: refund.id,
                    refundProcessedAt: new Date(),
                    refundProcessedBy: session.user.id,
                    adminNote: adminNote ?? null,
                },
            });

            // Update order payment status to REFUNDED
            await prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: "REFUNDED" },
            });

            sendRefundProcessedEmail(
                user.email, user.name, order.orderNumber,
                refundAmount, null, refund.id
            ).catch(console.error);

            return NextResponse.json({ success: true, status: "REFUND_PROCESSED", razorpayRefundId: refund.id });

        } catch (e) {
            const reason = e instanceof Error ? e.message : String(e);

            await prisma.returnRequest.update({
                where: { id },
                data: {
                    status: "REFUND_FAILED",
                    refundStatus: "FAILED",
                    refundFailureReason: reason,
                    refundProcessedAt: new Date(),
                    refundProcessedBy: session.user.id,
                },
            });

            sendRefundFailedEmail(user.email, user.name, order.orderNumber, refundAmount).catch(console.error);

            return NextResponse.json({ error: `Refund failed: ${reason}`, status: "REFUND_FAILED" }, { status: 502 });
        }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
