"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    createdAt: string;
    user: { name: string; email: string };
    items: { productName: string; quantity: number; price: number }[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    PENDING: { bg: "rgba(212,134,14,0.12)", text: "#f0b641", glow: "0 0 8px rgba(212,134,14,0.15)" },
    CONFIRMED: { bg: "rgba(46,125,50,0.12)", text: "#66bb6a", glow: "0 0 8px rgba(46,125,50,0.15)" },
    PROCESSING: { bg: "rgba(21,101,192,0.12)", text: "#64b5f6", glow: "0 0 8px rgba(21,101,192,0.15)" },
    SHIPPED: { bg: "rgba(106,27,154,0.12)", text: "#ba68c8", glow: "0 0 8px rgba(106,27,154,0.15)" },
    DELIVERED: { bg: "rgba(27,94,32,0.12)", text: "#81c784", glow: "0 0 8px rgba(27,94,32,0.15)" },
    CANCELLED: { bg: "rgba(183,28,28,0.12)", text: "#ef5350", glow: "0 0 8px rgba(183,28,28,0.15)" },
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((data) => setOrders(Array.isArray(data) ? [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []))
            .finally(() => setLoading(false));
    }, []);

    const displayed = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Orders</h1>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{orders.length} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["ALL", ...ALL_STATUSES].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
                        style={{
                            background: filter === s
                                ? "linear-gradient(135deg, #c9a84c, #e2c975)"
                                : "rgba(255,255,255,0.04)",
                            color: filter === s ? "#0c0c0c" : "rgba(255,255,255,0.4)",
                            border: "1px solid " + (filter === s ? "transparent" : "rgba(255,255,255,0.08)"),
                            boxShadow: filter === s ? "0 2px 10px rgba(201,168,76,0.25)" : "none",
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["Order #", "Customer", "Items", "Method", "Status", "Payment", "Total", "Date", "Action"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map((order) => {
                                    const sc = STATUS_COLORS[order.status] ?? { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.5)", glow: "none" };
                                    const pc = order.paymentStatus === "PAID"
                                        ? { bg: "rgba(46,125,50,0.12)", text: "#81c784", glow: "0 0 8px rgba(46,125,50,0.15)" }
                                        : { bg: "rgba(212,134,14,0.12)", text: "#f0b641", glow: "0 0 8px rgba(212,134,14,0.15)" };
                                    return (
                                        <tr
                                            key={order.id}
                                            className="transition-colors duration-150"
                                            style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                        >
                                            <td className="px-5 py-4 font-semibold" style={{ color: "#e2c975" }}>{order.orderNumber}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{order.user.name}</p>
                                                <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{order.user.email}</p>
                                            </td>
                                            <td className="px-5 py-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                                                {order.items[0]?.productName}
                                                {order.items.length > 1 && <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>+{order.items.length - 1}</span>}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-semibold uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                                                {order.paymentMethod}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide" style={{ background: sc.bg, color: sc.text, boxShadow: sc.glow }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide" style={{ background: pc.bg, color: pc.text, boxShadow: pc.glow }}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-bold" style={{ color: "#e2c975" }}>₹{order.total.toLocaleString("en-IN")}</td>
                                            <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                                            <td className="px-5 py-4">
                                                <Link href={`/admin/orders/${order.id}`} className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: "#c9a84c" }}>
                                                    Manage →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {displayed.length === 0 && (
                            <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No orders found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
