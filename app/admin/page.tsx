"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    totalReviews: number;
    pendingOrders: number;
    totalRevenue: number;
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        status: string;
        total: number;
        createdAt: string;
        user: { name: string; email: string };
        items: { productName: string }[];
    }>;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    PENDING: { bg: "rgba(212,134,14,0.12)", text: "#f0b641", glow: "0 0 8px rgba(212,134,14,0.15)" },
    CONFIRMED: { bg: "rgba(46,125,50,0.12)", text: "#66bb6a", glow: "0 0 8px rgba(46,125,50,0.15)" },
    PROCESSING: { bg: "rgba(21,101,192,0.12)", text: "#64b5f6", glow: "0 0 8px rgba(21,101,192,0.15)" },
    SHIPPED: { bg: "rgba(106,27,154,0.12)", text: "#ba68c8", glow: "0 0 8px rgba(106,27,154,0.15)" },
    DELIVERED: { bg: "rgba(27,94,32,0.12)", text: "#81c784", glow: "0 0 8px rgba(27,94,32,0.15)" },
    CANCELLED: { bg: "rgba(183,28,28,0.12)", text: "#ef5350", glow: "0 0 8px rgba(183,28,28,0.15)" },
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((r) => r.json())
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div
                    className="w-10 h-10 rounded-full border-2 animate-spin"
                    style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }}
                />
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            gradient: "linear-gradient(135deg, #c9a84c, #e2c975)",
        },
        {
            label: "Total Orders", value: stats.totalOrders,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                </svg>
            ),
            gradient: "linear-gradient(135deg, #4a90e2, #74b3f7)",
        },
        {
            label: "Pending Orders", value: stats.pendingOrders,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            gradient: "linear-gradient(135deg, #e67e22, #f5a623)",
        },
        {
            label: "Total Users", value: stats.totalUsers,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            gradient: "linear-gradient(135deg, #27ae60, #6fcf97)",
        },
        {
            label: "Products", value: stats.totalProducts,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3l1 6h10" /><path d="M2 9h10l1-6" />
                </svg>
            ),
            gradient: "linear-gradient(135deg, #8e44ad, #c39be8)",
        },
        {
            label: "Reviews", value: stats.totalReviews,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            gradient: "linear-gradient(135deg, #e74c3c, #f29f97)",
        },
    ];

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: "#fff" }}>Dashboard</h1>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Welcome back — here&apos;s your store overview
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="group rounded-2xl p-5 transition-all duration-300 cursor-default"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            backdropFilter: "blur(10px)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)";
                            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(201,168,76,0.05)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <div
                            className="flex items-center justify-center rounded-xl mb-4"
                            style={{
                                width: 40, height: 40,
                                background: card.gradient,
                                color: "#fff",
                                boxShadow: `0 4px 15px ${card.gradient.includes("#c9a84c") ? "rgba(201,168,76,0.3)" : "rgba(0,0,0,0.2)"}`,
                            }}
                        >
                            {card.icon}
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: "#fff" }}>{card.value}</p>
                        <p className="text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {card.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center rounded-lg"
                            style={{
                                width: 32, height: 32,
                                background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                                color: "#c9a84c",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-sm uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Recent Orders
                        </h2>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                        style={{ color: "#c9a84c" }}
                    >
                        View All
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                {["Order", "Customer", "Items", "Status", "Total", "Date"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em]"
                                        style={{ color: "rgba(255,255,255,0.25)" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map((order) => {
                                const sc = STATUS_COLORS[order.status] ?? { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.5)", glow: "none" };
                                return (
                                    <tr
                                        key={order.id}
                                        className="transition-colors duration-150"
                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="font-semibold hover:opacity-70 transition-opacity"
                                                style={{ color: "#e2c975" }}
                                            >
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{order.user.name}</p>
                                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{order.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                                            {order.items[0]?.productName}
                                            {order.items.length > 1 && (
                                                <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                                                    +{order.items.length - 1}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                                                style={{ background: sc.bg, color: sc.text, boxShadow: sc.glow }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold" style={{ color: "#e2c975" }}>
                                            ₹{order.total.toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-6 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {stats.recentOrders.length === 0 && (
                        <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                            No orders yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
