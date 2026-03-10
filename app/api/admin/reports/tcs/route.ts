import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

const SUP_NAME = process.env.TCS_SUP_NAME ?? "";
const GSTIN = process.env.TCS_GSTIN ?? "";
const ENROLLMENT_NO = process.env.TCS_ENROLLMENT_NO ?? "";

function formatDate(d: Date) {
    return d.toISOString().split("T")[0];
}

function normalizeState(state: string) {
    return state.toUpperCase().trim();
}

// Indian state name normalization map
const STATE_MAP: Record<string, string> = {
    "UP": "UTTAR PRADESH",
    "MH": "MAHARASHTRA",
    "KA": "KARNATAKA",
    "DL": "DELHI",
    "GJ": "GUJARAT",
    "RJ": "RAJASTHAN",
    "TN": "TAMIL NADU",
    "WB": "WEST BENGAL",
    "AP": "ANDHRA PRADESH",
    "TS": "TELANGANA",
    "KL": "KERALA",
    "MP": "MADHYA PRADESH",
    "HR": "HARYANA",
    "PB": "PUNJAB",
    "BR": "BIHAR",
    "OR": "ORISSA",
    "OD": "ORISSA",
    "ODISHA": "ORISSA",
    "CG": "CHHATTISGARH",
    "CHHATTISGARH": "CHHATTISGARH",
    "JH": "JHARKHAND",
    "HP": "HIMACHAL PRADESH",
    "UK": "UTTARAKHAND",
    "UTTARAKHAND": "UTTARAKHAND",
    "AS": "ASSAM",
    "MN": "MANIPUR",
    "ML": "MEGHALAYA",
    "MZ": "MIZORAM",
    "NL": "NAGALAND",
    "TR": "TRIPURA",
    "SK": "SIKKIM",
    "AR": "ARUNACHAL PRADESH",
    "GA": "GOA",
    "JK": "JAMMU & KASHMIR",
    "LA": "LADAKH",
    "PY": "PUDUCHERRY",
    "PONDICHERRY": "PUDUCHERRY",
    "CH": "CHANDIGARH",
    "AN": "ANDAMAN & NICOBAR ISLANDS",
    "DN": "DADRA & NAGAR HAVELI",
    "DD": "DAMAN & DIU",
    "LD": "LAKSHADWEEP",
};

function resolveState(raw: string) {
    const up = raw.toUpperCase().trim();
    return STATE_MAP[up] ?? up;
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "sales"; // "sales" | "returns"
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    if (type === "sales") {
        // Fetch all orders created in this month (CONFIRMED, PROCESSING, SHIPPED, DELIVERED)
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate },
                status: { notIn: ["PENDING", "CANCELLED"] },
                paymentStatus: { in: ["PAID", "PENDING"] }, // include COD (PENDING) too
            },
            include: {
                items: {
                    include: { product: { select: { hsnCode: true, gstRate: true } } },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        const rows: Record<string, unknown>[] = [];

        for (const order of orders) {
            const subtotal = order.subtotal; // sum of item prices without tax
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                const gstRate = item.product?.gstRate ?? 0;
                const itemSubtotal = item.price * item.quantity;

                // Allocate shipping proportionally
                const shippingShare = subtotal > 0
                    ? (order.shippingCost * itemSubtotal) / subtotal
                    : 0;

                const taxableShipping = Math.round(shippingShare * 100) / 100;
                const totalTaxable = itemSubtotal + taxableShipping;
                const taxAmount = Math.round(totalTaxable * gstRate) / 100;
                const totalInvoice = Math.round((totalTaxable + taxAmount) * 100) / 100;

                rows.push({
                    sup_name: SUP_NAME,
                    gstin: GSTIN,
                    sub_order_num: `${order.orderNumber}_${i + 1}`,
                    order_date: formatDate(order.createdAt),
                    product_name: item.productName,
                    hsn_code: item.product?.hsnCode ?? "",
                    quantity: item.quantity,
                    unit_price: item.price,
                    gst_rate: gstRate.toFixed(2),
                    total_taxable_sale_value: Math.round(totalTaxable * 100) / 100,
                    tax_amount: taxAmount,
                    total_invoice_value: totalInvoice,
                    taxable_shipping: taxableShipping,
                    end_customer_state_new: resolveState(order.shippingState),
                    enrollment_no: ENROLLMENT_NO,
                    financial_year: year,
                    month_number: month,
                });
            }
        }

        return await buildExcel(rows, `tcs-sales-${year}-${String(month).padStart(2, "0")}.xlsx`);
    } else {
        // TCS Sales Return: return requests (approved) in this month
        const returns = await prisma.returnRequest.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate },
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: { product: { select: { hsnCode: true, gstRate: true } } },
                        },
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        const rows: Record<string, unknown>[] = [];

        for (const ret of returns) {
            const order = ret.order;
            const subtotal = order.subtotal;
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                const gstRate = item.product?.gstRate ?? 0;
                const itemSubtotal = item.price * item.quantity;

                const shippingShare = subtotal > 0
                    ? (order.shippingCost * itemSubtotal) / subtotal
                    : 0;

                const taxableShipping = Math.round(shippingShare * 100) / 100;
                const totalTaxable = itemSubtotal + taxableShipping;
                const taxAmount = Math.round(totalTaxable * gstRate) / 100;
                const totalInvoice = Math.round((totalTaxable + taxAmount) * 100) / 100;

                rows.push({
                    sup_name: SUP_NAME,
                    gstin: GSTIN,
                    sub_order_num: `${order.orderNumber}_${i + 1}`,
                    order_date: formatDate(order.createdAt),
                    product_name: item.productName,
                    hsn_code: item.product?.hsnCode ?? "",
                    quantity: item.quantity,
                    unit_price: item.price,
                    gst_rate: gstRate.toFixed(2),
                    total_taxable_sale_value: Math.round(totalTaxable * 100) / 100,
                    tax_amount: taxAmount,
                    total_invoice_value: totalInvoice,
                    taxable_shipping: taxableShipping,
                    end_customer_state_new: resolveState(order.shippingState),
                    enrollment_no: ENROLLMENT_NO,
                    cancel_return_date: formatDate(ret.createdAt),
                    financial_year: year,
                    month_number: month,
                });
            }
        }

        return await buildExcel(rows, `tcs-sales-return-${year}-${String(month).padStart(2, "0")}.xlsx`);
    }
}

async function buildExcel(rows: Record<string, unknown>[], filename: string) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Sheet1");

    if (rows.length > 0) {
        ws.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
        for (const row of rows) ws.addRow(row);
    }

    const buf = await wb.xlsx.writeBuffer();

    return new NextResponse(buf, {
        status: 200,
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
