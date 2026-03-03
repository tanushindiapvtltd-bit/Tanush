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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "#fff8e6", text: "#d4860e" },
    CONFIRMED: { bg: "#e6f4ea", text: "#2e7d32" },
    PROCESSING: { bg: "#e3f2fd", text: "#1565c0" },
    SHIPPED: { bg: "#f3e5f5", text: "#6a1b9a" },
    DELIVERED: { bg: "#e8f5e9", text: "#1b5e20" },
    CANCELLED: { bg: "#fce4ec", text: "#b71c1c" },
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
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: "₹", color: "#c9a84c" },
        { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "#4a90e2" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "#e67e22" },
        { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#27ae60" },
        { label: "Products", value: stats.totalProducts, icon: "💎", color: "#8e44ad" },
        { label: "Reviews", value: stats.totalReviews, icon: "★", color: "#e74c3c" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1a1a" }}>Dashboard</h1>
            <p className="text-sm mb-8" style={{ color: "#888" }}>Welcome back, Admin</p>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {cards.map((card) => (
                    <div key={card.label} className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-lg">{card.icon}</span>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
                        <p className="text-xs uppercase tracking-wider" style={{ color: "#888" }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f0e6d0" }}>
                    <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#1a1a1a" }}>Recent Orders</h2>
                    <Link href="/admin/orders" className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: "#c9a84c" }}>
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                {["Order", "Customer", "Items", "Status", "Total", "Date"].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#888" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map((order) => {
                                const sc = STATUS_COLORS[order.status] ?? { bg: "#f5f5f5", text: "#555" };
                                return (
                                    <tr key={order.id} style={{ borderBottom: "1px solid #f9f6f1" }}>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/orders/${order.id}`} className="font-semibold hover:opacity-70 transition-opacity" style={{ color: "#c9a84c" }}>
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4" style={{ color: "#555" }}>
                                            <p className="font-medium">{order.user.name}</p>
                                            <p className="text-xs" style={{ color: "#aaa" }}>{order.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4" style={{ color: "#555" }}>
                                            {order.items[0]?.productName}
                                            {order.items.length > 1 && <span className="text-xs ml-1" style={{ color: "#aaa" }}>+{order.items.length - 1}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide" style={{ background: sc.bg, color: sc.text }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold" style={{ color: "#c9a84c" }}>
                                            ₹{order.total.toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-6 py-4 text-xs" style={{ color: "#888" }}>
                                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
