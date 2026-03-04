import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getNDRList } from "@/lib/delhivery";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const list = await getNDRList();
        return NextResponse.json(list);
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch NDR list" }, { status: 502 });
    }
}
