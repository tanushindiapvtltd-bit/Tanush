/**
 * Shiprocket API Service
 * Base URL: https://apiv2.shiprocket.in/v1/external
 * Auth: email/password → Bearer token (valid 24h, cached in module scope)
 */

const BASE = "https://apiv2.shiprocket.in/v1/external";
const API_TIMEOUT_MS = 15_000; // 15s per request

// ─── Token cache (with promise-deduplication) ─────────────────────────────────

let _token = "";
let _tokenExpiresAt = 0;
let _tokenFetch: Promise<string> | null = null;

async function fetchNewToken(): Promise<string> {
    const email = process.env.SHIPROCKET_EMAIL ?? "";
    const password = process.env.SHIPROCKET_PASSWORD ?? "";
    if (!email || !password) {
        throw new Error("SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set in environment variables");
    }

    const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    const data = await safeJson(res);
    if (!res.ok) {
        throw new Error(`Shiprocket auth failed (${res.status}): ${String(data.message ?? "Unknown error").slice(0, 200)}`);
    }

    const token = data.token as string | undefined;
    if (!token) throw new Error("No token returned from Shiprocket auth");

    _token = token;
    _tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000; // 23h (tokens are valid 24h)
    return _token;
}

async function getToken(): Promise<string> {
    // Return cached token if still valid
    if (_token && Date.now() < _tokenExpiresAt) return _token;

    // Deduplicate concurrent auth calls — only one in-flight at a time
    if (!_tokenFetch) {
        _tokenFetch = fetchNewToken().finally(() => { _tokenFetch = null; });
    }
    return _tokenFetch;
}

/** Force a token refresh (used after a 401 response). */
function invalidateToken() {
    _token = "";
    _tokenExpiresAt = 0;
}

function authH(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// ─── HTTP helper with 401 auto-retry ─────────────────────────────────────────

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const token = await getToken();
    const res = await fetch(url, {
        ...init,
        headers: { ...authH(token), ...(init.headers as Record<string, string> ?? {}) },
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });

    // Token expired server-side → refresh once and retry
    if (res.status === 401) {
        invalidateToken();
        const fresh = await getToken();
        return fetch(url, {
            ...init,
            headers: { ...authH(fresh), ...(init.headers as Record<string, string> ?? {}) },
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
        });
    }

    return res;
}

// ─── JSON helper ──────────────────────────────────────────────────────────────

async function safeJson(res: Response): Promise<Record<string, unknown>> {
    const text = await res.text();
    if (!text.trim()) return {};
    try {
        return JSON.parse(text) as Record<string, unknown>;
    } catch {
        throw new Error(`Shiprocket returned non-JSON (${res.status}): ${text.slice(0, 300)}`);
    }
}

// ─── Input validators ─────────────────────────────────────────────────────────

const PIN_RE = /^\d{6}$/;
const AWB_RE = /^[A-Za-z0-9_-]{4,50}$/;
const PHONE_RE = /^\d{10}$/;

function assertPin(pin: string, label = "Pincode") {
    if (!PIN_RE.test(pin)) throw new Error(`${label} must be a 6-digit number (got: ${String(pin).slice(0, 10)})`);
}

function assertPositive(n: number, label: string) {
    if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be a positive number (got: ${n})`);
}

function assertNonEmptyString(s: string, label: string) {
    if (!s || typeof s !== "string" || !s.trim()) throw new Error(`${label} is required`);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: number;
}

export interface ShiprocketForwardShipment {
    orderNumber: string;
    orderDate: string;        // YYYY-MM-DD
    billingName: string;
    billingPhone: string;
    billingEmail: string;
    billingAddress: string;
    billingCity: string;
    billingPincode: string;
    billingState: string;
    paymentMethod: "Prepaid" | "COD";
    codAmount?: number;
    subTotal: number;
    weight: number;           // grams — converted to kg internally (min 10g)
    length?: number;          // cm
    breadth?: number;
    height?: number;
    items: ShiprocketOrderItem[];
}

export interface ShiprocketReturnItem {
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
    imageUrl?: string;
}

// ─── 1. Create Forward Shipment ───────────────────────────────────────────────
// Full flow: create order → serviceability → assign AWB → generate pickup

export async function createForwardShipment(s: ShiprocketForwardShipment): Promise<{
    srOrderId: number;
    shipmentId: number;
    awb: string;
    courierName: string;
    courierCompanyId: number;
}> {
    // Validate inputs before touching the API
    assertNonEmptyString(s.orderNumber, "Order number");
    assertNonEmptyString(s.billingName, "Billing name");
    assertNonEmptyString(s.billingAddress, "Billing address");
    assertNonEmptyString(s.billingCity, "Billing city");
    assertNonEmptyString(s.billingState, "Billing state");
    assertPin(s.billingPincode, "Delivery pincode");
    if (s.billingPhone && !PHONE_RE.test(s.billingPhone)) {
        s = { ...s, billingPhone: "9999999999" }; // fallback — Shiprocket requires 10 digits
    }
    if (s.items.length === 0) throw new Error("At least one order item is required");

    const weightGrams = Math.max(s.weight, 10); // minimum 10g (Shiprocket min is 0.01 kg)
    assertPositive(s.subTotal, "Sub total");

    const weightKg = weightGrams / 1000;
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION ?? "Primary";
    const pickupPin = process.env.SHIPROCKET_PICKUP_POSTCODE ?? "";
    if (!PIN_RE.test(pickupPin)) {
        throw new Error("SHIPROCKET_PICKUP_POSTCODE env var must be a valid 6-digit pincode");
    }

    // ── Step 1: Create order ────────────────────────────────────────────────────
    // Use order number as Shiprocket order_id; append suffix on re-booking to avoid
    // duplicate order_id rejection (Shiprocket returns 422 for duplicates).
    const srOrderId_ref = `${s.orderNumber}`.slice(0, 50);

    const orderBody = {
        order_id: srOrderId_ref,
        order_date: s.orderDate,
        pickup_location: pickupLocation,
        channel_id: process.env.SHIPROCKET_CHANNEL_ID ?? "",
        billing_customer_name: s.billingName.slice(0, 100),
        billing_last_name: "",
        billing_address: s.billingAddress.slice(0, 200),
        billing_city: s.billingCity.slice(0, 50),
        billing_pincode: s.billingPincode,
        billing_state: s.billingState.slice(0, 50),
        billing_country: "India",
        billing_email: s.billingEmail || "noreply@example.com",
        billing_phone: s.billingPhone,
        shipping_is_billing: true,
        order_items: s.items.map((i) => ({
            name: String(i.name).slice(0, 100),
            sku: String(i.sku).slice(0, 50),
            units: Math.max(1, Math.round(i.units)),
            selling_price: Math.max(0, i.selling_price),
            discount: i.discount ?? 0,
            tax: i.tax ?? 0,
            ...(i.hsn ? { hsn: i.hsn } : {}),
        })),
        payment_method: s.paymentMethod,
        sub_total: s.subTotal,
        length: Math.max(1, s.length ?? 10),
        breadth: Math.max(1, s.breadth ?? 10),
        height: Math.max(1, s.height ?? 10),
        weight: weightKg,
        ...(s.paymentMethod === "COD" ? { cod_amount: s.codAmount ?? s.subTotal } : {}),
    };

    const orderRes = await apiFetch(`${BASE}/orders/create/adhoc`, {
        method: "POST",
        body: JSON.stringify(orderBody),
    });
    const orderData = await safeJson(orderRes);

    if (!orderRes.ok) {
        // Shiprocket 422 "order_id already exists" → append timestamp and retry once
        const errMsg = String(orderData.message ?? "").toLowerCase();
        if (orderRes.status === 422 && errMsg.includes("order_id")) {
            const retryBody = { ...orderBody, order_id: `${srOrderId_ref}-${Date.now().toString(36)}` };
            const retryRes = await apiFetch(`${BASE}/orders/create/adhoc`, {
                method: "POST",
                body: JSON.stringify(retryBody),
            });
            const retryData = await safeJson(retryRes);
            if (!retryRes.ok) {
                throw new Error(`Order creation failed (${retryRes.status}): ${String(retryData.message ?? JSON.stringify(retryData)).slice(0, 300)}`);
            }
            Object.assign(orderData, retryData);
        } else {
            throw new Error(`Order creation failed (${orderRes.status}): ${String(orderData.message ?? JSON.stringify(orderData)).slice(0, 300)}`);
        }
    }

    const srOrderId = Number(orderData.order_id);
    const shipmentId = Number(orderData.shipment_id);
    if (!srOrderId || !shipmentId) {
        throw new Error(`Missing order_id/shipment_id in Shiprocket response: ${JSON.stringify(orderData).slice(0, 300)}`);
    }

    // ── Step 2: Get recommended courier ────────────────────────────────────────
    const cod = s.paymentMethod === "COD" ? 1 : 0;
    const svcUrl = `${BASE}/courier/serviceability/?pickup_postcode=${encodeURIComponent(pickupPin)}&delivery_postcode=${encodeURIComponent(s.billingPincode)}&weight=${weightKg}&cod=${cod}`;
    const svcRes = await apiFetch(svcUrl);
    const svcData = await safeJson(svcRes);

    const svcInner = (svcData?.data ?? {}) as Record<string, unknown>;
    const recommended = svcInner.recommended_courier_company_id as number | undefined;
    const available = (svcInner.available_courier_companies as Array<{ id: number; courier_name: string }>) ?? [];
    const courierId = recommended ?? available[0]?.id;

    if (!courierId) {
        throw new Error(`No courier available for delivery pincode ${s.billingPincode}. Check if the pincode is serviceable.`);
    }

    // ── Step 3: Assign AWB ──────────────────────────────────────────────────────
    const awbRes = await apiFetch(`${BASE}/courier/assign/awb`, {
        method: "POST",
        body: JSON.stringify({ shipment_id: shipmentId, courier_id: String(courierId) }),
    });
    const awbData = await safeJson(awbRes);

    if (!awbRes.ok) {
        throw new Error(`AWB assignment failed (${awbRes.status}): ${String(awbData.message ?? JSON.stringify(awbData)).slice(0, 300)}`);
    }

    const awbInfo = ((awbData?.response as Record<string, unknown>)?.data ?? {}) as Record<string, unknown>;
    const awb = String(awbInfo?.awb_code ?? "");
    const courierName = String(awbInfo?.courier_name ?? String(courierId));
    const courierCompanyId = Number(awbInfo?.courier_company_id ?? courierId);

    if (!awb) {
        throw new Error(`AWB not returned by Shiprocket. Response: ${JSON.stringify(awbData).slice(0, 300)}`);
    }

    // ── Step 4: Generate pickup (best-effort; don't fail the whole operation) ──
    try {
        await apiFetch(`${BASE}/courier/generate/pickup`, {
            method: "POST",
            body: JSON.stringify({ shipment_id: [shipmentId] }),
        });
    } catch (e) {
        console.warn("[Shiprocket] Pickup generation failed (non-fatal):", e instanceof Error ? e.message : e);
    }

    return { srOrderId, shipmentId, awb, courierName, courierCompanyId };
}

// ─── 2. Generate Pickup (standalone) ─────────────────────────────────────────

export async function generatePickup(shipmentIds: number[]): Promise<{ success: boolean; message: string }> {
    if (!shipmentIds.length) throw new Error("At least one shipment ID required");
    shipmentIds.forEach((id, i) => assertPositive(id, `shipmentIds[${i}]`));

    const res = await apiFetch(`${BASE}/courier/generate/pickup`, {
        method: "POST",
        body: JSON.stringify({ shipment_id: shipmentIds }),
    });
    const data = await safeJson(res);

    const msg = (data.response as Record<string, unknown>)?.message as string
        ?? data.message as string
        ?? (res.ok ? "Pickup scheduled" : `Failed (${res.status})`);

    return { success: res.ok, message: String(msg).slice(0, 300) };
}

// ─── 3. Generate Label ────────────────────────────────────────────────────────

export async function generateLabel(shipmentId: number): Promise<{ labelUrl: string }> {
    assertPositive(shipmentId, "Shipment ID");

    const res = await apiFetch(`${BASE}/courier/generate/label`, {
        method: "POST",
        body: JSON.stringify({ shipment_id: [shipmentId] }),
    });
    const data = await safeJson(res);
    if (!res.ok) {
        throw new Error(`Label generation failed (${res.status}): ${String(data.message ?? JSON.stringify(data)).slice(0, 300)}`);
    }

    // Shiprocket uses different response shapes across versions — try all known keys
    const resp = data.response as Array<Record<string, unknown>> | Record<string, unknown> | undefined;
    const labelUrl: string | undefined =
        (Array.isArray(resp) ? (resp[0]?.label_url ?? resp[0]?.url) : (resp as Record<string, unknown> | undefined)?.label_url) as string | undefined
        ?? data.label_url as string | undefined
        ?? data.url as string | undefined;

    if (!labelUrl || typeof labelUrl !== "string") {
        throw new Error(`No label URL in Shiprocket response: ${JSON.stringify(data).slice(0, 300)}`);
    }

    return { labelUrl };
}

// ─── 4. Track Shipment by AWB ─────────────────────────────────────────────────

export async function trackShipment(awb: string): Promise<{
    status: string;
    statusCode: string;
    location: string;
    timestamp: string;
    courierName: string;
    etd: string;
    scans: Array<{ status: string; location: string; timestamp: string; detail: string }>;
}> {
    if (!AWB_RE.test(awb)) throw new Error(`Invalid AWB format: ${awb.slice(0, 50)}`);

    const res = await apiFetch(`${BASE}/courier/track/awb/${encodeURIComponent(awb)}`);
    const data = await safeJson(res);

    if (!res.ok) {
        throw new Error(`Track failed (${res.status}): ${String(data.message ?? JSON.stringify(data)).slice(0, 300)}`);
    }

    const td = data.tracking_data as Record<string, unknown> | null | false | undefined;
    if (!td || typeof td !== "object") {
        // Shiprocket returns tracking_data: false for newly created shipments
        return { status: "Pending", statusCode: "", location: "", timestamp: "", courierName: "", etd: "", scans: [] };
    }

    const activities = (td.shipment_track_activities ?? []) as Array<Record<string, unknown>>;
    const latest = activities[0] ?? {};

    return {
        status: String(td.shipment_status ?? ""),
        statusCode: String(td.shipment_status ?? ""),
        location: String(latest["sr-status-label"] ?? td.current_status ?? ""),
        timestamp: String(latest.date ?? ""),
        courierName: String(td.courier_name ?? ""),
        etd: String(td.etd ?? ""),
        scans: activities.slice(0, 100).map((a) => ({  // cap at 100 scans
            status: String(a["sr-status-label"] ?? a.status ?? ""),
            location: String(a.location ?? ""),
            timestamp: String(a.date ?? ""),
            detail: String(a.activity ?? ""),
        })),
    };
}

// ─── 5. Cancel Order ─────────────────────────────────────────────────────────

export async function cancelOrder(srOrderIds: number[]): Promise<{ success: boolean; message: string }> {
    if (!srOrderIds.length) throw new Error("At least one SR order ID required");
    srOrderIds.forEach((id, i) => assertPositive(id, `srOrderIds[${i}]`));

    const res = await apiFetch(`${BASE}/orders/cancel`, {
        method: "POST",
        body: JSON.stringify({ ids: srOrderIds }),
    });
    const data = await safeJson(res);

    const message = String(data.message ?? (res.ok ? "Order cancelled" : `Cancel failed (${res.status})`)).slice(0, 300);

    if (!res.ok) {
        throw new Error(`Cancel failed (${res.status}): ${message}`);
    }

    return { success: true, message };
}

// ─── 6. Serviceability ────────────────────────────────────────────────────────

export async function checkServiceability(p: {
    deliveryPincode: string;
    weight: number;   // grams
    cod: boolean;
}): Promise<{
    serviceable: boolean;
    couriers: Array<{ id: number; name: string; etd: string; rate: number; codAvailable: boolean }>;
    recommended?: number;
    message?: string;
}> {
    assertPin(p.deliveryPincode, "Delivery pincode");
    const weightGrams = Math.max(p.weight, 10);
    const weightKg = weightGrams / 1000;

    const pickupPin = process.env.SHIPROCKET_PICKUP_POSTCODE ?? "";
    if (!PIN_RE.test(pickupPin)) {
        throw new Error("SHIPROCKET_PICKUP_POSTCODE env var must be a valid 6-digit pincode");
    }

    const url = `${BASE}/courier/serviceability/?pickup_postcode=${encodeURIComponent(pickupPin)}&delivery_postcode=${encodeURIComponent(p.deliveryPincode)}&weight=${weightKg}&cod=${p.cod ? 1 : 0}`;
    const res = await apiFetch(url);
    const data = await safeJson(res);

    if (!res.ok) {
        throw new Error(`Serviceability check failed (${res.status}): ${String(data.message ?? JSON.stringify(data)).slice(0, 300)}`);
    }

    const inner = (data.data ?? {}) as Record<string, unknown>;
    const available = (inner.available_courier_companies ?? []) as Array<Record<string, unknown>>;

    if (!available.length) {
        return { serviceable: false, couriers: [], message: "No couriers available for this pincode" };
    }

    return {
        serviceable: true,
        couriers: available.map((c) => ({
            id: Number(c.id),
            name: String(c.courier_name ?? ""),
            etd: String(c.etd ?? c.estimated_delivery_days ?? ""),
            rate: Number(c.freight_charge ?? 0),
            codAvailable: Number(c.cod) === 1,
        })),
        recommended: inner.recommended_courier_company_id != null
            ? Number(inner.recommended_courier_company_id)
            : undefined,
    };
}

// ─── 7. Create Return Order with QC ──────────────────────────────────────────

// Map internal return reason codes to Shiprocket's accepted return_reason values
const SHIPROCKET_RETURN_REASON: Record<string, string> = {
    DAMAGED:       "Both product and shipping box damaged",
    WRONG_ITEM:    "Wrong product shipped",
    QUALITY_ISSUE: "Quality issue",
    CHANGED_MIND:  "Bought by Mistake",
    OTHER:         "Other",
};

export async function createReturnWithQC(p: {
    referenceOrderId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress: string;
    customerCity: string;
    customerState: string;
    customerPincode: string;
    weight: number;   // grams
    subTotal: number;
    returnReason: string;   // one of our internal reason codes (DAMAGED, WRONG_ITEM, QUALITY_ISSUE, CHANGED_MIND, OTHER)
    upiId?: string;         // UPI address for refund transfer
    items: ShiprocketReturnItem[];
}): Promise<{ srOrderId: number; shipmentId: number; awb?: string }> {
    // Validate required fields
    assertNonEmptyString(p.referenceOrderId, "Reference order ID");
    assertNonEmptyString(p.customerName, "Customer name");
    assertNonEmptyString(p.customerAddress, "Customer address");
    assertNonEmptyString(p.customerCity, "Customer city");
    assertNonEmptyString(p.customerState, "Customer state");
    assertPin(p.customerPincode, "Customer pincode");
    if (p.items.length === 0) throw new Error("At least one return item is required");

    const warehouseName = (process.env.SHIPROCKET_SELLER_NAME ?? process.env.SHIPROCKET_PICKUP_LOCATION ?? "Seller").slice(0, 100);
    const warehouseAddress = process.env.SHIPROCKET_RETURN_ADDRESS ?? "";
    const warehouseCity = process.env.SHIPROCKET_RETURN_CITY ?? "";
    const warehouseState = process.env.SHIPROCKET_RETURN_STATE ?? "";
    const warehousePin = process.env.SHIPROCKET_RETURN_POSTCODE ?? process.env.SHIPROCKET_PICKUP_POSTCODE ?? "";
    const warehousePhone = process.env.SHIPROCKET_RETURN_PHONE ?? "";

    if (!warehouseAddress || !warehouseCity || !warehouseState) {
        throw new Error("SHIPROCKET_RETURN_ADDRESS, SHIPROCKET_RETURN_CITY and SHIPROCKET_RETURN_STATE must be set");
    }
    if (!PIN_RE.test(warehousePin)) {
        throw new Error("SHIPROCKET_RETURN_POSTCODE (or SHIPROCKET_PICKUP_POSTCODE) must be a valid 6-digit pincode");
    }

    const weightKg = Math.max(p.weight, 10) / 1000;
    const channelId = process.env.SHIPROCKET_CHANNEL_ID ? Number(process.env.SHIPROCKET_CHANNEL_ID) : 0;
    // Set SHIPROCKET_QC_ENABLED=true in env once Shiprocket support enables QC on your account.
    // Without account-level QC, sending qc_enable:1 returns 400 "Please contact for enabling qc settings".
    const qcEnabled = process.env.SHIPROCKET_QC_ENABLED === "true";

    // Keep uniqueOrderId within 50 chars (Shiprocket limit)
    const suffix = Date.now().toString(36); // ~8 chars
    const baseId = `R-${p.referenceOrderId}`.slice(0, 40);
    const uniqueOrderId = `${baseId}-${suffix}`;

    const customerPhone = PHONE_RE.test(p.customerPhone) ? p.customerPhone : "9999999999";

    const body = {
        order_id: uniqueOrderId,
        order_date: new Date().toISOString().split("T")[0],
        channel_id: channelId,
        // Pickup = customer location (from where we collect the return)
        pickup_customer_name: p.customerName.slice(0, 100),
        pickup_last_name: "",
        pickup_address: p.customerAddress.slice(0, 200),
        pickup_address_2: "",
        pickup_city: p.customerCity.slice(0, 50),
        pickup_state: p.customerState.slice(0, 50),
        pickup_country: "India",
        pickup_pincode: p.customerPincode,
        pickup_email: p.customerEmail || "noreply@example.com",
        pickup_phone: customerPhone,
        pickup_isd_code: "91",
        // Shipping = warehouse (where return is delivered to)
        shipping_customer_name: warehouseName,
        shipping_last_name: "",
        shipping_address: warehouseAddress.slice(0, 200),
        shipping_address_2: "",
        shipping_city: warehouseCity.slice(0, 50),
        shipping_country: "India",
        shipping_pincode: warehousePin,
        shipping_state: warehouseState.slice(0, 50),
        shipping_email: process.env.SHIPROCKET_RETURN_EMAIL ?? "noreply@example.com",
        shipping_phone: warehousePhone || "9999999999",
        shipping_isd_code: "91",
        payment_method: "Prepaid",
        sub_total: Math.max(0, p.subTotal),
        // Refund via UPI transfer to the customer's UPI address
        ...(p.upiId ? { refund_mode: "upi", upi_id: p.upiId } : {}),
        length: 10,
        breadth: 10,
        height: 10,
        weight: weightKg,
        order_items: p.items.map((item) => ({
            name: String(item.name).slice(0, 100),
            sku: String(item.sku || item.name).slice(0, 50),
            units: Math.max(1, Math.round(item.units)),
            selling_price: Math.max(0, item.sellingPrice),
            discount: 0,
            // Always include return_reason; fall back to "Other" when not supplied
            return_reason: SHIPROCKET_RETURN_REASON[p.returnReason ?? ""] ?? "Other",
            // Only enable QC when an image is available — Shiprocket requires both
            // qc_product_name AND qc_product_image; omitting either causes a 400.
            ...(qcEnabled && item.imageUrl ? {
                qc_enable: true,
                qc_product_name: String(item.name).slice(0, 100),
                qc_product_image: item.imageUrl,
            } : {}),
        })),
    };

    const res = await apiFetch(`${BASE}/orders/create/return`, {
        method: "POST",
        body: JSON.stringify(body),
    });
    const data = await safeJson(res);

    if (!res.ok) {
        throw new Error(`Return order creation failed (${res.status}): ${String(data.message ?? JSON.stringify(data)).slice(0, 300)}`);
    }

    const srOrderId = Number(data.order_id);
    const shipmentId = Number(data.shipment_id ?? 0);

    if (!srOrderId) {
        throw new Error(`Missing order_id in Shiprocket return response: ${JSON.stringify(data).slice(0, 300)}`);
    }

    const awb = data.awb_code ? String(data.awb_code) : undefined;
    return { srOrderId, shipmentId, awb };
}

// ─── 8. List pickup addresses ─────────────────────────────────────────────────

export async function listPickupAddresses(): Promise<Array<{ id: number; pickup_location: string; city: string; pin_code: string }>> {
    const res = await apiFetch(`${BASE}/settings/company/pickup`);
    const data = await safeJson(res);
    if (!res.ok) throw new Error(`Failed to fetch pickup addresses (${res.status})`);

    const addresses = ((data.data as Record<string, unknown>)?.shipping_address ?? []) as Array<Record<string, unknown>>;
    return addresses.map((a) => ({
        id: Number(a.id),
        pickup_location: String(a.pickup_location ?? ""),
        city: String(a.city ?? ""),
        pin_code: String(a.pin_code ?? ""),
    }));
}
