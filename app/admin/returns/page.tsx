"use client";

import { useState, useEffect, useCallback } from "react";

interface ReturnRecord {
    id: string;
    orderId: string;
    reason: string;
    status: string;
    reverseAwb: string | null;
    approvedAt: string | null;
    createdAt: string;
    order: {
        orderNumber: string;
        shippingName: string;
        shippingCity: string;
        total: number;
        items: { productName: string; quantity: number }[];
    };
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    REQUESTED: { bg: "#fff8e6", color: "#d4860e" },
    APPROVED: { bg: "#e3f2fd", color: "#1565c0" },
    AWB_CREATED: { bg: "#f3e5f5", color: "#6a1b9a" },
    IN_TRANSIT: { bg: "#e8f5e9", color: "#2e7d32" },
    RECEIVED: { bg: "#e8f5e9", color: "#1b5e20" },
    REJECTED: { bg: "#fce4ec", color: "#b71c1c" },
};

export default function ReturnsPage() {
    const [returns, setReturns] = useState<ReturnRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/returns");
        if (res.ok) setReturns(await res.json());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const approve = async (id: string) => {
        setApprovingId(id);
        setError(""); setSuccess("");
        const res = await fetch(`/api/admin/returns/${id}/approve`, { method: "POST" });
        const data = await res.json();
        if (res.ok) {
            setSuccess(`Reverse pickup created. AWB: ${data.reverseAwb}`);
            load();
        } else {
            setError(data.error ?? "Failed to approve return");
        }
        setApprovingId(null);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1a1a" }}>Returns Management</h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>Review and approve customer return requests</p>

            {success && (
                <div className="mb-4 rounded-xl p-4" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                    <p className="text-sm font-semibold" style={{ color: "#1b5e20" }}>{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-4 rounded-xl p-4" style={{ background: "#fce4ec", border: "1px solid #f48fb1" }}>
                    <p className="text-sm font-semibold" style={{ color: "#b71c1c" }}>{error}</p>
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : returns.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm" style={{ color: "#888" }}>No return requests yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[800px]">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                    {["Order #", "Customer", "Products", "Reason", "Status", "Reverse AWB", "Requested", "Action"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {returns.map((r, i) => {
                                    const style = STATUS_STYLES[r.status] ?? { bg: "#f5f5f5", color: "#555" };
                                    return (
                                        <tr key={r.id} style={{ borderBottom: i < returns.length - 1 ? "1px solid #f8f4ee" : "none" }}>
                                            <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#c9a84c" }}>{r.order.orderNumber}</td>
                                            <td className="px-4 py-3" style={{ color: "#1a1a1a" }}>
                                                <div>{r.order.shippingName}</div>
                                                <div className="text-xs" style={{ color: "#888" }}>{r.order.shippingCity}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: "#555" }}>
                                                {r.order.items.map(item => `${item.productName} ×${item.quantity}`).join(", ")}
                                            </td>
                                            <td className="px-4 py-3 text-xs max-w-[150px]" style={{ color: "#555" }}>
                                                <div className="line-clamp-2">{r.reason}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "#6a1b9a" }}>
                                                {r.reverseAwb ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: "#888" }}>
                                                {new Date(r.createdAt).toLocaleDateString("en-IN")}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.status === "REQUESTED" ? (
                                                    <button
                                                        onClick={() => approve(r.id)}
                                                        disabled={approvingId === r.id}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                                                        style={{ background: "#6a1b9a", color: "#fff" }}
                                                    >
                                                        {approvingId === r.id ? "Creating..." : "Approve & Create AWB"}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs" style={{ color: "#aaa" }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
