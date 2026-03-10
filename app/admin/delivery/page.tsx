"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    shippingName: string;
    shippingCity: string;
    shippingZip: string;
    paymentMethod: string;
    total: number;
    createdAt: string;
    deliveryTracking: {
        trackingNumber: string | null;
        carrier: string | null;
        currentStatus: string;
        currentLocation: string | null;
    } | null;
}

interface Warehouse { name: string; city: string; pin: string; }

const STATUS_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    PENDING: { bg: "rgba(212,134,14,0.12)", text: "#f0b641", glow: "0 0 8px rgba(212,134,14,0.15)" },
    CONFIRMED: { bg: "rgba(46,125,50,0.12)", text: "#66bb6a", glow: "0 0 8px rgba(46,125,50,0.15)" },
    PROCESSING: { bg: "rgba(21,101,192,0.12)", text: "#64b5f6", glow: "0 0 8px rgba(21,101,192,0.15)" },
    SHIPPED: { bg: "rgba(106,27,154,0.12)", text: "#ba68c8", glow: "0 0 8px rgba(106,27,154,0.15)" },
    DELIVERED: { bg: "rgba(27,94,32,0.12)", text: "#81c784", glow: "0 0 8px rgba(27,94,32,0.15)" },
    CANCELLED: { bg: "rgba(183,28,28,0.12)", text: "#ef5350", glow: "0 0 8px rgba(183,28,28,0.15)" },
};

type Tab = "shipments" | "pickup" | "warehouse" | "tools";

export default function AdminDeliveryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [tab, setTab] = useState<Tab>("shipments");

    // Pickup
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [packageCount, setPackageCount] = useState("1");
    const [pickupLoading, setPickupLoading] = useState(false);
    const [pickupMsg, setPickupMsg] = useState<{ ok: boolean; text: string } | null>(null);

    // Warehouse
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [whLoading, setWhLoading] = useState(false);
    const [whForm, setWhForm] = useState({ name: "", address: "", city: "", state: "", pin: "", phone: "", email: "" });
    const [whMsg, setWhMsg] = useState<{ ok: boolean; text: string } | null>(null);

    // Tools
    const [toolPin, setToolPin] = useState("");
    const [toolPaymentMode, setToolPaymentMode] = useState<"Prepaid" | "COD">("Prepaid");
    const [toolWeight, setToolWeight] = useState("500");
    const [toolLoading, setToolLoading] = useState(false);
    const [svcResult, setSvcResult] = useState<{ serviceable: boolean; codAvailable: boolean; prepaidAvailable: boolean; message?: string } | null>(null);
    const [rateResult, setRateResult] = useState<{ rate: number; deliveryCharge: number; gst: number; zone: string } | null>(null);
    const [tatResult, setTatResult] = useState<{ days?: number; expectedDelivery?: string } | null>(null);
    const [toolError, setToolError] = useState("");

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (tab === "warehouse") loadWarehouses();
    }, [tab]);

    async function loadWarehouses() {
        setWhLoading(true);
        try {
            const res = await fetch("/api/admin/delhivery/warehouse");
            const data = await res.json();
            setWarehouses(data.warehouses ?? []);
        } finally { setWhLoading(false); }
    }

    async function createWarehouse() {
        setWhLoading(true);
        setWhMsg(null);
        try {
            const res = await fetch("/api/admin/delhivery/warehouse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(whForm),
            });
            const data = await res.json();
            setWhMsg({ ok: res.ok, text: data.message ?? (res.ok ? "Created!" : "Failed") });
            if (res.ok) { loadWarehouses(); setWhForm({ name: "", address: "", city: "", state: "", pin: "", phone: "", email: "" }); }
        } finally { setWhLoading(false); }
    }

    async function schedulePickup() {
        setPickupLoading(true);
        setPickupMsg(null);
        try {
            const res = await fetch("/api/admin/delhivery/pickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pickupDate, pickupTime, expectedPackageCount: Number(packageCount) }),
            });
            const data = await res.json();
            setPickupMsg({ ok: res.ok, text: data.message ?? (res.ok ? "Scheduled!" : "Failed") });
        } finally { setPickupLoading(false); }
    }

    async function checkServiceability() {
        setToolLoading(true); setSvcResult(null); setRateResult(null); setTatResult(null); setToolError("");
        try {
            const [svcRes, tatRes] = await Promise.all([
                fetch(`/api/admin/delhivery/serviceability?delivery_pin=${toolPin}&payment_mode=${toolPaymentMode}`),
                fetch(`/api/admin/delhivery/tat?destination_pin=${toolPin}`),
            ]);
            const svc = await svcRes.json();
            if (!svcRes.ok) throw new Error(svc.error ?? "Serviceability check failed");
            setSvcResult(svc);
            if (tatRes.ok) {
                const tat = await tatRes.json();
                setTatResult(tat);
            }
        } catch (e: unknown) {
            setToolError(e instanceof Error ? e.message : "Error");
        } finally { setToolLoading(false); }
    }

    async function checkRate() {
        setToolLoading(true); setRateResult(null); setToolError("");
        try {
            const res = await fetch(`/api/admin/delhivery/rate?delivery_pin=${toolPin}&weight=${toolWeight}&payment_mode=${toolPaymentMode}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Rate check failed");
            setRateResult(data);
        } catch (e: unknown) {
            setToolError(e instanceof Error ? e.message : "Error");
        } finally { setToolLoading(false); }
    }

    const displayed = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
    const delhiveryOrders = orders.filter((o) => o.deliveryTracking?.carrier === "Delhivery");
    const activeOrders = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");

    const inputStyle = {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff",
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Delivery Management</h1>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {activeOrders.length} active · {delhiveryOrders.length} via Delhivery
                </p>
            </div>

            {/* Tabs */}
            <div
                className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                {(["shipments", "pickup", "warehouse", "tools"] as Tab[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer capitalize"
                        style={{
                            background: tab === t ? "linear-gradient(135deg, #c9a84c, #e2c975)" : "transparent",
                            color: tab === t ? "#0c0c0c" : "rgba(255,255,255,0.4)",
                            boxShadow: tab === t ? "0 2px 10px rgba(201,168,76,0.25)" : "none",
                        }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Shipments ── */}
            {tab === "shipments" && (
                <>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                            <button key={s} onClick={() => setFilter(s)}
                                className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
                                style={{
                                    background: filter === s ? "linear-gradient(135deg, #c9a84c, #e2c975)" : "rgba(255,255,255,0.04)",
                                    color: filter === s ? "#0c0c0c" : "rgba(255,255,255,0.4)",
                                    border: "1px solid " + (filter === s ? "transparent" : "rgba(255,255,255,0.08)"),
                                    boxShadow: filter === s ? "0 2px 10px rgba(201,168,76,0.25)" : "none",
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                            {["Order #", "Customer", "City / PIN", "Status", "Delivery", "Waybill", "Carrier", "Actions"].map((h) => (
                                                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayed.map((order) => {
                                            const sc = STATUS_COLORS[order.status] ?? { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.5)", glow: "none" };
                                            return (
                                                <tr key={order.id}
                                                    className="transition-colors duration-150"
                                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                                >
                                                    <td className="px-5 py-4 font-semibold" style={{ color: "#e2c975" }}>{order.orderNumber}</td>
                                                    <td className="px-5 py-4 font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{order.shippingName}</td>
                                                    <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{order.shippingCity}<br /><span className="font-mono">{order.shippingZip}</span></td>
                                                    <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase" style={{ background: sc.bg, color: sc.text, boxShadow: sc.glow }}>{order.status}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                                        {order.deliveryTracking?.currentStatus ?? "—"}
                                                        {order.deliveryTracking?.currentLocation && <span className="ml-1 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>({order.deliveryTracking.currentLocation})</span>}
                                                    </td>
                                                    <td className="px-5 py-4 text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{order.deliveryTracking?.trackingNumber ?? "—"}</td>
                                                    <td className="px-5 py-4 text-xs">
                                                        {order.deliveryTracking?.carrier
                                                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(230,57,70,0.12)", color: "#ef5350" }}>{order.deliveryTracking.carrier}</span>
                                                            : "—"}
                                                    </td>
                                                    <td className="px-5 py-4 flex gap-3">
                                                        <Link href={`/admin/orders/${order.id}`} className="text-xs font-semibold hover:opacity-70" style={{ color: "#c9a84c" }}>Manage →</Link>
                                                        {order.deliveryTracking?.trackingNumber && order.deliveryTracking.carrier === "Delhivery" && (
                                                            <a href={`/api/admin/delhivery/label/${order.deliveryTracking.trackingNumber}`} target="_blank" rel="noreferrer" className="text-xs font-semibold hover:opacity-70" style={{ color: "rgba(255,255,255,0.4)" }}>Label ↗</a>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {displayed.length === 0 && <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No shipments found</p>}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Pickup ── */}
            {tab === "pickup" && (
                <div className="max-w-md">
                    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Create Pickup Request (PUR)</h2>
                        <div className="flex flex-col gap-4">
                            {[
                                { label: "Pickup Date", type: "date", value: pickupDate, set: setPickupDate, min: new Date().toISOString().split("T")[0] },
                                { label: "Pickup Time", type: "time", value: pickupTime, set: setPickupTime },
                                { label: "Expected Package Count", type: "number", value: packageCount, set: setPackageCount },
                            ].map(({ label, type, value, set, min }) => (
                                <div key={label}>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                                    <input type={type} value={value} min={min} onChange={(e) => set(e.target.value)}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                                </div>
                            ))}
                            <button onClick={schedulePickup} disabled={pickupLoading || !pickupDate}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}>
                                {pickupLoading ? "Scheduling..." : "Schedule Pickup"}
                            </button>
                            {pickupMsg && (
                                <p className="text-xs font-semibold px-3 py-2 rounded-xl" style={{
                                    background: pickupMsg.ok ? "rgba(46,125,50,0.12)" : "rgba(183,28,28,0.12)",
                                    color: pickupMsg.ok ? "#81c784" : "#ef5350",
                                    border: `1px solid ${pickupMsg.ok ? "rgba(46,125,50,0.2)" : "rgba(183,28,28,0.2)"}`,
                                }}>
                                    {pickupMsg.text}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Warehouse ── */}
            {tab === "warehouse" && (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Create form */}
                    <div className="flex-1 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Register Warehouse / Pickup Location</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {([
                                { key: "name", label: "Warehouse Name" },
                                { key: "phone", label: "Phone" },
                                { key: "address", label: "Address" },
                                { key: "city", label: "City" },
                                { key: "state", label: "State" },
                                { key: "pin", label: "PIN Code" },
                                { key: "email", label: "Email (optional)" },
                            ] as { key: keyof typeof whForm; label: string }[]).map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                                    <input value={whForm[key]} onChange={(e) => setWhForm((f) => ({ ...f, [key]: e.target.value }))}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                                </div>
                            ))}
                        </div>
                        <button onClick={createWarehouse} disabled={whLoading}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}>
                            {whLoading ? "Saving..." : "Register Warehouse"}
                        </button>
                        {whMsg && (
                            <p className="mt-3 text-xs font-semibold px-3 py-2 rounded-xl" style={{
                                background: whMsg.ok ? "rgba(46,125,50,0.12)" : "rgba(183,28,28,0.12)",
                                color: whMsg.ok ? "#81c784" : "#ef5350",
                                border: `1px solid ${whMsg.ok ? "rgba(46,125,50,0.2)" : "rgba(183,28,28,0.2)"}`,
                            }}>
                                {whMsg.text}
                            </p>
                        )}
                    </div>

                    {/* List */}
                    <div className="w-full lg:w-72 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>Registered Warehouses</h2>
                        {whLoading ? (
                            <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} /></div>
                        ) : warehouses.length === 0 ? (
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No warehouses found</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {warehouses.map((w, i) => (
                                    <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{w.name}</p>
                                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{w.city} — {w.pin}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tools ── */}
            {tab === "tools" && (
                <div className="max-w-lg flex flex-col gap-6">
                    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Serviceability & Rate Check</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Customer Delivery PIN</label>
                                <input value={toolPin} onChange={(e) => setToolPin(e.target.value)} maxLength={6}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} placeholder="e.g. 400001" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Payment Mode</label>
                                    <select value={toolPaymentMode} onChange={(e) => setToolPaymentMode(e.target.value as "Prepaid" | "COD")}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle}>
                                        <option value="Prepaid">Prepaid</option>
                                        <option value="COD">COD</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Weight (g) — for rate</label>
                                    <input type="number" value={toolWeight} onChange={(e) => setToolWeight(e.target.value)}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={checkServiceability} disabled={toolLoading || toolPin.length < 6}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: "linear-gradient(135deg, rgba(21,101,192,0.3), rgba(21,101,192,0.1))", color: "#64b5f6", border: "1px solid rgba(21,101,192,0.2)" }}>
                                    {toolLoading ? "Checking..." : "Check Serviceability"}
                                </button>
                                <button onClick={checkRate} disabled={toolLoading || toolPin.length < 6}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}>
                                    {toolLoading ? "..." : "Get Rate"}
                                </button>
                            </div>

                            {toolError && (
                                <p className="text-xs font-semibold px-3 py-2 rounded-xl" style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.2)" }}>{toolError}</p>
                            )}

                            {/* Serviceability result */}
                            {svcResult && (
                                <div className="rounded-xl p-4" style={{
                                    background: svcResult.serviceable ? "rgba(46,125,50,0.08)" : "rgba(183,28,28,0.08)",
                                    border: `1px solid ${svcResult.serviceable ? "rgba(46,125,50,0.2)" : "rgba(183,28,28,0.2)"}`,
                                }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: svcResult.serviceable ? "#81c784" : "#ef5350" }}>
                                            {svcResult.serviceable ? "✓ Serviceable" : "✗ Not Serviceable"}
                                        </p>
                                        {svcResult.message && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{svcResult.message}</p>}
                                    </div>
                                    {svcResult.serviceable && (
                                        <div className="flex gap-3">
                                            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold" style={{
                                                background: svcResult.prepaidAvailable ? "rgba(21,101,192,0.12)" : "rgba(255,255,255,0.04)",
                                                color: svcResult.prepaidAvailable ? "#64b5f6" : "rgba(255,255,255,0.25)",
                                            }}>
                                                {svcResult.prepaidAvailable ? "✓" : "✗"} Prepaid
                                            </span>
                                            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold" style={{
                                                background: svcResult.codAvailable ? "rgba(212,134,14,0.12)" : "rgba(255,255,255,0.04)",
                                                color: svcResult.codAvailable ? "#f0b641" : "rgba(255,255,255,0.25)",
                                            }}>
                                                {svcResult.codAvailable ? "✓" : "✗"} COD
                                            </span>
                                            {tatResult?.days && (
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ background: "rgba(106,27,154,0.12)", color: "#ba68c8" }}>
                                                    TAT: {tatResult.days} days
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rate result */}
                            {rateResult && (
                                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Shipping Rate — Zone {rateResult.zone}</p>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: "rgba(255,255,255,0.5)" }}>Delivery Charge</span>
                                            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>₹{rateResult.deliveryCharge}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: "rgba(255,255,255,0.5)" }}>GST</span>
                                            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>₹{rateResult.gst.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                            <span className="font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>Total</span>
                                            <span className="font-bold text-base" style={{ color: "#e2c975" }}>₹{rateResult.rate.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
