import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listPickupAddresses } from "@/lib/shiprocket";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const addresses = await listPickupAddresses();
        return NextResponse.json({ addresses });
    } catch (e: unknown) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Failed to fetch pickup addresses" },
            { status: 502 }
        );
    }
}
