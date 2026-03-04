"use client";

import { useState, useEffect } from "react";

interface CODOrder {
    id: string;
    orderNumber: string;
    total: number;
    shippingName: string;
    shippingCity: string;
    createdAt: string;
}

interface ByDate {
    date: string;
    orders: CODOrder[];
    amount: number;
}

interface RemittanceData {
    totalCollected: number;
    totalRemitted: number;
    pendingRemittance: number;
    byDate: ByDate[];
}

export default function CODRemittancePage() {
    const [data, setData] = useState<RemittanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/cod-remittance")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
            </div>
        );
    }

    if (!data) return <p className="text-sm" style={{ color: "#888" }}>Failed to load.</p>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1a1a" }}>COD Remittance</h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>Track cash-on-delivery collections and remittances from Delhivery</p>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total COD Collected", value: data.totalCollected, color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7" },
                    { label: "Remitted to Account", value: data.totalRemitted, color: "#1565c0", bg: "#e3f2fd", border: "#90caf9" },
                    { label: "Pending Remittance", value: data.pendingRemittance, color: "#d4860e", bg: "#fff8e6", border: "#f5c842" },
                ].map(card => (
                    <div key={card.label} className="rounded-xl p-5" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: card.color }}>{card.label}</p>
                        <p className="text-2xl font-bold" style={{ color: card.color }}>
                            ₹{card.value.toLocaleString("en-IN")}
                        </p>
                    </div>
                ))}
            </div>

            {/* By date breakdown */}
            <div className="flex flex-col gap-5">
                {data.byDate.length === 0 ? (
                    <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <p className="text-sm" style={{ color: "#888" }}>No COD orders delivered yet.</p>
                    </div>
                ) : data.byDate.map(group => (
                    <div key={group.date} className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#faf9f6", borderBottom: "1px solid #f0e6d0" }}>
                            <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
                                {new Date(group.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <span className="text-sm font-bold" style={{ color: "#2e7d32" }}>
                                ₹{group.amount.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f8f4ee" }}>
                                    {["Order #", "Customer", "City", "Amount"].map(h => (
                                        <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {group.orders.map((order, i) => (
                                    <tr key={order.id} style={{ borderBottom: i < group.orders.length - 1 ? "1px solid #f8f4ee" : "none" }}>
                                        <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: "#c9a84c" }}>{order.orderNumber}</td>
                                        <td className="px-5 py-3" style={{ color: "#1a1a1a" }}>{order.shippingName}</td>
                                        <td className="px-5 py-3" style={{ color: "#555" }}>{order.shippingCity}</td>
                                        <td className="px-5 py-3 font-bold" style={{ color: "#2e7d32" }}>₹{order.total.toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}
