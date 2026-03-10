import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateShipment } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { waybill, ...fields } = await req.json();
    if (!waybill) return NextResponse.json({ error: "waybill required" }, { status: 400 });
    const result = await updateShipment(waybill, fields);
    return NextResponse.json(result);
}
