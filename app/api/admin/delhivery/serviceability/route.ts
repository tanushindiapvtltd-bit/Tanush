import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkServiceability } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pincode = req.nextUrl.searchParams.get("pincode");
    if (!pincode) return NextResponse.json({ error: "pincode required" }, { status: 400 });

    try {
        const result = await checkServiceability(pincode);
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 502 });
    }
}
