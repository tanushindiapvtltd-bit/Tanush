import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
        sellerName: process.env.DELHIVERY_SELLER_NAME ?? "Tanush India",
        returnAddress: process.env.DELHIVERY_RETURN_ADDRESS ?? "",
        returnCity: process.env.DELHIVERY_RETURN_CITY ?? "",
        returnPin: process.env.DELHIVERY_RETURN_PIN ?? "",
        returnState: process.env.DELHIVERY_RETURN_STATE ?? "",
        returnPhone: process.env.DELHIVERY_RETURN_PHONE ?? "",
        gstin: process.env.DELHIVERY_GSTIN ?? "",
    });
}
