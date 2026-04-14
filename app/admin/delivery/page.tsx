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

interface Courier {
    id: number;
    name: string;
    etd: string;
    rate: number;
    codAvailable: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    PENDING: { bg: "rgba(212,134,14,0.12)", text: "#f0b641", glow: "0 0 8px rgba(212,134,14,0.15)" },
    CONFIRMED: { bg: "rgba(46,125,50,0.12)", text: "#66bb6a", glow: "0 0 8px rgba(46,125,50,0.15)" },
    PROCESSING: { bg: "rgba(21,101,192,0.12)", text: "#64b5f6", glow: "0 0 8px rgba(21,101,192,0.15)" },
    SHIPPED: { bg: "rgba(106,27,154,0.12)", text: "#ba68c8", glow: "0 0 8px rgba(106,27,154,0.15)" },
    DELIVERED: { bg: "rgba(27,94,32,0.12)", text: "#81c784", glow: "0 0 8px rgba(27,94,32,0.15)" },
    CANCELLED: { bg: "rgba(183,28,28,0.12)", text: "#ef5350", glow: "0 0 8px rgba(183,28,28,0.15)" },
};

type Tab = "shipments" | "pickup" | "tools";

export default function AdminDeliveryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [tab, setTab] = useState<Tab>("shipments");

    // Pickup
    const [pickupShipmentId, setPickupShipmentId] = useState("");
    const [pickupLoading, setPickupLoading] = useState(false);
    const [pickupMsg, setPickupMsg] = useState<{ ok: boolean; text: string } | null>(null);

    // Tools — serviceability
    const [toolPin, setToolPin] = useState("");
    const [toolPaymentMode, setToolPaymentMode] = useState<"Prepaid" | "COD">("Prepaid");
    const [toolWeight, setToolWeight] = useState("500");
    const [toolLoading, setToolLoading] = useState(false);
    const [svcResult, setSvcResult] = useState<{ serviceable: boolean; couriers: Courier[]; recommended?: number; message?: string } | null>(null);
    const [toolError, setToolError] = useState("");

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    async function schedulePickup() {
        if (!pickupShipmentId.trim()) return;
        setPickupLoading(true);
        setPickupMsg(null);
        try {
            const res = await fetch("/api/admin/shiprocket/pickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentIds: [Number(pickupShipmentId)] }),
            });
            const data = await res.json();
            setPickupMsg({ ok: res.ok, text: data.message ?? (res.ok ? "Pickup scheduled!" : "Failed") });
        } finally {
            setPickupLoading(false);
        }
    }

    async function checkServiceability() {
        setToolLoading(true);
        setSvcResult(null);
        setToolError("");
        try {
            const cod = toolPaymentMode === "COD" ? "1" : "0";
            const res = await fetch(
                `/api/admin/shiprocket/serviceability?delivery_pin=${toolPin}&weight=${toolWeight}&cod=${cod}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Serviceability check failed");
            setSvcResult(data);
        } catch (e: unknown) {
            setToolError(e instanceof Error ? e.message : "Error");
        } finally {
            setToolLoading(false);
        }
    }

    const displayed = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
    const shiprocketOrders = orders.filter((o) => o.deliveryTracking?.carrier === "Shiprocket");
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
                    {activeOrders.length} active · {shiprocketOrders.length} via Shiprocket
                </p>
            </div>

            {/* Tabs */}
            <div
                className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                {(["shipments", "pickup", "tools"] as Tab[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
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
                                            {["Order #", "Customer", "City / PIN", "Status", "Delivery", "AWB", "Carrier", "Actions"].map((h) => (
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
                                                    <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                                                        {order.shippingCity}<br /><span className="font-mono">{order.shippingZip}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase" style={{ background: sc.bg, color: sc.text, boxShadow: sc.glow }}>{order.status}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                                        {order.deliveryTracking?.currentStatus ?? "—"}
                                                        {order.deliveryTracking?.currentLocation && (
                                                            <span className="ml-1 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>({order.deliveryTracking.currentLocation})</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{order.deliveryTracking?.trackingNumber ?? "—"}</td>
                                                    <td className="px-5 py-4 text-xs">
                                                        {order.deliveryTracking?.carrier
                                                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(255,107,53,0.12)", color: "#ff7043" }}>{order.deliveryTracking.carrier}</span>
                                                            : "—"}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Link href={`/admin/orders/${order.id}`} className="text-xs font-semibold hover:opacity-70" style={{ color: "#c9a84c" }}>Manage →</Link>
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
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>Generate Pickup Request</h2>
                        <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Enter the Shiprocket shipment ID to schedule a pickup. The shipment ID is shown after booking on the order detail page.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Shipment ID</label>
                                <input
                                    type="number"
                                    value={pickupShipmentId}
                                    onChange={(e) => setPickupShipmentId(e.target.value)}
                                    placeholder="e.g. 87654321"
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                            <button
                                onClick={schedulePickup}
                                disabled={pickupLoading || !pickupShipmentId.trim()}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                            >
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

            {/* ── Tools ── */}
            {tab === "tools" && (
                <div className="max-w-lg flex flex-col gap-6">
                    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Courier Serviceability Check</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Customer Delivery PIN</label>
                                <input
                                    value={toolPin}
                                    onChange={(e) => setToolPin(e.target.value)}
                                    maxLength={6}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                    style={inputStyle}
                                    placeholder="e.g. 400001"
                                />
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
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Weight (g)</label>
                                    <input
                                        type="number"
                                        value={toolWeight}
                                        onChange={(e) => setToolWeight(e.target.value)}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={checkServiceability}
                                disabled={toolLoading || toolPin.length < 6}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                            >
                                {toolLoading ? "Checking..." : "Check Couriers"}
                            </button>

                            {toolError && (
                                <p className="text-xs font-semibold px-3 py-2 rounded-xl" style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.2)" }}>
                                    {toolError}
                                </p>
                            )}

                            {svcResult && (
                                <div className="rounded-xl p-4" style={{
                                    background: svcResult.serviceable ? "rgba(46,125,50,0.08)" : "rgba(183,28,28,0.08)",
                                    border: `1px solid ${svcResult.serviceable ? "rgba(46,125,50,0.2)" : "rgba(183,28,28,0.2)"}`,
                                }}>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: svcResult.serviceable ? "#81c784" : "#ef5350" }}>
                                        {svcResult.serviceable ? `✓ Serviceable — ${svcResult.couriers.length} courier${svcResult.couriers.length !== 1 ? "s" : ""}` : "✗ Not Serviceable"}
                                    </p>
                                    {svcResult.message && <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{svcResult.message}</p>}
                                    {svcResult.couriers.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {svcResult.couriers.map((c) => (
                                                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{
                                                    background: c.id === svcResult.recommended ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
                                                    border: `1px solid ${c.id === svcResult.recommended ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)"}`,
                                                }}>
                                                    <div>
                                                        <p className="text-xs font-semibold" style={{ color: c.id === svcResult.recommended ? "#e2c975" : "rgba(255,255,255,0.8)" }}>
                                                            {c.name}
                                                            {c.id === svcResult.recommended && (
                                                                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase" style={{ background: "rgba(201,168,76,0.2)", color: "#e2c975" }}>Recommended</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                                            ETD: {c.etd} · {c.codAvailable ? "COD ✓" : "Prepaid only"}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-bold" style={{ color: "#e2c975" }}>₹{c.rate}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
