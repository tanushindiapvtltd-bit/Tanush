"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/lib/cartContext";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayRetryOptions) => { open(): void };
    }
}

interface RazorpayRetryOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    prefill: { name: string; email: string; contact: string };
    theme: { color: string };
    modal: { ondismiss: () => void };
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

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
    razorpayOrderId: string | null;
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
    const [retrying, setRetrying] = useState(false);
    const [retryError, setRetryError] = useState("");
    const { clearCart } = useCart();
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnSuccess, setReturnSuccess] = useState(false);

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then((r) => r.json())
            .then((data) => setOrder(data))
            .finally(() => setLoading(false));
    }, [id]);

    const handleRetryPayment = async () => {
        if (!order) return;
        setRetrying(true);
        setRetryError("");
        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) { setRetryError("Failed to load payment gateway. Please try again."); return; }

            const retryRes = await fetch("/api/payment/razorpay/retry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            });
            const retryData = await retryRes.json();
            if (!retryRes.ok) { setRetryError(retryData.error ?? "Failed to initiate payment"); return; }

            const options: RazorpayRetryOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: retryData.amount,
                currency: retryData.currency,
                name: "Tanush",
                description: "Jewellery Purchase",
                order_id: retryData.orderId,
                handler: async (response) => {
                    const verifyRes = await fetch("/api/payment/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId: order.id,
                        }),
                    });
                    if (verifyRes.ok) {
                        clearCart();
                        // Reload order data to reflect PAID status
                        const updatedOrder = await fetch(`/api/orders/${order.id}`).then((r) => r.json());
                        setOrder(updatedOrder);
                        setRetrying(false);
                    } else {
                        setRetryError("Payment verification failed. Please contact support.");
                        setRetrying(false);
                    }
                },
                prefill: {
                    name: retryData.shippingName ?? "",
                    email: retryData.shippingEmail ?? "",
                    contact: retryData.shippingPhone ?? "",
                },
                theme: { color: "#c9a84c" },
                modal: {
                    ondismiss: async () => {
                        // Check if payment actually went through despite modal close
                        try {
                            const statusRes = await fetch("/api/payment/razorpay/check-status", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpayOrderId: retryData.orderId,
                                    orderId: order.id,
                                }),
                            });
                            const statusData = await statusRes.json();
                            if (statusData.paid) {
                                clearCart();
                                const updatedOrder = await fetch(`/api/orders/${order.id}`).then((r) => r.json());
                                setOrder(updatedOrder);
                            }
                        } catch { /* silent */ }
                        setRetrying(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            setRetryError("Something went wrong. Please try again.");
            setRetrying(false);
        }
    };

    const handleReturnRequest = async () => {
        if (!order || !returnReason.trim()) return;
        setReturnLoading(true);
        try {
            const res = await fetch("/api/shipping/reverse-pickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id, reason: returnReason }),
            });
            if (res.ok) {
                setReturnSuccess(true);
                setShowReturnModal(false);
            }
        } finally {
            setReturnLoading(false);
        }
    };

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

    // Return window: within 7 days of delivery
    const deliveredEntry = history.find(h => h.status === "Delivered" || h.status === "DELIVERED");
    const deliveredAt = deliveredEntry ? new Date(deliveredEntry.timestamp) : null;
    const withinReturnWindow = order.status === "DELIVERED" && !returnSuccess &&
        (!deliveredAt || (Date.now() - deliveredAt.getTime()) < 7 * 24 * 60 * 60 * 1000);

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

                {/* Payment status banner for Razorpay orders that are not yet paid */}
                {order.paymentMethod === "RAZORPAY" && order.paymentStatus !== "PAID" && (
                    <div
                        className="mb-6 rounded-xl p-5"
                        style={{
                            background: order.paymentStatus === "FAILED" ? "#fce4ec" : "#fff8e6",
                            border: `1px solid ${order.paymentStatus === "FAILED" ? "#f48fb1" : "#f5c842"}`,
                        }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold mb-1" style={{ color: order.paymentStatus === "FAILED" ? "#b71c1c" : "#a06000" }}>
                                    {order.paymentStatus === "FAILED" ? "Payment unsuccessful" : "Payment pending"}
                                </p>
                                <p className="text-xs" style={{ color: order.paymentStatus === "FAILED" ? "#c62828" : "#7a5200" }}>
                                    {order.paymentStatus === "FAILED"
                                        ? "Your payment could not be verified. Your order is on hold. Please complete the payment to confirm your order."
                                        : "We haven't received your payment yet. Complete the payment to confirm your order."}
                                </p>
                                {retryError && (
                                    <p className="text-xs mt-2 font-semibold" style={{ color: "#b71c1c" }}>{retryError}</p>
                                )}
                            </div>
                            <button
                                onClick={handleRetryPayment}
                                disabled={retrying}
                                className="flex-shrink-0 px-5 py-2.5 rounded-lg text-white text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 cursor-pointer disabled:opacity-50"
                                style={{ background: "#c9a84c" }}
                            >
                                {retrying ? "Processing..." : "Complete Payment"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Success confirmation banner */}
                {order.paymentMethod === "RAZORPAY" && order.paymentStatus === "PAID" && order.status === "CONFIRMED" && (
                    <div className="mb-6 rounded-xl p-5" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                        <p className="text-sm font-bold" style={{ color: "#1b5e20" }}>Payment successful — Order confirmed!</p>
                        <p className="text-xs mt-1" style={{ color: "#2e7d32" }}>
                            Your payment was received and your order is now being processed.
                        </p>
                    </div>
                )}

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
                                    <div className="mb-5 p-4 rounded-xl" style={{ background: tracking.carrier === "Delhivery" ? "#faf7ff" : "#faf9f6", border: `1px solid ${tracking.carrier === "Delhivery" ? "#e1bee7" : "#e0d5c5"}` }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: tracking.carrier === "Delhivery" ? "#9c6db5" : "#999" }}>
                                                    {tracking.carrier ? `${tracking.carrier} · Tracking` : "Tracking Number"}
                                                </p>
                                                <p className="text-sm font-bold font-mono" style={{ color: "#1a1a1a" }}>
                                                    {tracking.trackingNumber}
                                                </p>
                                                {tracking.estimatedDelivery && (
                                                    <p className="text-xs mt-1" style={{ color: "#888" }}>
                                                        Est. delivery: {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                                                    </p>
                                                )}
                                            </div>
                                            {tracking.carrier === "Delhivery" && (
                                                <a
                                                    href={`https://www.delhivery.com/tracking/?AWB=${tracking.trackingNumber}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                                                    style={{ background: "#ede7f6", color: "#6a1b9a" }}
                                                >
                                                    Track on Delhivery ↗
                                                </a>
                                            )}
                                        </div>
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

                        {/* Return success banner */}
                        {returnSuccess && (
                            <div className="rounded-xl p-4" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                                <p className="text-sm font-bold" style={{ color: "#1b5e20" }}>Return request submitted!</p>
                                <p className="text-xs mt-1" style={{ color: "#2e7d32" }}>Our team will review your request and arrange a pickup. You&apos;ll be contacted shortly.</p>
                            </div>
                        )}

                        {/* Return / Replace */}
                        {withinReturnWindow && (
                            <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                                <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-2" style={{ color: "#1a1a1a" }}>Returns</h2>
                                <p className="text-xs mb-3" style={{ color: "#888" }}>Not satisfied? Request a return within 7 days of delivery.</p>
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    className="w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
                                    style={{ background: "#fce4ec", color: "#b71c1c" }}
                                >
                                    Request Return / Replace
                                </button>
                            </div>
                        )}

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

            {/* Return modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
                    <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#fff" }}>
                        <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}>Request Return / Replace</h3>
                        <p className="text-xs mb-4" style={{ color: "#888" }}>Tell us why you&apos;d like to return this order. Our team will arrange a pickup.</p>
                        <textarea
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            placeholder="Reason for return (e.g. damaged item, wrong product, changed mind)"
                            rows={4}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-4"
                            style={{ border: "1px solid #e0d5c5", background: "#faf9f6" }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowReturnModal(false); setReturnReason(""); }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-70"
                                style={{ background: "#f5f5f5", color: "#555" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturnRequest}
                                disabled={returnLoading || !returnReason.trim()}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
                                style={{ background: "#b71c1c", color: "#fff" }}
                            >
                                {returnLoading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
