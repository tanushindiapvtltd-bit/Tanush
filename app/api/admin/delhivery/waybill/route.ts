import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchWaybills } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const waybill = await fetchWaybills();
    return NextResponse.json({ waybill });
}
