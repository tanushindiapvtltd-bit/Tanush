import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { schedulePickup } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { pickupTime, pickupLocation, expectedCount } = await req.json();
    if (!pickupTime || !pickupLocation || !expectedCount) {
        return NextResponse.json(
            { error: "pickupTime, pickupLocation and expectedCount are required" },
            { status: 400 }
        );
    }

    try {
        const result = await schedulePickup({ pickupTime, pickupLocation, expectedCount });
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }
}
