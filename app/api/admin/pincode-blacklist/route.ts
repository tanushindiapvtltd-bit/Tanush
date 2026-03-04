import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const list = await prisma.pincodeBlacklist.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { pincode, reason } = await req.json();
    if (!/^\d{6}$/.test(pincode)) return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });

    try {
        const entry = await prisma.pincodeBlacklist.create({
            data: { pincode, reason: reason ?? null, addedBy: session.user?.email ?? "admin" },
        });
        return NextResponse.json(entry, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Pincode already blacklisted" }, { status: 409 });
    }
}
