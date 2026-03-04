import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getShippingRate } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const pickup = searchParams.get("pickup");
    const delivery = searchParams.get("delivery");
    const weight = searchParams.get("weight"); // grams
    const cod = searchParams.get("cod") === "1";

    if (!pickup || !delivery || !weight) {
        return NextResponse.json({ error: "pickup, delivery and weight are required" }, { status: 400 });
    }

    try {
        const result = await getShippingRate(pickup, delivery, Number(weight), cod);
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }
}
