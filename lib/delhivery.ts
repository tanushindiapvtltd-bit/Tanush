const BASE = process.env.DELHIVERY_BASE_URL ?? "https://staging-express.delhivery.com";
const TOKEN = process.env.DELHIVERY_API_TOKEN ?? "";

function authHeaders() {
    return {
        Authorization: `Token ${TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
    };
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreateShipmentData {
    name: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    country?: string;
    phone: string;
    orderNumber: string;
    paymentMode: "Prepaid" | "CoD";
    codAmount?: number;
    totalAmount: number;
    productDesc: string;
    weight: number; // kg
    length?: number;
    width?: number;
    height?: number;
    orderDate?: string; // YYYY-MM-DD
}

export interface ShipmentCreatedResult {
    waybill: string;
    sortCode?: string;
}

export interface TrackEvent {
    status: string;
    location: string;
    timestamp: string;
    instructions?: string;
}

export interface TrackResult {
    waybill: string;
    status: string;
    location: string;
    expectedDelivery?: string;
    events: TrackEvent[];
    origin?: string;
    destination?: string;
}

export interface ServiceabilityResult {
    pincode: string;
    serviceable: boolean;
    city?: string;
    state?: string;
    district?: string;
    cod?: boolean;
    prepaid?: boolean;
}

export interface ShippingRate {
    total: number;
    codCharge?: number;
    fuelSurcharge?: number;
    docketCharge?: number;
    otherCharges?: number;
}

// ── Create Shipment ────────────────────────────────────────────────────────

export async function createShipment(data: CreateShipmentData): Promise<ShipmentCreatedResult> {
    const shipment = {
        name: data.name,
        add: data.address,
        pin: data.pincode,
        city: data.city,
        state: data.state,
        country: data.country ?? "India",
        phone: data.phone,
        order: data.orderNumber,
        payment_mode: data.paymentMode,
        return_pin: process.env.DELHIVERY_RETURN_PIN ?? "",
        return_city: process.env.DELHIVERY_RETURN_CITY ?? "",
        return_phone: process.env.DELHIVERY_RETURN_PHONE ?? "",
        return_add: process.env.DELHIVERY_RETURN_ADDRESS ?? "",
        return_name: process.env.DELHIVERY_SELLER_NAME ?? "Tanush",
        return_country: "India",
        products_desc: data.productDesc,
        hsn_code: "",
        cod_amount: data.paymentMode === "CoD" ? String(data.codAmount ?? data.totalAmount) : "0",
        order_date: data.orderDate ?? new Date().toISOString().split("T")[0],
        total_amount: String(data.totalAmount),
        seller_add: process.env.DELHIVERY_RETURN_ADDRESS ?? "",
        seller_name: process.env.DELHIVERY_SELLER_NAME ?? "Tanush",
        seller_inv: data.orderNumber,
        quantity: "1",
        waybill: "",
        shipment_width: String(data.width ?? 10),
        shipment_height: String(data.height ?? 10),
        weight: String(data.weight),
        shipment_length: String(data.length ?? 10),
        seller_gst_tin: process.env.DELHIVERY_GSTIN ?? "",
        shipping_mode: "Surface",
        address_type: "home",
    };

    const body = new URLSearchParams({
        format: "json",
        data: JSON.stringify({ shipments: [shipment] }),
    });

    const res = await fetch(`${BASE}/api/cmu/create.json`, {
        method: "POST",
        headers: authHeaders(),
        body: body.toString(),
    });

    const json = await res.json();

    const pkg = json.packages?.[0];
    if (!pkg?.waybill) {
        throw new Error(pkg?.error ?? json.error ?? "Failed to create shipment — check Delhivery credentials and return address config");
    }

    return { waybill: pkg.waybill, sortCode: pkg.sort_code };
}

// ── Track Shipment ─────────────────────────────────────────────────────────

export async function trackShipment(waybill: string): Promise<TrackResult> {
    const res = await fetch(
        `${BASE}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}&token=${TOKEN}`,
        { headers: { Authorization: `Token ${TOKEN}` } }
    );

    if (!res.ok) throw new Error(`Track failed: ${res.statusText}`);

    const json = await res.json();
    const ship = json.ShipmentData?.[0]?.Shipment;

    if (!ship) throw new Error("Shipment not found in Delhivery system");

    const events: TrackEvent[] = (ship.Scans ?? []).map(
        (s: { ScanDetail: { Scan: string; ScannedLocation: string; ScanDateTime: string; Instructions: string } }) => ({
            status: s.ScanDetail.Scan,
            location: s.ScanDetail.ScannedLocation,
            timestamp: s.ScanDetail.ScanDateTime,
            instructions: s.ScanDetail.Instructions || undefined,
        })
    );

    return {
        waybill: ship.AWBNo ?? waybill,
        status: ship.Status?.Status ?? "Unknown",
        location: ship.Status?.StatusLocation ?? "",
        expectedDelivery: ship.ExpectedDate ?? undefined,
        events,
        origin: ship.Origin ?? undefined,
        destination: ship.Destination ?? undefined,
    };
}

// ── Cancel Shipment ────────────────────────────────────────────────────────

export async function cancelShipment(waybill: string): Promise<{ success: boolean; message: string }> {
    const body = new URLSearchParams({
        format: "json",
        data: JSON.stringify({ waybill, cancellation: true }),
    });

    const res = await fetch(`${BASE}/api/p/edit`, {
        method: "POST",
        headers: authHeaders(),
        body: body.toString(),
    });

    const json = await res.json();
    return {
        success: json.status === true || json.success === true,
        message: json.message ?? "Cancellation processed",
    };
}

// ── Schedule Pickup ────────────────────────────────────────────────────────

export async function schedulePickup(params: {
    pickupTime: string; // "YYYY-MM-DD HH:MM:SS"
    pickupLocation: string;
    expectedCount: number;
}): Promise<{ success: boolean; id?: string; message?: string }> {
    const body = new URLSearchParams({
        format: "json",
        data: JSON.stringify({
            pickup_time: params.pickupTime,
            pickup_location: params.pickupLocation,
            expected_package_count: params.expectedCount,
        }),
    });

    const res = await fetch(`${BASE}/fm/request/new/`, {
        method: "POST",
        headers: authHeaders(),
        body: body.toString(),
    });

    const json = await res.json();
    return {
        success: json.pr?.success ?? false,
        id: json.pr?.id,
        message: json.pr?.message ?? json.message,
    };
}

// ── Serviceability Check ───────────────────────────────────────────────────

export async function checkServiceability(pincode: string): Promise<ServiceabilityResult> {
    const res = await fetch(
        `${BASE}/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`,
        { headers: { Authorization: `Token ${TOKEN}` } }
    );

    if (!res.ok) throw new Error(`Serviceability check failed: ${res.statusText}`);

    const json = await res.json();
    const pin = json.delivery_codes?.[0]?.postal_code;

    if (!pin) return { pincode, serviceable: false };

    return {
        pincode,
        serviceable: true,
        city: pin.city,
        state: pin.state_code,
        district: pin.district,
        cod: pin.cod === "Y",
        prepaid: pin.pre_paid === "Y",
    };
}

// ── Shipping Rate ──────────────────────────────────────────────────────────

export async function getShippingRate(
    pickupPostcode: string,
    deliveryPostcode: string,
    weightGrams: number,
    cod: boolean
): Promise<ShippingRate> {
    const params = new URLSearchParams({
        pickup_postcode: pickupPostcode,
        delivery_postcode: deliveryPostcode,
        cod: cod ? "1" : "0",
        weight: String(weightGrams),
    });

    const res = await fetch(`${BASE}/api/p/serviceability/?${params}`, {
        headers: { Authorization: `Token ${TOKEN}` },
    });

    if (!res.ok) throw new Error(`Rate fetch failed: ${res.statusText}`);

    const json = await res.json();
    const rate = json.data?.[0];

    if (!rate) throw new Error("No rate data returned");

    return {
        total: rate.total_amount ?? 0,
        codCharge: rate.cod_charges ?? undefined,
        fuelSurcharge: rate.fuel_surcharge ?? undefined,
        docketCharge: rate.docket_charge ?? undefined,
        otherCharges: rate.other_charges ?? undefined,
    };
}

// ── Status Mapper ──────────────────────────────────────────────────────────

export function mapDelhiveryStatus(status: string): string {
    const map: Record<string, string> = {
        Manifested: "Shipped",
        "Picked Up": "Shipped",
        "In Transit": "Shipped",
        "Reached At Hub": "Shipped",
        "Reached At Destination Hub": "Shipped",
        Dispatched: "Shipped",
        "Out For Delivery": "Out for Delivery",
        Delivered: "Delivered",
        "RTO Initiated": "Processing",
        "RTO Out for Delivery": "Processing",
        "RTO Delivered": "Cancelled",
        Cancelled: "Cancelled",
    };
    return map[status] ?? "Shipped";
}

// ── Label URL ──────────────────────────────────────────────────────────────

export function getLabelUrl(waybill: string): string {
    return `${BASE}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&token=${TOKEN}`;
}

// ── Reverse Pickup (Returns) ───────────────────────────────────────────────

export interface ReversePickupData {
    customerName: string;
    customerAddress: string;
    customerPincode: string;
    customerCity: string;
    customerState: string;
    customerPhone: string;
    originalOrderNumber: string;
    totalAmount: number;
    productDesc: string;
    weight?: number;
}

export async function createReversePickup(data: ReversePickupData): Promise<ShipmentCreatedResult> {
    // Reverse pickup: customer is sender, warehouse is destination
    const shipment = {
        name: data.customerName,
        add: data.customerAddress,
        pin: data.customerPincode,
        city: data.customerCity,
        state: data.customerState,
        country: "India",
        phone: data.customerPhone,
        order: `REV-${data.originalOrderNumber}`,
        payment_mode: "Prepaid",
        return_pin: process.env.DELHIVERY_RETURN_PIN ?? "",
        return_city: process.env.DELHIVERY_RETURN_CITY ?? "",
        return_phone: process.env.DELHIVERY_RETURN_PHONE ?? "",
        return_add: process.env.DELHIVERY_RETURN_ADDRESS ?? "",
        return_name: process.env.DELHIVERY_SELLER_NAME ?? "Tanush",
        return_country: "India",
        products_desc: data.productDesc,
        hsn_code: "",
        cod_amount: "0",
        order_date: new Date().toISOString().split("T")[0],
        total_amount: String(data.totalAmount),
        seller_add: process.env.DELHIVERY_RETURN_ADDRESS ?? "",
        seller_name: process.env.DELHIVERY_SELLER_NAME ?? "Tanush",
        seller_inv: `REV-${data.originalOrderNumber}`,
        quantity: "1",
        waybill: "",
        shipment_width: "10",
        shipment_height: "10",
        weight: String(data.weight ?? 0.5),
        shipment_length: "10",
        seller_gst_tin: process.env.DELHIVERY_GSTIN ?? "",
        shipping_mode: "Surface",
        address_type: "home",
        return_awb: "Y", // Flag as reverse pickup
    };

    const body = new URLSearchParams({
        format: "json",
        data: JSON.stringify({ shipments: [shipment] }),
    });

    const res = await fetch(`${BASE}/api/cmu/create.json`, {
        method: "POST",
        headers: authHeaders(),
        body: body.toString(),
    });

    const json = await res.json();
    const pkg = json.packages?.[0];
    if (!pkg?.waybill) {
        throw new Error(pkg?.error ?? json.error ?? "Failed to create reverse pickup");
    }
    return { waybill: pkg.waybill, sortCode: pkg.sort_code };
}

// ── Manifest Generation ────────────────────────────────────────────────────

export async function generateManifest(waybills: string[]): Promise<{ manifestUrl?: string; success: boolean }> {
    const body = new URLSearchParams({
        format: "json",
        data: JSON.stringify({ waybill: waybills.join(",") }),
    });

    const res = await fetch(`${BASE}/api/p/manifest`, {
        method: "POST",
        headers: authHeaders(),
        body: body.toString(),
    });

    const json = await res.json();
    return {
        success: res.ok,
        manifestUrl: json.manifest_download_url ?? json.url ?? undefined,
    };
}

// ── NDR Management ─────────────────────────────────────────────────────────

export interface NDRShipment {
    waybill: string;
    status: string;
    ndrReason: string;
    attemptCount: number;
    lastAttempt?: string;
    customerName?: string;
    customerPhone?: string;
    customerCity?: string;
}

export async function getNDRList(): Promise<NDRShipment[]> {
    const res = await fetch(
        `${BASE}/api/p/ndr/?token=${TOKEN}`,
        { headers: { Authorization: `Token ${TOKEN}` } }
    );

    if (!res.ok) throw new Error(`NDR fetch failed: ${res.statusText}`);

    const json = await res.json();
    const packages = json.data ?? json.packages ?? [];
    return packages.map((p: {
        waybill?: string; awb?: string;
        status?: string; ndr_reason?: string;
        attempt_count?: number; last_attempt?: string;
        consignee?: string; phone?: string; city?: string;
    }) => ({
        waybill: p.waybill ?? p.awb ?? "",
        status: p.status ?? "NDR",
        ndrReason: p.ndr_reason ?? "",
        attemptCount: p.attempt_count ?? 0,
        lastAttempt: p.last_attempt,
        customerName: p.consignee,
        customerPhone: p.phone,
        customerCity: p.city,
    }));
}

export async function updateNDRAction(
    waybill: string,
    action: "reattempt" | "address_update" | "cancel",
    newAddress?: {
        address: string;
        city: string;
        pincode: string;
        phone: string;
    }
): Promise<{ success: boolean; message: string }> {
    const actionData: Record<string, unknown> = { waybill };

    if (action === "reattempt") {
        actionData.act = "A"; // Reattempt
    } else if (action === "cancel") {
        actionData.cancellation = true;
    } else if (action === "address_update" && newAddress) {
        actionData.act = "D"; // Delivery address update
        actionData.new_add = newAddress.address;
        actionData.new_city = newAddress.city;
        actionData.new_pin = newAddress.pincode;
        actionData.new_phone = newAddress.phone;
    }

    const body = new URLSearchParams({
        format: "json",
        data: JSON.stringify(actionData),
    });

    const res = await fetch(`${BASE}/api/p/edit`, {
        method: "POST",
        headers: authHeaders(),
        body: body.toString(),
    });

    const json = await res.json();
    return {
        success: json.status === true || res.ok,
        message: json.message ?? "Action processed",
    };
}
