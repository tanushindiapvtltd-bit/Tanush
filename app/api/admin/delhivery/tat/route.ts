import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getExpectedTAT } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const originPin = req.nextUrl.searchParams.get("origin_pin") ?? process.env.DELHIVERY_RETURN_PIN ?? "";
    const destinationPin = req.nextUrl.searchParams.get("destination_pin") ?? "";
    const mot = (req.nextUrl.searchParams.get("mot") ?? "S") as "S" | "E" | "N";

    if (!destinationPin) return NextResponse.json({ error: "destination_pin required" }, { status: 400 });

    const result = await getExpectedTAT(originPin, destinationPin, mot);
    return NextResponse.json(result);
}
