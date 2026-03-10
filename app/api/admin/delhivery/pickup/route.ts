import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { schedulePickup } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
        warehouseName = process.env.DELHIVERY_WAREHOUSE_NAME ?? "Primary",
        pickupDate,
        pickupTime = "10:00",
        expectedPackageCount = 1,
        phone,
    } = await req.json();

    if (!pickupDate) return NextResponse.json({ error: "pickupDate required (YYYY-MM-DD)" }, { status: 400 });

    const result = await schedulePickup({ warehouseName, pickupDate, pickupTime, expectedPackageCount, phone });
    return NextResponse.json(result);
}
