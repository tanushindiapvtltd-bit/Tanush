import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkServiceability } from "@/lib/shiprocket";

const PIN_RE = /^\d{6}$/;

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const deliveryPin = searchParams.get("delivery_pin") ?? "";
    const weightRaw = searchParams.get("weight") ?? "500";
    const cod = searchParams.get("cod") === "1" || searchParams.get("payment_mode") === "COD";

    if (!PIN_RE.test(deliveryPin)) {
        return NextResponse.json({ error: "delivery_pin must be a 6-digit number" }, { status: 400 });
    }

    const weight = Number(weightRaw);
    if (!Number.isFinite(weight) || weight <= 0) {
        return NextResponse.json({ error: "weight must be a positive number (grams)" }, { status: 400 });
    }

    try {
        const result = await checkServiceability({ deliveryPincode: deliveryPin, weight, cod });
        return NextResponse.json(result);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Serviceability check failed";
        console.error("[Shiprocket serviceability]", msg);
        return NextResponse.json({ error: msg }, { status: 502 });
    }
}
