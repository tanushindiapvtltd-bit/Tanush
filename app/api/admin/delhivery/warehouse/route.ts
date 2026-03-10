import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createWarehouse, listWarehouses } from "@/lib/delhivery";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const warehouses = await listWarehouses();
    return NextResponse.json({ warehouses });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { name, address, city, state, pin, phone, email } = body;
    if (!name || !address || !city || !state || !pin || !phone) {
        return NextResponse.json({ error: "name, address, city, state, pin, phone required" }, { status: 400 });
    }
    const result = await createWarehouse({ name, address, city, state, pin, phone, email });
    return NextResponse.json(result);
}
