import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePickup } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { shipmentIds } = body as Record<string, unknown>;

    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
        return NextResponse.json({ error: "shipmentIds must be a non-empty array" }, { status: 400 });
    }

    // Validate every entry is a positive integer
    const ids: number[] = [];
    for (let i = 0; i < shipmentIds.length; i++) {
        const n = Number(shipmentIds[i]);
        if (!Number.isInteger(n) || n <= 0) {
            return NextResponse.json({ error: `shipmentIds[${i}] must be a positive integer` }, { status: 400 });
        }
        ids.push(n);
    }

    if (ids.length > 50) {
        return NextResponse.json({ error: "Cannot schedule pickup for more than 50 shipments at once" }, { status: 400 });
    }

    try {
        const result = await generatePickup(ids);
        return NextResponse.json(result);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Pickup scheduling failed";
        console.error("[Shiprocket pickup]", msg);
        return NextResponse.json({ error: msg }, { status: 502 });
    }
}
