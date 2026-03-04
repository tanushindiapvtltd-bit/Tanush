"use client";

import { useState, useEffect } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Analytics {
    summary: {
        totalOrders: number;
        shipped: number;
        delivered: number;
        deliveryRate: number;
        rtoCases: number;
        rtoRate: number;
        codCount: number;
        prepaidCount: number;
        codAmount: number;
        prepaidAmount: number;
    };
    weeklyDeliveries: { date: string; count: number }[];
    statusDistribution: { status: string; count: number }[];
    rtoTrend: { date: string; count: number }[];
    carrierBreakdown: { name: string; count: number }[];
}

const COLORS = ["#c9a84c", "#6a1b9a", "#1565c0", "#2e7d32", "#b71c1c", "#555"];

function StatCard({ label, value, sub, color = "#1a1a1a" }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#888" }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            {sub && <p className="text-xs mt-1" style={{ color: "#aaa" }}>{sub}</p>}
        </div>
    );
}

export default function ShippingAnalyticsPage() {
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics/shipping")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
            </div>
        );
    }

    if (!data) return <p className="text-sm" style={{ color: "#888" }}>Failed to load analytics.</p>;

    const { summary } = data;
    const pieData = [
        { name: "COD", value: summary.codCount },
        { name: "Prepaid", value: summary.prepaidCount },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1a1a" }}>Shipping Analytics</h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>Overview of delivery performance and logistics metrics</p>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Delivery Rate" value={`${summary.deliveryRate}%`} sub={`${summary.delivered} of ${summary.shipped} shipped`} color="#2e7d32" />
                <StatCard label="RTO Rate" value={`${summary.rtoRate}%`} sub={`${summary.rtoCases} return-to-origin`} color={summary.rtoRate > 10 ? "#b71c1c" : "#555"} />
                <StatCard label="COD Orders" value={summary.codCount} sub={`₹${summary.codAmount.toLocaleString("en-IN")}`} />
                <StatCard label="Prepaid Orders" value={summary.prepaidCount} sub={`₹${summary.prepaidAmount.toLocaleString("en-IN")}`} color="#1565c0" />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Weekly deliveries */}
                <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                    <p className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>Weekly Deliveries</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data.weeklyDeliveries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={2} dot={{ fill: "#c9a84c" }} name="Deliveries" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* COD vs Prepaid */}
                <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                    <p className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>COD vs Prepaid</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`}>
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status distribution */}
                <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                    <p className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>Order Status Distribution</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.statusDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d0" />
                            <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]}>
                                {data.statusDistribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Carrier breakdown */}
                <div className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                    <p className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>Carrier Breakdown</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.carrierBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" name="Shipments" fill="#6a1b9a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RTO area chart */}
            {data.rtoTrend.some(d => d.count > 0) && (
                <div className="mt-6 rounded-xl p-5" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                    <p className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>RTO Trend (30 days)</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={data.rtoTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#b71c1c" fill="#fce4ec" name="RTO Cases" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
