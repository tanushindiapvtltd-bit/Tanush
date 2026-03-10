import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getShippingRate } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pickupPin = req.nextUrl.searchParams.get("pickup_pin") ?? process.env.DELHIVERY_RETURN_PIN ?? "";
    const deliveryPin = req.nextUrl.searchParams.get("delivery_pin") ?? "";
    const weight = Number(req.nextUrl.searchParams.get("weight") ?? "500");
    const paymentMode = (req.nextUrl.searchParams.get("payment_mode") ?? "Prepaid") as "Prepaid" | "COD";
    if (!deliveryPin) return NextResponse.json({ error: "delivery_pin required" }, { status: 400 });

    const rate = await getShippingRate({ pickupPin, deliveryPin, weight, paymentMode });
    return NextResponse.json(rate);
}
