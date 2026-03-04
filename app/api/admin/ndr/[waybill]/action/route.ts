import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateNDRAction } from "@/lib/delhivery";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ waybill: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { waybill } = await params;
    const body = await req.json();
    const { action, newAddress } = body as {
        action: "reattempt" | "address_update" | "cancel";
        newAddress?: { address: string; city: string; pincode: string; phone: string };
    };

    if (!["reattempt", "address_update", "cancel"].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    try {
        const result = await updateNDRAction(waybill, action, newAddress);

        // Update ndrCount in DB for this tracking
        await prisma.deliveryTracking.updateMany({
            where: { trackingNumber: waybill },
            data: { ndrCount: { increment: 1 }, ndrReason: body.reason ?? undefined },
        });

        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Action failed" }, { status: 502 });
    }
}
