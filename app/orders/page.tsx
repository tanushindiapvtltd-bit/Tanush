"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    items: { productName: string; quantity: number }[];
    deliveryTracking?: { currentStatus: string } | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#fff8e6", text: "#d4860e" },
    CONFIRMED: { bg: "#e6f4ea", text: "#2e7d32" },
    PROCESSING: { bg: "#e3f2fd", text: "#1565c0" },
    SHIPPED: { bg: "#f3e5f5", text: "#6a1b9a" },
    DELIVERED: { bg: "#e8f5e9", text: "#1b5e20" },
    CANCELLED: { bg: "#fce4ec", text: "#b71c1c" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        fetch("/api/orders")
            .then((r) => {
                if (!r.ok) throw new Error("Failed");
                return r.json();
            })
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .catch(() => setFetchError(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-10 py-10">
                <h1
                    className="text-3xl md:text-4xl mb-2"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}
                >
                    My Orders
                </h1>
                {!loading && (
                    <p className="text-sm mb-8" style={{ color: "#999" }}>
                        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                    </p>
                )}

                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                )}

                {!loading && fetchError && (
                    <div className="text-center py-20">
                        <p className="text-sm" style={{ color: "#e05252" }}>Failed to load orders. Please refresh the page.</p>
                    </div>
                )}

                {!loading && !fetchError && orders.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4" style={{ color: "#e0d5c5" }}>📦</p>
                        <p className="text-lg italic mb-2" style={{ color: "#999", fontFamily: "var(--font-cormorant), serif" }}>
                            No orders yet
                        </p>
                        <Link
                            href="/collections"
                            className="inline-block mt-4 px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-lg text-white hover:opacity-90 transition-opacity"
                            style={{ background: "#c9a84c" }}
                        >
                            Shop Now
                        </Link>
                    </div>
                )}

                {!loading && !fetchError && orders.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => {
                            const statusStyle = STATUS_COLORS[order.status] ?? { bg: "#f5f5f5", text: "#555" };
                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block rounded-xl p-6 transition-all hover:shadow-md"
                                    style={{ background: "#fff", border: "1px solid #e8e3db" }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#c9a84c" }}>
                                                {order.orderNumber}
                                            </p>
                                            <p className="text-sm" style={{ color: "#888" }}>
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                                                style={{ background: statusStyle.bg, color: statusStyle.text }}
                                            >
                                                {order.deliveryTracking?.currentStatus ?? order.status}
                                            </span>
                                            <span className="text-base font-bold" style={{ color: "#c9a84c" }}>
                                                ₹{order.total.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {order.items.slice(0, 2).map((item, i) => (
                                            <p key={i} className="text-sm" style={{ color: "#555" }}>
                                                {item.productName} × {item.quantity}
                                            </p>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-xs" style={{ color: "#aaa" }}>
                                                +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #f0e6d0" }}>
                                        <span className="text-xs uppercase tracking-wider" style={{ color: "#aaa" }}>
                                            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                                            {order.paymentStatus === "PAID" && " · Paid"}
                                        </span>
                                        <span className="text-xs font-semibold" style={{ color: "#c9a84c" }}>
                                            View Details →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
