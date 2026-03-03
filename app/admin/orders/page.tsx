"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    user: { name: string; email: string };
    items: { productName: string }[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#fff8e6", text: "#d4860e" },
    CONFIRMED: { bg: "#e6f4ea", text: "#2e7d32" },
    PROCESSING: { bg: "#e3f2fd", text: "#1565c0" },
    SHIPPED: { bg: "#f3e5f5", text: "#6a1b9a" },
    DELIVERED: { bg: "#e8f5e9", text: "#1b5e20" },
    CANCELLED: { bg: "#fce4ec", text: "#b71c1c" },
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const displayed = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Orders</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#888" }}>{orders.length} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["ALL", ...ALL_STATUSES].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer"
                        style={{
                            background: filter === s ? "#c9a84c" : "#fff",
                            color: filter === s ? "#fff" : "#888",
                            border: "1px solid " + (filter === s ? "#c9a84c" : "#e0d5c5"),
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                    {["Order #", "Customer", "Items", "Method", "Status", "Payment", "Total", "Date", "Action"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#888" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map((order) => {
                                    const sc = STATUS_COLORS[order.status] ?? { bg: "#f5f5f5", text: "#555" };
                                    const pc = order.paymentStatus === "PAID"
                                        ? { bg: "#e8f5e9", text: "#2e7d32" }
                                        : { bg: "#fff8e6", text: "#d4860e" };
                                    return (
                                        <tr key={order.id} style={{ borderBottom: "1px solid #f9f6f1" }}>
                                            <td className="px-5 py-4 font-semibold" style={{ color: "#c9a84c" }}>{order.orderNumber}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium" style={{ color: "#1a1a1a" }}>{order.user.name}</p>
                                                <p className="text-xs" style={{ color: "#aaa" }}>{order.user.email}</p>
                                            </td>
                                            <td className="px-5 py-4" style={{ color: "#555" }}>
                                                {order.items[0]?.productName}
                                                {order.items.length > 1 && <span className="text-xs ml-1" style={{ color: "#aaa" }}>+{order.items.length - 1}</span>}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-semibold uppercase" style={{ color: "#555" }}>
                                                {order.paymentMethod}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase" style={{ background: sc.bg, color: sc.text }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase" style={{ background: pc.bg, color: pc.text }}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-bold" style={{ color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</td>
                                            <td className="px-5 py-4 text-xs" style={{ color: "#888" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
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
                            <p className="text-center py-10 text-sm" style={{ color: "#aaa" }}>No orders found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
