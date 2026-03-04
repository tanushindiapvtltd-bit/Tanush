import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ pincode: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { pincode } = await params;

    try {
        await prisma.pincodeBlacklist.delete({ where: { pincode } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
    }
}
