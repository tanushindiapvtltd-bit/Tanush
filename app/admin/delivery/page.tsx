"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    shippingName: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    total: number;
    createdAt: string;
    deliveryTracking: {
        trackingNumber: string | null;
        carrier: string | null;
        currentStatus: string;
        currentLocation: string | null;
        estimatedDelivery: string | null;
    } | null;
}

interface TrackEvent {
    status: string;
    location: string;
    timestamp: string;
    instructions?: string;
}

interface LiveTrackData {
    waybill: string;
    status: string;
    location: string;
    expectedDelivery?: string;
    events: TrackEvent[];
    origin?: string;
    destination?: string;
}

interface ServiceabilityResult {
    pincode: string;
    serviceable: boolean;
    city?: string;
    state?: string;
    district?: string;
    cod?: boolean;
    prepaid?: boolean;
}

interface RateResult {
    total: number;
    codCharge?: number;
    fuelSurcharge?: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#fff8e6", text: "#d4860e" },
    CONFIRMED: { bg: "#e6f4ea", text: "#2e7d32" },
    PROCESSING: { bg: "#e3f2fd", text: "#1565c0" },
    SHIPPED: { bg: "#f3e5f5", text: "#6a1b9a" },
    DELIVERED: { bg: "#e8f5e9", text: "#1b5e20" },
    CANCELLED: { bg: "#fce4ec", text: "#b71c1c" },
};

const TABS = ["Shipments", "Pickup Request", "Tools"] as const;
type Tab = (typeof TABS)[number];

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminDeliveryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>("Shipments");
    const [statusFilter, setStatusFilter] = useState("SHIPPED");
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [trackData, setTrackData] = useState<Record<string, LiveTrackData | null>>({});
    const [trackError, setTrackError] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const fetchOrders = useCallback(() => {
        setLoading(true);
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((d) => setOrders(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Shipments Tab helpers ──────────────────────────────────────────────

    const delhiveryOrders = orders.filter((o) => o.deliveryTracking?.carrier === "Delhivery");
    const readyToShip = orders.filter(
        (o) => ["CONFIRMED", "PROCESSING"].includes(o.status) && !o.deliveryTracking?.trackingNumber
    );
    const activeShipments = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));

    const displayed = orders
        .filter((o) => statusFilter === "ALL" || o.status === statusFilter)
        .filter(
            (o) =>
                !search ||
                o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                o.shippingName.toLowerCase().includes(search.toLowerCase())
        );

    const handleTrack = async (waybill: string) => {
        setActionLoading(waybill);
        setTrackError((p) => ({ ...p, [waybill]: "" }));
        try {
            const res = await fetch(`/api/admin/delhivery/track/${encodeURIComponent(waybill)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Track failed");
            setTrackData((p) => ({ ...p, [waybill]: data }));
            showToast("Tracking synced from Delhivery", true);
            fetchOrders();
        } catch (e) {
            setTrackError((p) => ({ ...p, [waybill]: String(e) }));
            showToast("Track failed — " + e, false);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (waybill: string, orderId: string) => {
        if (!confirm(`Cancel Delhivery shipment ${waybill}? This cannot be undone.`)) return;
        setActionLoading(waybill);
        try {
            const res = await fetch("/api/admin/delhivery/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waybill, orderId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Cancel failed");
            showToast("Shipment cancelled", true);
            fetchOrders();
        } catch (e) {
            showToast("Cancel failed — " + e, false);
        } finally {
            setActionLoading(null);
        }
    };

    // ── Pickup Tab ─────────────────────────────────────────────────────────

    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [pickupLocation, setPickupLocation] = useState(process.env.NEXT_PUBLIC_DELHIVERY_WAREHOUSE ?? "");
    const [pickupCount, setPickupCount] = useState("1");
    const [pickupLoading, setPickupLoading] = useState(false);
    const [pickupResult, setPickupResult] = useState<{ success: boolean; id?: string; message?: string } | null>(null);

    const handlePickup = async () => {
        if (!pickupDate || !pickupLocation || !pickupCount) return;
        setPickupLoading(true);
        setPickupResult(null);
        try {
            const pickupDateTime = `${pickupDate} ${pickupTime}:00`;
            const res = await fetch("/api/admin/delhivery/pickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pickupTime: pickupDateTime,
                    pickupLocation,
                    expectedCount: Number(pickupCount),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Pickup request failed");
            setPickupResult(data);
            showToast(data.success ? "Pickup scheduled!" : "Pickup request sent", data.success);
        } catch (e) {
            showToast("Pickup failed — " + e, false);
        } finally {
            setPickupLoading(false);
        }
    };

    // ── Tools Tab ──────────────────────────────────────────────────────────

    const [svcPin, setSvcPin] = useState("");
    const [svcLoading, setSvcLoading] = useState(false);
    const [svcResult, setSvcResult] = useState<ServiceabilityResult | null>(null);

    const [ratePickup, setRatePickup] = useState("");
    const [rateDelivery, setRateDelivery] = useState("");
    const [rateWeight, setRateWeight] = useState("500");
    const [rateCod, setRateCod] = useState(false);
    const [rateLoading, setRateLoading] = useState(false);
    const [rateResult, setRateResult] = useState<RateResult | null>(null);

    const handleServiceability = async () => {
        if (!svcPin.trim()) return;
        setSvcLoading(true);
        setSvcResult(null);
        try {
            const res = await fetch(`/api/admin/delhivery/serviceability?pincode=${svcPin.trim()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSvcResult(data);
        } catch (e) {
            showToast("Check failed — " + e, false);
        } finally {
            setSvcLoading(false);
        }
    };

    const handleRate = async () => {
        if (!ratePickup || !rateDelivery || !rateWeight) return;
        setRateLoading(true);
        setRateResult(null);
        try {
            const params = new URLSearchParams({
                pickup: ratePickup,
                delivery: rateDelivery,
                weight: rateWeight,
                cod: rateCod ? "1" : "0",
            });
            const res = await fetch(`/api/admin/delhivery/rate?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRateResult(data);
        } catch (e) {
            showToast("Rate fetch failed — " + e, false);
        } finally {
            setRateLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="relative">
            {/* Toast */}
            {toast && (
                <div
                    className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl transition-all"
                    style={{ background: toast.ok ? "#1b5e20" : "#b71c1c", color: "#fff" }}
                >
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>
                        Delhivery
                    </h1>
                    <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: "#fff8e6", color: "#d4860e" }}
                    >
                        Partner
                    </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "#888" }}>
                    {activeShipments.length} active · {delhiveryOrders.length} on Delhivery · {readyToShip.length} ready to ship
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Orders", value: orders.length, color: "#1a1a1a" },
                    { label: "Delhivery Shipments", value: delhiveryOrders.length, color: "#6a1b9a" },
                    { label: "Ready to Ship", value: readyToShip.length, color: "#d4860e" },
                    { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, color: "#2e7d32" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl p-4"
                        style={{ background: "#fff", border: "1px solid #e8e3db" }}
                    >
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#aaa" }}>
                            {s.label}
                        </p>
                        <p className="text-2xl font-bold" style={{ color: s.color }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "#e8e3db" }}>
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
                        style={{
                            color: tab === t ? "#c9a84c" : "#888",
                            borderBottom: tab === t ? "2px solid #c9a84c" : "2px solid transparent",
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Shipments Tab ── */}
            {tab === "Shipments" && (
                <>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order # or customer..."
                            className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
                            style={{ border: "1px solid #e0d5c5" }}
                        />
                        <div className="flex flex-wrap gap-2">
                            {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide cursor-pointer transition-all"
                                    style={{
                                        background: statusFilter === s ? "#c9a84c" : "#fff",
                                        color: statusFilter === s ? "#fff" : "#888",
                                        border: "1px solid " + (statusFilter === s ? "#c9a84c" : "#e0d5c5"),
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div
                                className="w-8 h-8 rounded-full border-2 animate-spin"
                                style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }}
                            />
                        </div>
                    ) : (
                        <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                            {["Order #", "Customer", "City / PIN", "Status", "Carrier / Waybill", "Delivery Status", "Actions"].map(
                                                (h) => (
                                                    <th
                                                        key={h}
                                                        className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                                                        style={{ color: "#aaa" }}
                                                    >
                                                        {h}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayed.map((order) => {
                                            const sc = STATUS_COLORS[order.status] ?? { bg: "#f5f5f5", text: "#555" };
                                            const waybill = order.deliveryTracking?.trackingNumber;
                                            const isDelhivery = order.deliveryTracking?.carrier === "Delhivery";
                                            const liveData = waybill ? trackData[waybill] : null;
                                            const trackErr = waybill ? trackError[waybill] : "";
                                            const isLoading = waybill && actionLoading === waybill;

                                            return (
                                                <>
                                                    <tr
                                                        key={order.id}
                                                        style={{ borderBottom: liveData ? "none" : "1px solid #f9f6f1" }}
                                                    >
                                                        <td
                                                            className="px-4 py-3 font-semibold"
                                                            style={{ color: "#c9a84c" }}
                                                        >
                                                            {order.orderNumber}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium" style={{ color: "#1a1a1a" }}>
                                                            {order.shippingName}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs" style={{ color: "#888" }}>
                                                            {order.shippingCity}
                                                            <br />
                                                            <span className="font-mono">{order.shippingZip}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                                                                style={{ background: sc.bg, color: sc.text }}
                                                            >
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs">
                                                            {waybill ? (
                                                                <div>
                                                                    <span
                                                                        className="font-semibold"
                                                                        style={{ color: isDelhivery ? "#6a1b9a" : "#555" }}
                                                                    >
                                                                        {order.deliveryTracking?.carrier ?? "—"}
                                                                    </span>
                                                                    <br />
                                                                    <span className="font-mono" style={{ color: "#888" }}>
                                                                        {waybill}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: "#bbb" }}>Not booked</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs" style={{ color: "#555" }}>
                                                            {order.deliveryTracking?.currentStatus ?? "—"}
                                                            {order.deliveryTracking?.currentLocation && (
                                                                <span className="block text-[10px]" style={{ color: "#aaa" }}>
                                                                    {order.deliveryTracking.currentLocation}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                <Link
                                                                    href={`/admin/orders/${order.id}`}
                                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                                                                    style={{
                                                                        background: "#f5ede0",
                                                                        color: "#c9a84c",
                                                                    }}
                                                                >
                                                                    Manage
                                                                </Link>
                                                                {isDelhivery && waybill && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleTrack(waybill)}
                                                                            disabled={!!isLoading}
                                                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                                                                            style={{ background: "#ede7f6", color: "#6a1b9a" }}
                                                                        >
                                                                            {isLoading ? "..." : "Live Track"}
                                                                        </button>
                                                                        <a
                                                                            href={`https://www.delhivery.com/tracking/?AWB=${waybill}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                                                                            style={{ background: "#e3f2fd", color: "#1565c0" }}
                                                                        >
                                                                            Delhivery ↗
                                                                        </a>
                                                                        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                                                            <button
                                                                                onClick={() => handleCancel(waybill, order.id)}
                                                                                disabled={!!isLoading}
                                                                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                                                                                style={{ background: "#fce4ec", color: "#b71c1c" }}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            {trackErr && (
                                                                <p
                                                                    className="text-[10px] mt-1"
                                                                    style={{ color: "#b71c1c" }}
                                                                >
                                                                    {trackErr}
                                                                </p>
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* Live track expand */}
                                                    {liveData && (
                                                        <tr
                                                            key={`${order.id}-track`}
                                                            style={{ borderBottom: "1px solid #f9f6f1" }}
                                                        >
                                                            <td colSpan={7} className="px-4 pb-4">
                                                                <div
                                                                    className="rounded-xl p-4"
                                                                    style={{ background: "#faf7ff", border: "1px solid #e1bee7" }}
                                                                >
                                                                    <div className="flex flex-wrap gap-4 mb-3">
                                                                        <div>
                                                                            <p
                                                                                className="text-[10px] uppercase tracking-widest"
                                                                                style={{ color: "#aaa" }}
                                                                            >
                                                                                Current Status
                                                                            </p>
                                                                            <p
                                                                                className="text-sm font-bold"
                                                                                style={{ color: "#6a1b9a" }}
                                                                            >
                                                                                {liveData.status}
                                                                            </p>
                                                                        </div>
                                                                        {liveData.location && (
                                                                            <div>
                                                                                <p
                                                                                    className="text-[10px] uppercase tracking-widest"
                                                                                    style={{ color: "#aaa" }}
                                                                                >
                                                                                    Location
                                                                                </p>
                                                                                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                                                                                    {liveData.location}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        {liveData.expectedDelivery && (
                                                                            <div>
                                                                                <p
                                                                                    className="text-[10px] uppercase tracking-widest"
                                                                                    style={{ color: "#aaa" }}
                                                                                >
                                                                                    Expected Delivery
                                                                                </p>
                                                                                <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>
                                                                                    {new Date(liveData.expectedDelivery).toLocaleDateString("en-IN")}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        {liveData.origin && (
                                                                            <div>
                                                                                <p
                                                                                    className="text-[10px] uppercase tracking-widest"
                                                                                    style={{ color: "#aaa" }}
                                                                                >
                                                                                    Route
                                                                                </p>
                                                                                <p className="text-xs font-semibold" style={{ color: "#555" }}>
                                                                                    {liveData.origin} → {liveData.destination}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        <button
                                                                            onClick={() =>
                                                                                setTrackData((p) => ({ ...p, [liveData.waybill]: null }))
                                                                            }
                                                                            className="ml-auto text-xs cursor-pointer"
                                                                            style={{ color: "#aaa" }}
                                                                        >
                                                                            ✕ Close
                                                                        </button>
                                                                    </div>
                                                                    {liveData.events.length > 0 && (
                                                                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                                                                            {[...liveData.events].reverse().map((ev, i) => (
                                                                                <div key={i} className="flex gap-2 items-start">
                                                                                    <div
                                                                                        className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                                                        style={{ background: i === 0 ? "#c9a84c" : "#ccc" }}
                                                                                    />
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                                                                                            {ev.status}
                                                                                        </p>
                                                                                        <p className="text-[10px]" style={{ color: "#888" }}>
                                                                                            {ev.location}
                                                                                            {ev.instructions ? ` · ${ev.instructions}` : ""}
                                                                                        </p>
                                                                                        <p className="text-[10px]" style={{ color: "#bbb" }}>
                                                                                            {new Date(ev.timestamp).toLocaleString("en-IN")}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {displayed.length === 0 && !loading && (
                                    <p className="text-center py-10 text-sm" style={{ color: "#aaa" }}>
                                        No shipments found
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Pickup Request Tab ── */}
            {tab === "Pickup Request" && (
                <div className="max-w-lg">
                    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-sm uppercase tracking-widest mb-1" style={{ color: "#1a1a1a" }}>
                            Schedule Delhivery Pickup
                        </h2>
                        <p className="text-xs mb-5" style={{ color: "#888" }}>
                            Request Delhivery to pick up packages from your warehouse.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                                    Pickup Location (Warehouse Name)
                                </label>
                                <input
                                    value={pickupLocation}
                                    onChange={(e) => setPickupLocation(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ border: "1px solid #e0d5c5" }}
                                    placeholder="Your registered warehouse name in Delhivery"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                                        Pickup Date
                                    </label>
                                    <input
                                        type="date"
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                        style={{ border: "1px solid #e0d5c5" }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                                        Pickup Time
                                    </label>
                                    <input
                                        type="time"
                                        value={pickupTime}
                                        onChange={(e) => setPickupTime(e.target.value)}
                                        className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                        style={{ border: "1px solid #e0d5c5" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                                    Expected Package Count
                                </label>
                                <input
                                    type="number"
                                    value={pickupCount}
                                    onChange={(e) => setPickupCount(e.target.value)}
                                    min="1"
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ border: "1px solid #e0d5c5" }}
                                />
                            </div>

                            <div
                                className="rounded-lg p-3 text-xs"
                                style={{ background: "#fff8e6", border: "1px solid #f5c842" }}
                            >
                                <p style={{ color: "#7a5200" }}>
                                    Ready to ship:{" "}
                                    <strong>{readyToShip.length} order{readyToShip.length !== 1 ? "s" : ""}</strong> (CONFIRMED/PROCESSING without waybill)
                                </p>
                            </div>

                            <button
                                onClick={handlePickup}
                                disabled={pickupLoading || !pickupDate || !pickupLocation}
                                className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-40"
                                style={{ background: "#c9a84c" }}
                            >
                                {pickupLoading ? "Requesting..." : "Request Pickup"}
                            </button>

                            {pickupResult && (
                                <div
                                    className="rounded-lg p-4 text-sm"
                                    style={{
                                        background: pickupResult.success ? "#e8f5e9" : "#fce4ec",
                                        border: `1px solid ${pickupResult.success ? "#a5d6a7" : "#f48fb1"}`,
                                    }}
                                >
                                    <p
                                        className="font-bold"
                                        style={{ color: pickupResult.success ? "#1b5e20" : "#b71c1c" }}
                                    >
                                        {pickupResult.success ? "Pickup Scheduled!" : "Request Submitted"}
                                    </p>
                                    {pickupResult.id && (
                                        <p className="text-xs mt-1" style={{ color: "#555" }}>
                                            Pickup ID: <span className="font-mono">{pickupResult.id}</span>
                                        </p>
                                    )}
                                    {pickupResult.message && (
                                        <p className="text-xs mt-1" style={{ color: "#666" }}>
                                            {pickupResult.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tools Tab ── */}
            {tab === "Tools" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Serviceability Checker */}
                    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-sm uppercase tracking-widest mb-1" style={{ color: "#1a1a1a" }}>
                            Serviceability Check
                        </h2>
                        <p className="text-xs mb-4" style={{ color: "#888" }}>
                            Verify if a pincode is serviceable by Delhivery.
                        </p>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={svcPin}
                                onChange={(e) => setSvcPin(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleServiceability()}
                                maxLength={6}
                                placeholder="Enter pincode"
                                className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none font-mono"
                                style={{ border: "1px solid #e0d5c5" }}
                            />
                            <button
                                onClick={handleServiceability}
                                disabled={svcLoading || !svcPin.trim()}
                                className="px-4 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40"
                                style={{ background: "#c9a84c" }}
                            >
                                {svcLoading ? "..." : "Check"}
                            </button>
                        </div>
                        {svcResult && (
                            <div
                                className="rounded-lg p-4"
                                style={{
                                    background: svcResult.serviceable ? "#e8f5e9" : "#fce4ec",
                                    border: `1px solid ${svcResult.serviceable ? "#a5d6a7" : "#f48fb1"}`,
                                }}
                            >
                                <p
                                    className="font-bold text-sm"
                                    style={{ color: svcResult.serviceable ? "#1b5e20" : "#b71c1c" }}
                                >
                                    {svcResult.serviceable ? "✓ Serviceable" : "✗ Not Serviceable"}
                                </p>
                                {svcResult.serviceable && (
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs" style={{ color: "#555" }}>
                                        {svcResult.city && (
                                            <span>
                                                <strong>City:</strong> {svcResult.city}
                                            </span>
                                        )}
                                        {svcResult.state && (
                                            <span>
                                                <strong>State:</strong> {svcResult.state}
                                            </span>
                                        )}
                                        {svcResult.district && (
                                            <span>
                                                <strong>District:</strong> {svcResult.district}
                                            </span>
                                        )}
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style={{
                                                background: svcResult.cod ? "#e8f5e9" : "#fce4ec",
                                                color: svcResult.cod ? "#2e7d32" : "#b71c1c",
                                            }}
                                        >
                                            COD {svcResult.cod ? "Available" : "Unavailable"}
                                        </span>
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style={{
                                                background: svcResult.prepaid ? "#e8f5e9" : "#fce4ec",
                                                color: svcResult.prepaid ? "#2e7d32" : "#b71c1c",
                                            }}
                                        >
                                            Prepaid {svcResult.prepaid ? "Available" : "Unavailable"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rate Calculator */}
                    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-sm uppercase tracking-widest mb-1" style={{ color: "#1a1a1a" }}>
                            Rate Calculator
                        </h2>
                        <p className="text-xs mb-4" style={{ color: "#888" }}>
                            Get estimated shipping rate for a route.
                        </p>
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>
                                        Pickup PIN
                                    </label>
                                    <input
                                        value={ratePickup}
                                        onChange={(e) => setRatePickup(e.target.value)}
                                        maxLength={6}
                                        placeholder="110001"
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
                                        style={{ border: "1px solid #e0d5c5" }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>
                                        Delivery PIN
                                    </label>
                                    <input
                                        value={rateDelivery}
                                        onChange={(e) => setRateDelivery(e.target.value)}
                                        maxLength={6}
                                        placeholder="400001"
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono"
                                        style={{ border: "1px solid #e0d5c5" }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>
                                        Weight (grams)
                                    </label>
                                    <input
                                        type="number"
                                        value={rateWeight}
                                        onChange={(e) => setRateWeight(e.target.value)}
                                        placeholder="500"
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                        style={{ border: "1px solid #e0d5c5" }}
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rateCod}
                                            onChange={(e) => setRateCod(e.target.checked)}
                                            className="w-4 h-4 accent-amber-500"
                                        />
                                        <span className="text-sm" style={{ color: "#555" }}>
                                            Cash on Delivery
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={handleRate}
                                disabled={rateLoading || !ratePickup || !rateDelivery}
                                className="px-4 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40"
                                style={{ background: "#c9a84c" }}
                            >
                                {rateLoading ? "Calculating..." : "Get Rate"}
                            </button>
                        </div>
                        {rateResult && (
                            <div
                                className="rounded-lg p-4"
                                style={{ background: "#f5ede0", border: "1px solid #e0d5c5" }}
                            >
                                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#888" }}>
                                    Estimated Rate
                                </p>
                                <p className="text-2xl font-bold" style={{ color: "#c9a84c" }}>
                                    ₹{rateResult.total.toLocaleString("en-IN")}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs" style={{ color: "#888" }}>
                                    {rateResult.codCharge != null && (
                                        <span>COD: ₹{rateResult.codCharge}</span>
                                    )}
                                    {rateResult.fuelSurcharge != null && (
                                        <span>Fuel: ₹{rateResult.fuelSurcharge}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
