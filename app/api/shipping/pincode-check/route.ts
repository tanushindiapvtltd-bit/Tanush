import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkServiceability } from "@/lib/delhivery";
import { cachePincode, getCachedPincode } from "@/lib/redis";

export async function GET(req: NextRequest) {
    const pincode = req.nextUrl.searchParams.get("pincode")?.trim();
    if (!pincode || !/^\d{6}$/.test(pincode)) {
        return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
    }

    // 1. Check blacklist first
    const blacklisted = await prisma.pincodeBlacklist.findUnique({ where: { pincode } });
    if (blacklisted) {
        return NextResponse.json({
            available: false,
            reason: "Delivery not available in your area",
        });
    }

    // 2. Check Redis cache
    const cached = await getCachedPincode(pincode);
    if (cached) {
        return NextResponse.json({ ...cached, cached: true });
    }

    // 3. Call Delhivery API
    try {
        const result = await checkServiceability(pincode);
        const response = {
            available: result.serviceable,
            cod: result.cod ?? false,
            prepaid: result.prepaid ?? true,
            estimatedDays: 5, // default; Delhivery EDD not always returned for serviceability
            city: result.city,
            state: result.state,
        };

        if (result.serviceable) {
            await cachePincode(pincode, response);
        }

        return NextResponse.json(response);
    } catch {
        // On Delhivery API failure, default to available (fail open)
        return NextResponse.json({
            available: true,
            cod: true,
            prepaid: true,
            estimatedDays: 7,
            fallback: true,
        });
    }
}
