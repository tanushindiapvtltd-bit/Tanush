"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

    // Delhivery state
    const [shipWeight, setShipWeight] = useState("0.5");
    const [shipLength, setShipLength] = useState("10");
    const [shipWidth, setShipWidth] = useState("10");
    const [shipHeight, setShipHeight] = useState("10");
    const [delhiveryLoading, setDelhiveryLoading] = useState(false);
    const [delhiveryError, setDelhiveryError] = useState("");
    const [liveTrackLoading, setLiveTrackLoading] = useState(false);
    const [liveTrackData, setLiveTrackData] = useState<{
        status: string; location: string; expectedDelivery?: string;
        events: { status: string; location: string; timestamp: string }[];
    } | null>(null);

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

    const createDelhiveryShipment = async () => {
        if (!order) return;
        setDelhiveryLoading(true);
        setDelhiveryError("");
        try {
            const res = await fetch("/api/admin/delhivery/create-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    weight: Number(shipWeight),
                    length: Number(shipLength),
                    width: Number(shipWidth),
                    height: Number(shipHeight),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to create shipment");
            const updated = await fetch(`/api/admin/orders/${id}`).then((r) => r.json());
            setOrder(updated);
            if (updated.deliveryTracking) {
                setTrackingNumber(updated.deliveryTracking.trackingNumber ?? "");
                setCarrier(updated.deliveryTracking.carrier ?? "");
                setDeliveryStatus(updated.deliveryTracking.currentStatus ?? "");
            }
        } catch (e) {
            setDelhiveryError(String(e));
        } finally {
            setDelhiveryLoading(false);
        }
    };

    const fetchLiveTrack = async () => {
        const waybill = order?.deliveryTracking?.trackingNumber;
        if (!waybill) return;
        setLiveTrackLoading(true);
        try {
            const res = await fetch(`/api/admin/delhivery/track/${encodeURIComponent(waybill)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setLiveTrackData(data);
            const updated = await fetch(`/api/admin/orders/${id}`).then((r) => r.json());
            setOrder(updated);
        } catch (e) {
            setDelhiveryError(String(e));
        } finally {
            setLiveTrackLoading(false);
        }
    };

    const cancelDelhiveryShipment = async () => {
        const waybill = order?.deliveryTracking?.trackingNumber;
        if (!waybill || !order) return;
        if (!confirm(`Cancel Delhivery shipment ${waybill}?`)) return;
        setDelhiveryLoading(true);
        try {
            const res = await fetch("/api/admin/delhivery/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waybill, orderId: order.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Cancel failed");
            const updated = await fetch(`/api/admin/orders/${id}`).then((r) => r.json());
            setOrder(updated);
            setLiveTrackData(null);
        } catch (e) {
            setDelhiveryError(String(e));
        } finally {
            setDelhiveryLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
        </div>
    );
    if (!order) return <p style={{ color: "#888" }}>Order not found</p>;

    const rawHistory = order.deliveryTracking?.history;
    const history: TrackingHistory[] = Array.isArray(rawHistory)
        ? rawHistory
        : typeof rawHistory === "string"
        ? (() => { try { return JSON.parse(rawHistory); } catch { return []; } })()
        : [];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-widest hover:opacity-70" style={{ color: "#c9a84c" }}>
                    ← Orders
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>{order.orderNumber}</h1>
                    <p className="text-sm" style={{ color: "#888" }}>
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
                                background: order.status === s ? "#c9a84c" : "#fff",
                                color: order.status === s ? "#fff" : "#888",
                                border: "1px solid " + (order.status === s ? "#c9a84c" : "#e0d5c5"),
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
                    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: "#1a1a1a" }}>Order Items</h2>
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center py-3" style={{ borderBottom: "1px solid #f9f6f1" }}>
                                <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 56, height: 56, background: "#f5ede0" }}>
                                    <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="56px" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>{item.productName}</p>
                                    <p className="text-xs" style={{ color: "#888" }}>Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-sm" style={{ color: "#c9a84c" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                            </div>
                        ))}
                        <div className="pt-4 flex justify-end">
                            <p className="font-bold text-lg" style={{ color: "#c9a84c" }}>Total: ₹{order.total.toLocaleString("en-IN")}</p>
                        </div>
                    </div>

                    {/* Delhivery Shipment */}
                    <div className="rounded-xl p-6" style={{ background: "#faf7ff", border: "1px solid #e1bee7" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#6a1b9a" }}>Delhivery</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: "#ede7f6", color: "#6a1b9a" }}>Partner</span>
                        </div>

                        {delhiveryError && (
                            <div className="mb-4 p-3 rounded-lg text-xs font-semibold" style={{ background: "#fce4ec", color: "#b71c1c" }}>
                                {delhiveryError}
                            </div>
                        )}

                        {order.deliveryTracking?.carrier === "Delhivery" && order.deliveryTracking.trackingNumber ? (
                            /* Waybill already created */
                            <div>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#9c6db5" }}>Waybill Number</p>
                                        <p className="text-lg font-bold font-mono" style={{ color: "#6a1b9a" }}>
                                            {order.deliveryTracking.trackingNumber}
                                        </p>
                                    </div>
                                    {order.deliveryTracking.currentStatus && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#9c6db5" }}>Status</p>
                                            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{order.deliveryTracking.currentStatus}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <button
                                        onClick={fetchLiveTrack}
                                        disabled={liveTrackLoading || delhiveryLoading}
                                        className="px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40"
                                        style={{ background: "#ede7f6", color: "#6a1b9a" }}
                                    >
                                        {liveTrackLoading ? "Tracking..." : "Live Track & Sync"}
                                    </button>
                                    <a
                                        href={`https://www.delhivery.com/tracking/?AWB=${order.deliveryTracking.trackingNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-80"
                                        style={{ background: "#e3f2fd", color: "#1565c0" }}
                                    >
                                        Track on Delhivery ↗
                                    </a>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_DELHIVERY_BASE ?? "https://staging-express.delhivery.com"}/api/p/packing_slip?wbns=${order.deliveryTracking.trackingNumber}&token=${process.env.NEXT_PUBLIC_DELHIVERY_TOKEN ?? ""}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-80"
                                        style={{ background: "#f1f8e9", color: "#2e7d32" }}
                                    >
                                        Print Label ↗
                                    </a>
                                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                        <button
                                            onClick={cancelDelhiveryShipment}
                                            disabled={delhiveryLoading}
                                            className="px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40"
                                            style={{ background: "#fce4ec", color: "#b71c1c" }}
                                        >
                                            Cancel Shipment
                                        </button>
                                    )}
                                </div>

                                {/* Live track data */}
                                {liveTrackData && (
                                    <div className="rounded-lg p-4 mb-3" style={{ background: "#fff", border: "1px solid #e1bee7" }}>
                                        <div className="flex flex-wrap gap-4 mb-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest" style={{ color: "#aaa" }}>Live Status</p>
                                                <p className="text-sm font-bold" style={{ color: "#6a1b9a" }}>{liveTrackData.status}</p>
                                            </div>
                                            {liveTrackData.location && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "#aaa" }}>Location</p>
                                                    <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{liveTrackData.location}</p>
                                                </div>
                                            )}
                                            {liveTrackData.expectedDelivery && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "#aaa" }}>Expected</p>
                                                    <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>
                                                        {new Date(liveTrackData.expectedDelivery).toLocaleDateString("en-IN")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {liveTrackData.events.length > 0 && (
                                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                                {[...liveTrackData.events].reverse().map((ev, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#c9a84c" : "#ccc" }} />
                                                        <div>
                                                            <p className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>{ev.status}</p>
                                                            <p className="text-[10px]" style={{ color: "#888" }}>{ev.location}</p>
                                                            <p className="text-[10px]" style={{ color: "#bbb" }}>{new Date(ev.timestamp).toLocaleString("en-IN")}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Create new shipment */
                            <div>
                                <p className="text-xs mb-4" style={{ color: "#888" }}>
                                    Book this order directly with Delhivery to generate a waybill and update tracking automatically.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>Weight (kg)</label>
                                        <input type="number" step="0.1" min="0.1" value={shipWeight} onChange={(e) => setShipWeight(e.target.value)}
                                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>Length (cm)</label>
                                        <input type="number" min="1" value={shipLength} onChange={(e) => setShipLength(e.target.value)}
                                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>Width (cm)</label>
                                        <input type="number" min="1" value={shipWidth} onChange={(e) => setShipWidth(e.target.value)}
                                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>Height (cm)</label>
                                        <input type="number" min="1" value={shipHeight} onChange={(e) => setShipHeight(e.target.value)}
                                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "#888" }}>
                                    <span>Payment: <strong style={{ color: "#1a1a1a" }}>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Prepaid"}</strong></span>
                                    <span>·</span>
                                    <span>Amount: <strong style={{ color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</strong></span>
                                    <span>·</span>
                                    <span>PIN: <strong style={{ color: "#1a1a1a" }}>{order.shippingZip}</strong></span>
                                </div>
                                <button
                                    onClick={createDelhiveryShipment}
                                    disabled={delhiveryLoading}
                                    className="px-5 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40"
                                    style={{ background: "#6a1b9a" }}
                                >
                                    {delhiveryLoading ? "Creating Shipment..." : "Book with Delhivery"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Delivery Tracking Update */}
                    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-sm uppercase tracking-widest mb-5" style={{ color: "#1a1a1a" }}>Update Delivery Tracking</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Tracking Number</label>
                                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }}
                                    placeholder="e.g. SR12345678" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Carrier</label>
                                <select value={carrier} onChange={(e) => setCarrier(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }}>
                                    <option value="">Select carrier</option>
                                    {["Shiprocket", "Blue Dart", "DTDC", "Delhivery", "FedEx", "Ekart"].map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Estimated Delivery</label>
                                <input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Delivery Status</label>
                                <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }}>
                                    <option value="">Select status</option>
                                    {DELIVERY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Current Location</label>
                                <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }}
                                    placeholder="e.g. Mumbai Hub" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Add Note (optional)</label>
                                <input value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)}
                                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid #e0d5c5" }}
                                    placeholder="e.g. Package received at warehouse" />
                            </div>
                        </div>
                        <button
                            onClick={updateDelivery}
                            disabled={updating}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
                            style={{ background: "#c9a84c" }}
                        >
                            {updating ? "Updating..." : "Update Tracking"}
                        </button>

                        {/* History */}
                        {history.length > 0 && (
                            <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <h3 className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "#888" }}>Tracking History</h3>
                                <div className="flex flex-col gap-3">
                                    {[...history].reverse().map((entry, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#c9a84c" : "#ddd" }} />
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{entry.status}</p>
                                                {entry.description && <p className="text-xs" style={{ color: "#888" }}>{entry.description}</p>}
                                                {entry.location && <p className="text-xs" style={{ color: "#aaa" }}>{entry.location}</p>}
                                                <p className="text-[10px]" style={{ color: "#bbb" }}>{new Date(entry.timestamp).toLocaleString("en-IN")}</p>
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
                    <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-xs uppercase tracking-widest mb-3" style={{ color: "#888" }}>Payment</h2>
                        <p className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>
                            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                            style={{ background: order.paymentStatus === "PAID" ? "#e8f5e9" : "#fff8e6", color: order.paymentStatus === "PAID" ? "#2e7d32" : "#d4860e" }}>
                            {order.paymentStatus}
                        </span>
                        <div className="mt-3 pt-3 flex flex-col gap-1.5 text-sm" style={{ borderTop: "1px solid #f0e6d0" }}>
                            <div className="flex justify-between"><span style={{ color: "#888" }}>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between"><span style={{ color: "#888" }}>Shipping</span><span>₹{order.shippingCost.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between"><span style={{ color: "#888" }}>Tax</span><span>₹{order.tax.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between font-bold pt-1" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <span>Total</span><span style={{ color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <h2 className="font-bold text-xs uppercase tracking-widest mb-3" style={{ color: "#888" }}>Shipping Address</h2>
                        <div className="text-sm flex flex-col gap-0.5" style={{ color: "#555" }}>
                            <p className="font-semibold">{order.shippingName}</p>
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
