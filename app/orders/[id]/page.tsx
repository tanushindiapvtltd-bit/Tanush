"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    shippingApartment: string | null;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    shippingMethod: string;
    createdAt: string;
    items: {
        id: string;
        productName: string;
        productImage: string;
        price: number;
        quantity: number;
    }[];
    deliveryTracking: {
        trackingNumber: string | null;
        carrier: string | null;
        estimatedDelivery: string | null;
        currentStatus: string;
        currentLocation: string | null;
        history: TrackingHistory[] | string;
    } | null;
}

const DELIVERY_STEPS = ["Order Placed", "Confirmed", "Processing", "Shipped", "Delivered"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#fff8e6", text: "#d4860e" },
    CONFIRMED: { bg: "#e6f4ea", text: "#2e7d32" },
    PROCESSING: { bg: "#e3f2fd", text: "#1565c0" },
    SHIPPED: { bg: "#f3e5f5", text: "#6a1b9a" },
    DELIVERED: { bg: "#e8f5e9", text: "#1b5e20" },
    CANCELLED: { bg: "#fce4ec", text: "#b71c1c" },
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then((r) => r.json())
            .then((data) => setOrder(data))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
                <Navbar />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <p style={{ color: "#999" }}>Order not found</p>
                    <Link href="/orders" className="text-sm font-semibold" style={{ color: "#c9a84c" }}>← Back to orders</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const statusStyle = STATUS_COLORS[order.status] ?? { bg: "#f5f5f5", text: "#555" };
    const tracking = order.deliveryTracking;
    // Handle both array and legacy JSON-string history
    const rawHistory = tracking?.history;
    const history: TrackingHistory[] = Array.isArray(rawHistory)
        ? rawHistory
        : typeof rawHistory === "string"
        ? (() => { try { return JSON.parse(rawHistory); } catch { return []; } })()
        : [];
    const currentStepIndex = DELIVERY_STEPS.indexOf(tracking?.currentStatus ?? "Order Placed");

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-10 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                    <div>
                        <Link href="/orders" className="text-xs font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "#c9a84c" }}>
                            ← My Orders
                        </Link>
                        <h1
                            className="text-2xl md:text-3xl mt-2"
                            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}
                        >
                            Order {order.orderNumber}
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "#888" }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <span
                        className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide w-fit"
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                    >
                        {order.status}
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* Delivery Tracking */}
                        {order.status !== "CANCELLED" && (
                            <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                                <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-5" style={{ color: "#1a1a1a" }}>
                                    Delivery Tracking
                                </h2>

                                {tracking?.trackingNumber && (
                                    <div className="mb-5 p-3 rounded-lg" style={{ background: "#faf9f6", border: "1px solid #e0d5c5" }}>
                                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#999" }}>Tracking Number</p>
                                        <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                                            {tracking.carrier && <span className="mr-2">{tracking.carrier}</span>}
                                            {tracking.trackingNumber}
                                        </p>
                                        {tracking.estimatedDelivery && (
                                            <p className="text-xs mt-1" style={{ color: "#888" }}>
                                                Est. delivery: {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Progress steps */}
                                <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-2">
                                    {DELIVERY_STEPS.map((step, i) => {
                                        const done = i <= currentStepIndex;
                                        const active = i === currentStepIndex;
                                        return (
                                            <div key={step} className="flex items-center flex-shrink-0">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                                        style={{
                                                            background: done ? "#c9a84c" : "#f0e6d0",
                                                            color: done ? "#fff" : "#bbb",
                                                            boxShadow: active ? "0 0 0 3px #c9a84c44" : "none",
                                                        }}
                                                    >
                                                        {done && i < currentStepIndex ? "✓" : i + 1}
                                                    </div>
                                                    <p className="text-[9px] uppercase tracking-wide mt-1 text-center max-w-[60px]" style={{ color: done ? "#c9a84c" : "#bbb" }}>
                                                        {step}
                                                    </p>
                                                </div>
                                                {i < DELIVERY_STEPS.length - 1 && (
                                                    <div
                                                        className="h-0.5 w-8 flex-shrink-0 mx-1"
                                                        style={{ background: i < currentStepIndex ? "#c9a84c" : "#e0d5c5" }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* History timeline */}
                                {history.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        {[...history].reverse().map((entry, i) => (
                                            <div key={i} className="flex gap-3 items-start">
                                                <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#c9a84c" : "#ddd" }} />
                                                <div>
                                                    <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{entry.status}</p>
                                                    {entry.description && <p className="text-xs" style={{ color: "#888" }}>{entry.description}</p>}
                                                    {entry.location && <p className="text-xs" style={{ color: "#aaa" }}>{entry.location}</p>}
                                                    <p className="text-[10px] mt-0.5" style={{ color: "#bbb" }}>
                                                        {new Date(entry.timestamp).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                            <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-4" style={{ color: "#1a1a1a" }}>Order Items</h2>
                            <div className="flex flex-col gap-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start">
                                        <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 64, height: 64, background: "#f5ede0" }}>
                                            <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="64px" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{item.productName}</p>
                                            <p className="text-xs mt-0.5" style={{ color: "#888" }}>Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold" style={{ color: "#c9a84c" }}>
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="w-full lg:w-72 flex flex-col gap-6">
                        {/* Order Summary */}
                        <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                            <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-4" style={{ color: "#1a1a1a" }}>Order Summary</h2>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: "#888" }}>Subtotal</span>
                                    <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: "#888" }}>Shipping</span>
                                    <span>{order.shippingCost === 0 ? <span style={{ color: "#c9a84c" }}>Free</span> : `₹${order.shippingCost.toLocaleString("en-IN")}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: "#888" }}>Tax</span>
                                    <span>₹{order.tax.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between pt-3 mt-1 font-bold text-base" style={{ borderTop: "1px solid #f0e6d0" }}>
                                    <span>Total</span>
                                    <span style={{ color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#aaa" }}>Payment</p>
                                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                                    {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}
                                </p>
                                <span
                                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                                    style={{
                                        background: order.paymentStatus === "PAID" ? "#e8f5e9" : "#fff8e6",
                                        color: order.paymentStatus === "PAID" ? "#2e7d32" : "#d4860e",
                                    }}
                                >
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                            <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-3" style={{ color: "#1a1a1a" }}>Shipping To</h2>
                            <div className="text-sm flex flex-col gap-0.5" style={{ color: "#555" }}>
                                <p className="font-semibold">{order.shippingName}</p>
                                <p>{order.shippingAddress}{order.shippingApartment && `, ${order.shippingApartment}`}</p>
                                <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                                <p>{order.shippingCountry}</p>
                                {order.shippingPhone && <p>{order.shippingPhone}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
