/**
 * Delhivery B2C API Service
 * All endpoints: https://track.delhivery.com
 */

const BASE_URL = process.env.DELHIVERY_BASE_URL ?? "https://track.delhivery.com";

function tok() { return process.env.DELHIVERY_API_TOKEN ?? ""; }
function authH() { return { Authorization: `Token ${tok()}`, Accept: "application/json" }; }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DelhiveryShipment {
    waybill?: string;
    orderNumber: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    country?: string;
    paymentMode: "Prepaid" | "COD";
    codAmount?: number;
    totalAmount: number;
    weight: number;       // grams
    length?: number;      // cm
    breadth?: number;
    height?: number;
    productsDesc: string;
    quantity: number;
    orderDate: string;
    sellerInvoice?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip characters that break Delhivery's parser: & # % ; \ */
function sanitize(s: string): string {
    return s.replace(/[&#%;\\]/g, "").trim();
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
    const text = await res.text();
    if (!text) return {};
    if (text.trimStart().startsWith("<")) {
        throw new Error(`Delhivery returned HTML (${res.status}). Check DELHIVERY_API_TOKEN.`);
    }
    try { return JSON.parse(text); } catch {
        throw new Error(`Invalid JSON from Delhivery (${res.status}): ${text.slice(0, 200)}`);
    }
}

// ─── 1. Fetch Waybill ─────────────────────────────────────────────────────────
// Docs: GET /waybill/api/fetch/json/?token=xxx
// Response: plain JSON string e.g. "51328510000055"

export async function fetchWaybills(): Promise<string> {
    const res = await fetch(
        `${BASE_URL}/waybill/api/fetch/json/?token=${encodeURIComponent(tok())}`,
        { headers: { Accept: "application/json" } }
    );
    const text = await res.text();
    if (!res.ok) throw new Error(`Waybill fetch failed (${res.status}): ${text.slice(0, 200)}`);
    // Response is a plain JSON string: "51328510000055"
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed === "string") return parsed;
        if (Array.isArray(parsed)) return String(parsed[0]);
        if (parsed?.waybill) return Array.isArray(parsed.waybill) ? String(parsed.waybill[0]) : String(parsed.waybill);
    } catch { /* fall through */ }
    throw new Error(`Unexpected waybill response: ${text.slice(0, 200)}`);
}

// ─── 2. Serviceability ────────────────────────────────────────────────────────
// Docs: GET /c/api/pin-codes/json/?filter_codes=pin_code
// Empty delivery_codes = non-serviceable. remarks="Embargo" = temporary NSZ.

export async function checkServiceability(
    deliveryPin: string,
    paymentMode: "Prepaid" | "COD" = "Prepaid",
): Promise<{ serviceable: boolean; codAvailable: boolean; prepaidAvailable: boolean; tat?: number; message?: string }> {
    const res = await fetch(
        `${BASE_URL}/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(deliveryPin)}`,
        { headers: authH() }
    );
    const data = await safeJson(res);
    const codes = (data.delivery_codes ?? []) as Array<{ postal_code: Record<string, unknown> }>;
    const pin = codes[0]?.postal_code;

    if (!pin) {
        return { serviceable: false, codAvailable: false, prepaidAvailable: false, message: "Pincode not serviceable" };
    }
    if (pin.remarks === "Embargo") {
        return { serviceable: false, codAvailable: false, prepaidAvailable: false, message: "Pincode temporarily non-serviceable (Embargo)" };
    }

    return {
        serviceable: true,
        codAvailable: pin.cod === "Y",
        prepaidAvailable: pin.pre_paid === "Y",
        tat: undefined,
        message: String(pin.inc ?? pin.district ?? ""),
    };
}

// ─── 3. Expected TAT ──────────────────────────────────────────────────────────
// Docs: GET /api/dc/expected_tat?origin_pin=&destination_pin=&mot=S

export async function getExpectedTAT(
    originPin: string,
    destinationPin: string,
    mot: "S" | "E" | "N" = "S",
): Promise<{ days?: number; expectedDelivery?: string; message?: string }> {
    const params = new URLSearchParams({ origin_pin: originPin, destination_pin: destinationPin, mot, pdt: "B2C" });
    const res = await fetch(`${BASE_URL}/api/dc/expected_tat?${params}`, { headers: authH() });
    const data = await safeJson(res);
    // Response: { success: true, msg: "", data: { tat: 5 } }
    const inner = (data.data ?? data) as Record<string, unknown>;
    return {
        days: inner.tat ? Number(inner.tat) : undefined,
        expectedDelivery: inner.expected_delivery_date as string | undefined,
        message: (data.msg as string) || undefined,
    };
}

// ─── 4. Shipping Rate ─────────────────────────────────────────────────────────
// Docs: GET /api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&d_pin=&o_pin=&cgm=&pt=Pre-paid

export async function getShippingRate(p: {
    pickupPin: string; deliveryPin: string; weight: number;
    paymentMode: "Prepaid" | "COD";
    length?: number; breadth?: number; height?: number;
}): Promise<{ rate: number; deliveryCharge: number; gst: number; zone: string; currency: string }> {
    const qp = new URLSearchParams({
        md: "S",
        ss: "Delivered",
        o_pin: p.pickupPin,
        d_pin: p.deliveryPin,
        cgm: String(p.weight),
        pt: p.paymentMode === "COD" ? "COD" : "Pre-paid",
        ...(p.length ? { l: String(p.length) } : {}),
        ...(p.breadth ? { b: String(p.breadth) } : {}),
        ...(p.height ? { h: String(p.height) } : {}),
    });
    const res = await fetch(`${BASE_URL}/api/kinko/v1/invoice/charges/.json?${qp}`, { headers: authH() });
    const text = await res.text();
    if (!res.ok) throw new Error(`Rate failed (${res.status}): ${text.slice(0, 200)}`);
    // Response is an ARRAY: [{ total_amount, charge_DL, tax_data: { SGST, CGST }, zone, ... }]
    const arr = JSON.parse(text) as Array<Record<string, unknown>>;
    const d = arr[0] ?? {};
    const tax = (d.tax_data ?? {}) as Record<string, number>;
    const gst = (tax.SGST ?? 0) + (tax.CGST ?? 0) + (tax.IGST ?? 0);
    return {
        rate: Number(d.total_amount ?? 0),
        deliveryCharge: Number(d.charge_DL ?? 0),
        gst,
        zone: String(d.zone ?? ""),
        currency: "INR",
    };
}

// ─── 5. Warehouse ─────────────────────────────────────────────────────────────

export async function createWarehouse(w: {
    name: string; address: string; city: string; state: string;
    pin: string; phone: string; email?: string;
}): Promise<{ success: boolean; message: string }> {
    const body = new URLSearchParams({
        name: w.name, add: w.address, city: w.city,
        state: w.state, pin: w.pin, phone: w.phone,
        country: "India", ...(w.email ? { email: w.email } : {}),
    });
    const res = await fetch(`${BASE_URL}/api/p/v1/warehouse/create`, {
        method: "POST",
        headers: { Authorization: `Token ${tok()}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });
    const data = await safeJson(res);
    return {
        success: res.ok,
        message: (data.message as string) ?? (res.ok ? "Warehouse created" : `Failed (${res.status}): ${JSON.stringify(data)}`),
    };
}

export async function listWarehouses(): Promise<Array<{ name: string; city: string; pin: string }>> {
    const res = await fetch(`${BASE_URL}/api/p/v1/warehouse/list`, { headers: authH() });
    const data = await safeJson(res);
    const results = (data.data ?? data.results ?? data.warehouses ?? []) as Array<Record<string, unknown>>;
    return results.map((w) => ({ name: String(w.name ?? ""), city: String(w.city ?? ""), pin: String(w.pin ?? "") }));
}

// ─── 6. Create Shipment ───────────────────────────────────────────────────────
// Docs: POST /api/cmu/create.json  body: format=json&data=<encoded JSON>

export async function createShipment(
    shipment: DelhiveryShipment
): Promise<{ waybill: string; success: boolean; message: string }> {
    const sellerName    = process.env.DELHIVERY_SELLER_NAME ?? "";
    const returnAdd     = process.env.DELHIVERY_RETURN_ADDRESS ?? "";
    const returnCity    = process.env.DELHIVERY_RETURN_CITY ?? "";
    const returnPin     = process.env.DELHIVERY_RETURN_PIN ?? "";
    const returnPhone   = process.env.DELHIVERY_RETURN_PHONE ?? "";
    const returnState   = process.env.DELHIVERY_RETURN_STATE ?? "";
    const warehouseName = process.env.DELHIVERY_WAREHOUSE_NAME ?? "";

    const payload = {
        shipments: [{
            waybill: shipment.waybill ?? "",
            name: shipment.name,
            add: shipment.address,
            pin: shipment.pincode,
            city: shipment.city,
            state: shipment.state,
            country: shipment.country ?? "India",
            phone: shipment.phone,
            payment_mode: shipment.paymentMode,
            order: shipment.orderNumber,
            return_pin: returnPin,
            return_city: returnCity,
            return_phone: returnPhone,
            return_add: returnAdd,
            return_name: sellerName,
            return_state: returnState,
            return_country: "India",
            products_desc: shipment.productsDesc,
            hsn_code: "",
            cod_amount: shipment.paymentMode === "COD" ? (shipment.codAmount ?? shipment.totalAmount) : 0,
            order_date: shipment.orderDate,
            total_amount: shipment.totalAmount,
            seller_gstin: process.env.DELHIVERY_GSTIN ?? "",
            shipment_width: shipment.breadth ?? 10,
            shipment_height: shipment.height ?? 10,
            weight: shipment.weight,
            seller_name: sellerName,
            seller_add: returnAdd,
            seller_city: returnCity,
            seller_state: returnState,
            seller_country: "India",
            seller_pin: returnPin,
            seller_inv: shipment.sellerInvoice ?? shipment.orderNumber,
            quantity: shipment.quantity,
            shipment_length: shipment.length ?? 10,
            fragile_shipment: false,
        }],
        pickup_location: { name: warehouseName },
    };

    const body = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
    const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
        method: "POST",
        headers: {
            Authorization: `Token ${tok()}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body,
    });

    const data = await safeJson(res);
    if (!res.ok) throw new Error(`Shipment creation failed (${res.status}): ${JSON.stringify(data)}`);

    const packages = (data.packages as Array<{ waybill?: string; status?: string; remarks?: string }>) ?? [];
    const created = packages[0];
    if (!created) throw new Error(`No package in response: ${JSON.stringify(data)}`);

    const remarks = created.remarks ?? (data.rmk as string) ?? "";
    if (!created.waybill) {
        throw new Error(remarks || `Shipment creation failed — no waybill returned. Response: ${JSON.stringify(data)}`);
    }

    return {
        waybill: created.waybill,
        success: created.status === "Success",
        message: remarks || "Shipment created",
    };
}

// ─── 7. Update Shipment ───────────────────────────────────────────────────────
// Docs: POST /api/p/edit  body: { waybill, name?, phone?, add?, products_desc?, gm?, shipment_height?, shipment_width?, shipment_length?, pt? }

export async function updateShipment(waybill: string, fields: {
    name?: string; phone?: string; add?: string;
    products_desc?: string; gm?: number;
    shipment_height?: number; shipment_width?: number; shipment_length?: number;
    pt?: "COD" | "Pre-paid";
}): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/p/edit`, {
        method: "POST",
        headers: { Authorization: `Token ${tok()}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ waybill, ...fields }),
    });
    const data = await safeJson(res);
    return {
        success: res.ok,
        message: (data.message as string) ?? (res.ok ? "Updated" : `Update failed (${res.status}): ${JSON.stringify(data)}`),
    };
}

// ─── 8. Cancel Shipment ───────────────────────────────────────────────────────
// Docs: POST /api/p/edit  body: { waybill, cancellation: "true" }

export async function cancelShipment(waybill: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/p/edit`, {
        method: "POST",
        headers: { Authorization: `Token ${tok()}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ waybill, cancellation: "true" }),
    });
    const data = await safeJson(res);
    return {
        success: res.ok,
        message: (data.message as string) ?? (res.ok ? "Cancelled" : `Cancel failed (${res.status}): ${JSON.stringify(data)}`),
    };
}

// ─── 9. Pickup Request ────────────────────────────────────────────────────────
// Docs: POST /fm/request/new/

export async function schedulePickup(p: {
    warehouseName: string; pickupDate: string; pickupTime: string;
    expectedPackageCount: number;
}): Promise<{ success: boolean; pickupId?: string; message: string }> {
    const res = await fetch(`${BASE_URL}/fm/request/new/`, {
        method: "POST",
        headers: { Authorization: `Token ${tok()}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            pickup_time: p.pickupTime,
            pickup_date: p.pickupDate,
            pickup_location: p.warehouseName,
            expected_package_count: p.expectedPackageCount,
        }),
    });
    const data = await safeJson(res);
    return {
        success: res.ok,
        pickupId: data.pickup_id as string | undefined,
        message: (data.message as string) ?? (res.ok ? "Pickup scheduled" : `Failed (${res.status}): ${JSON.stringify(data)}`),
    };
}

// ─── 10. Reverse Pickup (Return) ─────────────────────────────────────────────
// payment_mode = "Pickup" → Delhivery picks up FROM customer (name/add/pin),
// delivers TO warehouse (return_add/return_pin). Official docs:
// https://track.delhivery.com/api/cmu/create.json

export interface DelhiveryReturnItem {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    url?: string;   // Cloudinary product image — delivery boy uses this to verify the returned item
}

export async function createReverseShipment(p: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerPin: string;
    customerCity: string;
    customerState: string;
    quantity: number;
    weight: number;     // grams
    totalAmount: number;
    items: DelhiveryReturnItem[];
}): Promise<{ waybill: string; success: boolean; message: string }> {
    const warehouseName  = process.env.DELHIVERY_WAREHOUSE_NAME ?? "";
    const returnName     = sanitize(process.env.DELHIVERY_SELLER_NAME ?? "");
    const returnPhone    = process.env.DELHIVERY_RETURN_PHONE ?? "";
    const returnAdd      = sanitize(process.env.DELHIVERY_RETURN_ADDRESS ?? "");
    const returnCity     = sanitize(process.env.DELHIVERY_RETURN_CITY ?? "");
    const returnState    = sanitize(process.env.DELHIVERY_RETURN_STATE ?? "");
    const returnPin      = process.env.DELHIVERY_RETURN_PIN ?? "";

    // Derive products_desc from items (sanitized)
    const productsDesc = sanitize(
        p.items.map((i) => `${i.name} x${i.quantity}`).join(", ")
    );

    // Order ID must be unique every time — append timestamp to guard against retries
    const uniqueOrderId = `RETURN-${p.orderNumber}-${Date.now()}`;

    const payload = {
        shipments: [
            {
                // ── Pickup location (customer) ──────────────────────────────
                name:    sanitize(p.customerName),
                phone:   p.customerPhone,
                add:     sanitize(p.customerAddress),
                city:    sanitize(p.customerCity),
                state:   sanitize(p.customerState),
                pin:     p.customerPin,
                country: "India",

                // ── Drop / delivery location (warehouse) ────────────────────
                return_name:    returnName,
                return_phone:   returnPhone,
                return_add:     returnAdd,
                return_city:    returnCity,
                return_state:   returnState,
                return_pin:     returnPin,
                return_country: "India",

                // ── Shipment meta ───────────────────────────────────────────
                order:            uniqueOrderId,
                payment_mode:     "Pickup",   // reverse pickup
                pickup_location:  warehouseName,
                waybill:          "",         // auto-assigned by Delhivery
                cod_amount:       0,
                total_amount:     p.totalAmount,
                weight:           p.weight,
                quantity:         String(p.quantity),
                products_desc:    productsDesc,
                hsn_code:         "",
                order_date:       new Date().toISOString().split("T")[0],
                seller_name:      returnName,
                seller_add:       returnAdd,
                seller_inv:       uniqueOrderId,
                seller_gstin:     process.env.DELHIVERY_GSTIN ?? "",
                shipment_length:  10,
                shipment_width:   10,
                shipment_height:  10,
                fragile_shipment: false,

                // ── Per-item details with Cloudinary URLs ───────────────────
                // Delivery agent uses `url` to visually verify the returned product.
                shipment_details: p.items.map((item) => ({
                    sku:   sanitize(item.sku || item.name),
                    name:  sanitize(item.name),
                    units: item.quantity,
                    price: item.price,
                    url:   "https://res.cloudinary.com/dvtchwztz/image/upload/v1773815324/tanush/products/ed8nunfzq6pnilseervj.png",
                })),
            },
        ],
        // Top-level pickup_location required by Delhivery (must match registered WH name exactly)
        pickup_location: { name: warehouseName },
    };

    const body = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
    console.log("[Delhivery Reverse] payload:", JSON.stringify(payload, null, 2));

    const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
        method: "POST",
        headers: {
            Authorization: `Token ${tok()}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body,
    });

    const data = await safeJson(res);
    console.log("[Delhivery Reverse] response:", JSON.stringify(data));

    if (!res.ok) throw new Error(`Reverse shipment failed (${res.status}): ${JSON.stringify(data)}`);

    const packages = (data.packages as Array<{ waybill?: string; status?: string; remarks?: string }>) ?? [];
    const created = packages[0];
    if (!created?.waybill) {
        const remarks = created?.remarks ?? (data.rmk as string) ?? "";
        throw new Error(remarks || `Reverse shipment failed — no waybill. Response: ${JSON.stringify(data)}`);
    }

    return {
        waybill: created.waybill,
        success: created.status === "Success",
        message: created.remarks || "Return shipment created",
    };
}

// ─── 11. Label ────────────────────────────────────────────────────────────────
// Docs: GET /api/p/packing_slip?wbns=WAYBILL&pdf=true&pdf_size=A4

export function getLabelUrl(waybill: string): string {
    return `${BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=A4`;
}

// ─── 11. Track Shipment ───────────────────────────────────────────────────────
// Docs: GET /api/v1/packages/json/?waybill=xxx

export async function trackShipment(waybill: string): Promise<{
    status: string; statusCode: string; location: string; timestamp: string;
    scans: Array<{ status: string; location: string; timestamp: string; detail: string }>;
}> {
    const res = await fetch(
        `${BASE_URL}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`,
        { headers: authH() }
    );
    const data = await safeJson(res) as {
        ShipmentData?: Array<{
            Shipment?: {
                Status?: { Status?: string; StatusType?: string; StatusLocation?: string; StatusDateTime?: string };
                Scans?: Array<{ ScanDetail: { Scan: string; ScannedLocation: string; StatusDateTime: string; Instructions: string } }>;
            };
        }>;
    };
    if (!res.ok) throw new Error(`Track failed (${res.status}): ${JSON.stringify(data)}`);
    const s = data.ShipmentData?.[0]?.Shipment;
    if (!s) throw new Error("No shipment data in tracking response");
    return {
        status: s.Status?.Status ?? "",
        statusCode: s.Status?.StatusType ?? "",
        location: s.Status?.StatusLocation ?? "",
        timestamp: s.Status?.StatusDateTime ?? "",
        scans: (s.Scans ?? []).map((sc) => ({
            status: sc.ScanDetail?.Scan ?? "",
            location: sc.ScanDetail?.ScannedLocation ?? "",
            timestamp: sc.ScanDetail?.StatusDateTime ?? "",
            detail: sc.ScanDetail?.Instructions ?? "",
        })),
    };
}
