"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DelhiveryCard from "@/components/admin/DelhiveryCard";

interface TrackingHistory {
    status: string;
    description: string;
    timestamp: string;
    location: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string | null;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    createdAt: string;
    user: { name: string; email: string };
    items: {
        id: string;
        productName: string;
        productImage: string;
        price: number;
        quantity: number;
        size: string | null;
        color: string | null;
        sku: string | null;
    }[];
    deliveryTracking: {
        orderId: string;
        trackingNumber: string | null;
        carrier: string | null;
        estimatedDelivery: string | null;
        currentStatus: string;
        currentLocation: string | null;
        history: TrackingHistory[] | string;
    } | null;
}

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const DELIVERY_STATUSES = ["Order Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" };

export default function AdminOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form state for delivery update
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [deliveryStatus, setDeliveryStatus] = useState("");
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [deliveryNote, setDeliveryNote] = useState("");

    useEffect(() => {
        fetch(`/api/admin/orders/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setOrder(data);
                if (data.deliveryTracking) {
                    setTrackingNumber(data.deliveryTracking.trackingNumber ?? "");
                    setCarrier(data.deliveryTracking.carrier ?? "");
                    setEstimatedDelivery(data.deliveryTracking.estimatedDelivery
                        ? new Date(data.deliveryTracking.estimatedDelivery).toISOString().split("T")[0]
                        : "");
                    setDeliveryStatus(data.deliveryTracking.currentStatus ?? "");
                    setDeliveryLocation(data.deliveryTracking.currentLocation ?? "");
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const updateOrderStatus = async (status: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                const updated = await res.json();
                setOrder((prev) => prev ? { ...prev, status: updated.status } : prev);
            }
        } finally {
            setUpdating(false);
        }
    };

    const updateDelivery = async () => {
        setUpdating(true);
        try {
            await fetch(`/api/admin/delivery/${order?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    trackingNumber,
                    carrier,
                    estimatedDelivery: estimatedDelivery || null,
                    currentStatus: deliveryStatus,
                    currentLocation: deliveryLocation,
                    addHistoryEntry: deliveryNote ? { description: deliveryNote } : undefined,
                }),
            });
            router.refresh();
            // Refetch
            const res = await fetch(`/api/admin/orders/${id}`);
            setOrder(await res.json());
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
        </div>
    );
    if (!order) return <p style={{ color: "rgba(255,255,255,0.4)" }}>Order not found</p>;

    const rawHistory = order.deliveryTracking?.history;
    const history: TrackingHistory[] = Array.isArray(rawHistory)
        ? rawHistory
        : typeof rawHistory === "string"
            ? (() => { try { return JSON.parse(rawHistory); } catch { return []; } })()
            : [];

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-6">
                <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-widest hover:opacity-70" style={{ color: "#c9a84c" }}>
                    ← Orders
                </Link>
                <div className="flex gap-2">
                    {order.deliveryTracking?.trackingNumber && (
                        <button
                            onClick={() => window.open(`/api/admin/delhivery/label/${encodeURIComponent(order.deliveryTracking!.trackingNumber!)}`, "_blank")}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                            style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                        >
                            Print Label
                        </button>
                    )}
                    <button
                        onClick={() => window.open(`/admin-print/${id}`, "_blank")}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        Packing Slip
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#fff" }}>{order.orderNumber}</h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {order.user.name} · {order.user.email} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                </div>

                {/* Quick status */}
                <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => updateOrderStatus(s)}
                            disabled={updating || order.status === s}
                            className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{
                                background: order.status === s ? "linear-gradient(135deg, #c9a84c, #e2c975)" : "rgba(255,255,255,0.04)",
                                color: order.status === s ? "#0c0c0c" : "rgba(255,255,255,0.4)",
                                border: "1px solid " + (order.status === s ? "transparent" : "rgba(255,255,255,0.08)"),
                                boxShadow: order.status === s ? "0 2px 10px rgba(201,168,76,0.25)" : "none",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Items + tracking */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Order Items */}
                    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>Order Items</h2>
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: 56, height: 56, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="56px" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{item.productName}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                                            Qty: {item.quantity}
                                        </span>
                                        {item.size && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(201,168,76,0.15)", color: "#e2c975", border: "1px solid rgba(201,168,76,0.2)" }}>
                                                Size: {item.size}
                                            </span>
                                        )}
                                        {item.color && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(100,181,246,0.1)", color: "#90caf9", border: "1px solid rgba(100,181,246,0.2)" }}>
                                                {item.color}
                                            </span>
                                        )}
                                        {item.sku && (
                                            <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                SKU: {item.sku}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="font-bold text-sm" style={{ color: "#e2c975" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                            </div>
                        ))}
                        <div className="pt-4 flex justify-end">
                            <p className="font-bold text-lg" style={{ color: "#e2c975" }}>Total: ₹{order.total.toLocaleString("en-IN")}</p>
                        </div>
                    </div>

                    {/* Delhivery Integration */}
                    <DelhiveryCard order={order} onUpdate={async () => {
                        const res = await fetch(`/api/admin/orders/${id}`);
                        setOrder(await res.json());
                    }} />

                    {/* Delivery Tracking Update */}
                    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em] mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Update Delivery Tracking</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Tracking Number</label>
                                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle}
                                    placeholder="e.g. SR12345678" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Carrier</label>
                                <select value={carrier} onChange={(e) => setCarrier(e.target.value)}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle}>
                                    <option value="">Select carrier</option>
                                    {["Shiprocket", "Blue Dart", "DTDC", "Delhivery", "FedEx", "Ekart"].map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Estimated Delivery</label>
                                <input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Delivery Status</label>
                                <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle}>
                                    <option value="">Select status</option>
                                    {DELIVERY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Current Location</label>
                                <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle}
                                    placeholder="e.g. Mumbai Hub" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Add Note (optional)</label>
                                <input value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle}
                                    placeholder="e.g. Package received at warehouse" />
                            </div>
                        </div>
                        <button
                            onClick={updateDelivery}
                            disabled={updating}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                        >
                            {updating ? "Updating..." : "Update Tracking"}
                        </button>

                        {/* History */}
                        {history.length > 0 && (
                            <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <h3 className="font-bold text-xs uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Tracking History</h3>
                                <div className="flex flex-col gap-3">
                                    {[...history].reverse().map((entry, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#c9a84c" : "rgba(255,255,255,0.15)" }} />
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{entry.status}</p>
                                                {entry.description && <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{entry.description}</p>}
                                                {entry.location && <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{entry.location}</p>}
                                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{new Date(entry.timestamp).toLocaleString("en-IN")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="flex flex-col gap-5">
                    {/* Payment */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-xs uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Payment</h2>
                        <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
                        </p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                            style={{
                                background: order.paymentStatus === "PAID" ? "rgba(46,125,50,0.12)" : "rgba(212,134,14,0.12)",
                                color: order.paymentStatus === "PAID" ? "#81c784" : "#f0b641",
                            }}>
                            {order.paymentStatus}
                        </span>
                        <div className="mt-3 pt-3 flex flex-col gap-1.5 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="flex justify-between"><span style={{ color: "rgba(255,255,255,0.4)" }}>Subtotal</span><span style={{ color: "rgba(255,255,255,0.7)" }}>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between"><span style={{ color: "rgba(255,255,255,0.4)" }}>Shipping</span><span style={{ color: "rgba(255,255,255,0.7)" }}>₹{order.shippingCost.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between"><span style={{ color: "rgba(255,255,255,0.4)" }}>Tax</span><span style={{ color: "rgba(255,255,255,0.7)" }}>₹{order.tax.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between font-bold pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <span style={{ color: "rgba(255,255,255,0.9)" }}>Total</span><span style={{ color: "#e2c975" }}>₹{order.total.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <h2 className="font-bold text-xs uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Shipping Address</h2>
                        <div className="text-sm flex flex-col gap-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                            <p className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{order.shippingName}</p>
                            <p>{order.shippingEmail}</p>
                            {order.shippingPhone && <p>{order.shippingPhone}</p>}
                            <p className="mt-1">{order.shippingAddress}</p>
                            <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                            <p>{order.shippingCountry}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
