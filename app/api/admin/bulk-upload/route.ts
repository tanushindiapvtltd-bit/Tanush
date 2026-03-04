import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createShipment, CreateShipmentData } from "@/lib/delhivery";
import Papa from "papaparse";

interface CSVRow {
    order_number: string;
    customer_name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    payment_mode: string;
    cod_amount?: string;
    total_amount: string;
    product_desc: string;
    weight?: string;
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const text = await file.text();
    const { data: rows, errors } = Papa.parse<CSVRow>(text, { header: true, skipEmptyLines: true });

    if (errors.length > 0) {
        return NextResponse.json({ error: "CSV parse error", details: errors.map(e => e.message) }, { status: 400 });
    }

    // Validate required fields
    const required = ["order_number", "customer_name", "address", "city", "state", "pincode", "phone", "payment_mode", "total_amount", "product_desc"];
    const validationErrors: string[] = [];
    rows.forEach((row, i) => {
        for (const field of required) {
            if (!row[field as keyof CSVRow]) {
                validationErrors.push(`Row ${i + 2}: missing ${field}`);
            }
        }
        if (row.payment_mode && !["Prepaid", "CoD"].includes(row.payment_mode)) {
            validationErrors.push(`Row ${i + 2}: payment_mode must be "Prepaid" or "CoD"`);
        }
    });

    if (validationErrors.length > 0) {
        return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 422 });
    }

    // Process in batches of 10
    const results: { orderNumber: string; waybill?: string; error?: string }[] = [];
    const BATCH = 10;

    for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        await Promise.all(
            batch.map(async (row) => {
                try {
                    const data: CreateShipmentData = {
                        name: row.customer_name,
                        address: row.address,
                        city: row.city,
                        state: row.state,
                        pincode: row.pincode,
                        phone: row.phone,
                        orderNumber: row.order_number,
                        paymentMode: row.payment_mode as "Prepaid" | "CoD",
                        codAmount: row.cod_amount ? Number(row.cod_amount) : undefined,
                        totalAmount: Number(row.total_amount),
                        productDesc: row.product_desc,
                        weight: row.weight ? Number(row.weight) : 0.5,
                    };
                    const result = await createShipment(data);
                    results.push({ orderNumber: row.order_number, waybill: result.waybill });
                } catch (err) {
                    results.push({ orderNumber: row.order_number, error: err instanceof Error ? err.message : "Failed" });
                }
            })
        );
    }

    const successful = results.filter(r => r.waybill);
    const failed = results.filter(r => r.error);

    return NextResponse.json({ total: rows.length, successful: successful.length, failed: failed.length, results });
}
