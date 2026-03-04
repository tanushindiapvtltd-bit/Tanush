import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateManifest } from "@/lib/delhivery";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const unmanifested = await prisma.deliveryTracking.findMany({
        where: {
            carrier: "Delhivery",
            isManifested: false,
            trackingNumber: { not: null },
        },
        include: { order: { select: { orderNumber: true, shippingName: true, shippingCity: true, createdAt: true } } },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ count: unmanifested.length, items: unmanifested });
}

export async function POST() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const unmanifested = await prisma.deliveryTracking.findMany({
        where: {
            carrier: "Delhivery",
            isManifested: false,
            trackingNumber: { not: null },
        },
        select: { id: true, trackingNumber: true },
    });

    if (unmanifested.length === 0) {
        return NextResponse.json({ error: "No unmanifested shipments found" }, { status: 400 });
    }

    const waybills = unmanifested.map(s => s.trackingNumber!);
    const result = await generateManifest(waybills);

    if (!result.success) {
        return NextResponse.json({ error: "Manifest generation failed" }, { status: 502 });
    }

    const now = new Date();
    await prisma.deliveryTracking.updateMany({
        where: { id: { in: unmanifested.map(s => s.id) } },
        data: { isManifested: true, manifestedAt: now },
    });

    return NextResponse.json({ success: true, count: waybills.length, manifestUrl: result.manifestUrl });
}
