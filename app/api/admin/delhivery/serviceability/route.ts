import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkServiceability } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deliveryPin = req.nextUrl.searchParams.get("delivery_pin") ?? "";
    const paymentMode = (req.nextUrl.searchParams.get("payment_mode") ?? "Prepaid") as "Prepaid" | "COD";

    if (!deliveryPin) return NextResponse.json({ error: "delivery_pin required" }, { status: 400 });

    const result = await checkServiceability(deliveryPin, paymentMode);
    return NextResponse.json(result);
}
