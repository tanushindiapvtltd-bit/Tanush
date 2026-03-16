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
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [returnReason, setReturnReason] = useState<string>("");
    const [returnDescription, setReturnDescription] = useState("");
    const [proofImages, setProofImages] = useState<string[]>([]);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [returnSubmitting, setReturnSubmitting] = useState(false);
    const [returnError, setReturnError] = useState("");
    const [returnSuccess, setReturnSuccess] = useState(false);
    const [existingReturn, setExistingReturn] = useState<{
        status: string; returnReason: string; reason: string;
        returnWaybill: string | null; adminNote: string | null;
        rejectionReason: string | null; refundAmount: number; deliveryCharges: number;
        receivedAt: string | null; refundProcessedAt: string | null; razorpayRefundId: string | null;
    } | null>(null);
    const { clearCart } = useCart();

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then((r) => r.json())
            .then((data) => setOrder(data))
            .finally(() => setLoading(false));
        // Fetch existing return request
        fetch(`/api/orders/${id}/return`)
            .then((r) => r.ok ? r.json() : [])
            .then((data: NonNullable<typeof existingReturn>[]) => {
                const active = data.find((r) => r.status !== "REJECTED");
                if (active) setExistingReturn(active);
            })
            .catch(() => {});
    }, [id]);

    const handleCancelOrder = async () => {
        if (!order || !confirm("Are you sure you want to cancel this order?")) return;
        setCancelling(true);
        setCancelError("");
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cancel" }),
            });
            const data = await res.json();
            if (!res.ok) { setCancelError(data.error ?? "Failed to cancel order"); return; }
            setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
        } finally {
            setCancelling(false);
        }
    };

    const handleProofUpload = async (file: File) => {
        if (proofImages.length >= 5) { setReturnError("Maximum 5 images allowed"); return; }
        setUploadingProof(true);
        setReturnError("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload/return", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) { setReturnError(data.error ?? "Upload failed"); return; }
            setProofImages((prev) => [...prev, data.url]);
        } finally {
            setUploadingProof(false);
        }
    };

    const handleReturnRequest = async () => {
        if (!order || !returnReason || !returnDescription.trim()) return;
        setReturnSubmitting(true);
        setReturnError("");
        try {
            const res = await fetch(`/api/orders/${order.id}/return`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnReason, description: returnDescription.trim(), proofImages }),
            });
            const data = await res.json();
            if (!res.ok) { setReturnError(data.error ?? "Failed to submit return request"); return; }
            setReturnSuccess(true);
            setExistingReturn({
                status: "PENDING", returnReason, reason: returnDescription.trim(),
                returnWaybill: null, adminNote: null, rejectionReason: null,
                refundAmount: data.refundAmount ?? 0, deliveryCharges: data.deliveryCharges ?? 0,
                receivedAt: null, refundProcessedAt: null, razorpayRefundId: null,
            });
        } finally {
            setReturnSubmitting(false);
        }
    };

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
                    <div className="flex items-center gap-3 flex-wrap">
                        <span
                            className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide"
                            style={{ background: statusStyle.bg, color: statusStyle.text }}
                        >
                            {order.status}
                        </span>
                        {["PENDING", "CONFIRMED"].includes(order.status) && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-50"
                                style={{ background: "#fce4ec", color: "#b71c1c" }}
                            >
                                {cancelling ? "Cancelling..." : "Cancel Order"}
                            </button>
                        )}
                    </div>
                </div>
                {cancelError && (
                    <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#fce4ec", color: "#b71c1c", border: "1px solid #f48fb1" }}>
                        {cancelError}
                    </div>
                )}

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

                                {tracking?.estimatedDelivery && (
                                    <div className="mb-4 p-3 rounded-lg flex items-center gap-3" style={{ background: "#f0faf3", border: "1px solid #a5d6a7" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeLinecap="round"/></svg>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#388e3c" }}>Expected Delivery</p>
                                            <p className="text-sm font-bold" style={{ color: "#1b5e20" }}>
                                                {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {tracking?.trackingNumber && (
                                    <div className="mb-5 p-3 rounded-lg" style={{ background: "#faf9f6", border: "1px solid #e0d5c5" }}>
                                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#999" }}>Tracking Number</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                                                {tracking.carrier && <span className="mr-2">{tracking.carrier}</span>}
                                                {tracking.trackingNumber}
                                            </p>
                                            {tracking.carrier === "Delhivery" && (
                                                <a
                                                    href={`https://www.delhivery.com/track-v2/package/${tracking.trackingNumber}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full hover:opacity-80 transition-opacity"
                                                    style={{ background: "#fce4e4", color: "#e63946" }}
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

                        {/* Return Request — only for DELIVERED orders */}
                        {order.status === "DELIVERED" && (() => {
                            const RETURN_STATUS_INFO: Record<string, { bg: string; text: string; label: string; desc: string }> = {
                                PENDING: { bg: "#fff8e6", text: "#d4860e", label: "Under Review", desc: "We've received your request and are reviewing it. Please do not ship the item yet." },
                                APPROVED: { bg: "#e8f5e9", text: "#2e7d32", label: "Approved — Ship Item Back", desc: "Your return is approved. Please ship the item using the waybill below. Refund will be processed after we receive it." },
                                REJECTED: { bg: "#fce4ec", text: "#b71c1c", label: "Not Approved", desc: "Your return request was not approved." },
                                RECEIVED: { bg: "#e3f2fd", text: "#1565c0", label: "Item Received — Processing Refund", desc: "We've received your item and are processing your refund within 48 hours." },
                                REFUND_PROCESSED: { bg: "#e8f5e9", text: "#1b5e20", label: "Refund Processed", desc: "Your refund has been processed. It will reflect in your account within 2–5 business days." },
                                REFUND_FAILED: { bg: "#fce4ec", text: "#b71c1c", label: "Refund Issue", desc: "We encountered an issue processing your refund. Our team will contact you shortly." },
                                COMPLETED: { bg: "#e3f2fd", text: "#1565c0", label: "Completed", desc: "Your return has been completed." },
                            };
                            const REASON_LABELS: Record<string, string> = {
                                DAMAGED: "Item Damaged",
                                WRONG_ITEM: "Wrong Item Received",
                                QUALITY_ISSUE: "Quality Issue",
                                CHANGED_MIND: "Changed Mind",
                                OTHER: "Other",
                            };

                            if (existingReturn) {
                                const s = RETURN_STATUS_INFO[existingReturn.status] ?? { bg: "#f5f5f5", text: "#555", label: existingReturn.status, desc: "" };
                                return (
                                    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                                        <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-4" style={{ color: "#1a1a1a" }}>Return Request</h2>
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.text }}>
                                                {s.label}
                                            </span>
                                        </div>
                                        {s.desc && <p className="text-sm mb-3" style={{ color: "#555" }}>{s.desc}</p>}

                                        <div className="p-3 rounded-lg mb-3" style={{ background: "#faf9f6", border: "1px solid #e8e3db" }}>
                                            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#aaa" }}>Reason</p>
                                            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{REASON_LABELS[existingReturn.returnReason] ?? existingReturn.returnReason}</p>
                                            {existingReturn.reason && <p className="text-sm mt-1" style={{ color: "#666" }}>{existingReturn.reason}</p>}
                                        </div>

                                        {existingReturn.refundAmount > 0 && (
                                            <div className="p-3 rounded-lg mb-3" style={{ background: "#faf9f6", border: "1px solid #e8e3db" }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#aaa" }}>Refund Breakdown</p>
                                                <div className="flex justify-between text-sm">
                                                    <span style={{ color: "#555" }}>Product price</span>
                                                    <span className="font-bold" style={{ color: "#c9a84c" }}>₹{existingReturn.refundAmount.toLocaleString("en-IN")}</span>
                                                </div>
                                                {existingReturn.deliveryCharges > 0 && (
                                                    <div className="flex justify-between text-sm mt-1">
                                                        <span style={{ color: "#aaa" }}>Delivery charges (non-refundable)</span>
                                                        <span style={{ color: "#b71c1c" }}>₹{existingReturn.deliveryCharges.toLocaleString("en-IN")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {existingReturn.returnWaybill && (
                                            <div className="mt-3 p-4 rounded-lg" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#999" }}>Return Pickup Waybill</p>
                                                <p className="text-base font-mono font-bold mb-1" style={{ color: "#2e7d32" }}>{existingReturn.returnWaybill}</p>
                                                <p className="text-xs" style={{ color: "#555" }}>Our courier will pick up the item from your address.</p>
                                            </div>
                                        )}

                                        {existingReturn.rejectionReason && (
                                            <div className="mt-3 p-3 rounded-lg" style={{ background: "#fce4ec", border: "1px solid #f48fb1" }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#999" }}>Rejection Reason</p>
                                                <p className="text-sm" style={{ color: "#b71c1c" }}>{existingReturn.rejectionReason}</p>
                                            </div>
                                        )}

                                        {existingReturn.refundProcessedAt && (
                                            <div className="mt-3 p-3 rounded-lg" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#999" }}>Refund Processed</p>
                                                <p className="text-sm font-bold" style={{ color: "#2e7d32" }}>₹{existingReturn.refundAmount.toLocaleString("en-IN")}</p>
                                                <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                                                    {new Date(existingReturn.refundProcessedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                                </p>
                                                {existingReturn.razorpayRefundId && (
                                                    <p className="text-[10px] mt-1 font-mono" style={{ color: "#888" }}>Ref: {existingReturn.razorpayRefundId}</p>
                                                )}
                                            </div>
                                        )}

                                        {existingReturn.adminNote && (
                                            <p className="text-sm mt-3" style={{ color: "#555" }}><span style={{ color: "#aaa" }}>Note: </span>{existingReturn.adminNote}</p>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                                    <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "#1a1a1a" }}>Request a Return</h2>
                                    <p className="text-xs mb-5" style={{ color: "#aaa" }}>Returns accepted within 7 days of delivery. Only product price is refunded; delivery charges are non-refundable.</p>
                                    {returnSuccess ? (
                                        <div className="p-4 rounded-lg" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                                            <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>Return request submitted!</p>
                                            <p className="text-xs mt-1" style={{ color: "#388e3c" }}>We&apos;ll review your request within 24–48 hours and notify you by email. Do not ship the item until you receive approval.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Reason dropdown */}
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>Return Reason *</label>
                                                <select
                                                    value={returnReason}
                                                    onChange={(e) => setReturnReason(e.target.value)}
                                                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                                                    style={{ border: "1px solid #e0d5c5", background: "#fff", color: returnReason ? "#1a1a1a" : "#aaa" }}
                                                >
                                                    <option value="">Select a reason...</option>
                                                    <option value="DAMAGED">Item Damaged</option>
                                                    <option value="WRONG_ITEM">Wrong Item Received</option>
                                                    <option value="QUALITY_ISSUE">Quality Issue</option>
                                                    <option value="CHANGED_MIND">Changed Mind</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>

                                            {/* Description */}
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>Description *</label>
                                                <textarea
                                                    value={returnDescription}
                                                    onChange={(e) => setReturnDescription(e.target.value)}
                                                    placeholder="Please describe the issue in detail..."
                                                    rows={3}
                                                    className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
                                                    style={{ border: "1px solid #e0d5c5" }}
                                                />
                                            </div>

                                            {/* Proof images */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888" }}>Proof Images (optional, up to 5)</label>
                                                <div className="flex gap-2 flex-wrap mb-2">
                                                    {proofImages.map((url, i) => (
                                                        <div key={i} className="relative rounded-lg overflow-hidden" style={{ width: 64, height: 64, border: "1px solid #e0d5c5" }}>
                                                            <Image src={url} alt={`Proof ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
                                                            <button
                                                                onClick={() => setProofImages((prev) => prev.filter((_, j) => j !== i))}
                                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                                                                style={{ background: "#b71c1c" }}
                                                            >✕</button>
                                                        </div>
                                                    ))}
                                                    {proofImages.length < 5 && (
                                                        <label className="flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-amber-50" style={{ width: 64, height: 64, border: "1.5px dashed #c9a84c" }}>
                                                            <span className="text-xl" style={{ color: "#c9a84c" }}>{uploadingProof ? "..." : "+"}</span>
                                                            <input type="file" accept="image/*" className="hidden" disabled={uploadingProof}
                                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProofUpload(f); e.target.value = ""; }} />
                                                        </label>
                                                    )}
                                                </div>
                                                <p className="text-[11px]" style={{ color: "#bbb" }}>JPEG, PNG or WebP · Max 5MB each</p>
                                            </div>

                                            {returnError && (
                                                <p className="mb-3 text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: "#fce4ec", color: "#b71c1c" }}>{returnError}</p>
                                            )}
                                            <button
                                                onClick={handleReturnRequest}
                                                disabled={returnSubmitting || !returnReason || !returnDescription.trim()}
                                                className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
                                                style={{ background: "#1a1a1a" }}
                                            >
                                                {returnSubmitting ? "Submitting..." : "Submit Return Request"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })()}
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
