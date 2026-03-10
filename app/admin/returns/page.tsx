"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ReturnItem {
    id: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNote: string | null;
    returnWaybill: string | null;
    createdAt: string;
    order: {
        id: string;
        orderNumber: string;
        total: number;
        shippingName: string;
        shippingEmail: string;
        items: { productName: string; quantity: number; price: number }[];
    };
    user: { name: string; email: string };
}

const STATUS_STYLE: Record<string, { bg: string; text: string; glow: string }> = {
    PENDING: { bg: "rgba(212,134,14,0.12)", text: "#f0b641", glow: "0 0 8px rgba(212,134,14,0.15)" },
    APPROVED: { bg: "rgba(46,125,50,0.12)", text: "#81c784", glow: "0 0 8px rgba(46,125,50,0.15)" },
    REJECTED: { bg: "rgba(183,28,28,0.12)", text: "#ef5350", glow: "0 0 8px rgba(183,28,28,0.15)" },
};

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const [error, setError] = useState<Record<string, string>>({});

    const fetchReturns = async () => {
        const res = await fetch("/api/admin/returns");
        const data = await res.json();
        setReturns(data);
    };

    useEffect(() => {
        fetchReturns().finally(() => setLoading(false));
    }, []);

    async function handleAction(id: string, action: "approve" | "reject") {
        setProcessing(id + action);
        setError((prev) => ({ ...prev, [id]: "" }));
        try {
            const res = await fetch(`/api/admin/returns/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, adminNote: adminNotes[id] ?? "" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            await fetchReturns();
        } catch (e: unknown) {
            setError((prev) => ({ ...prev, [id]: e instanceof Error ? e.message : "Error" }));
        } finally {
            setProcessing(null);
        }
    }

    const pending = returns.filter((r) => r.status === "PENDING");
    const processed = returns.filter((r) => r.status !== "PENDING");

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Returns</h1>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{pending.length} pending · {processed.length} processed</p>
                </div>
            </div>

            {returns.length === 0 && (
                <div className="rounded-2xl p-12 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ color: "rgba(255,255,255,0.3)" }}>No return requests yet.</p>
                </div>
            )}

            {/* Pending */}
            {pending.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "#e2c975" }}>Pending ({pending.length})</h2>
                    <div className="flex flex-col gap-4">
                        {pending.map((r) => (
                            <ReturnCard
                                key={r.id}
                                r={r}
                                adminNote={adminNotes[r.id] ?? ""}
                                onNoteChange={(v) => setAdminNotes((prev) => ({ ...prev, [r.id]: v }))}
                                onApprove={() => handleAction(r.id, "approve")}
                                onReject={() => handleAction(r.id, "reject")}
                                processing={processing}
                                errorMsg={error[r.id] ?? ""}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Processed */}
            {processed.length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Processed ({processed.length})</h2>
                    <div className="flex flex-col gap-4">
                        {processed.map((r) => (
                            <ReturnCard
                                key={r.id}
                                r={r}
                                adminNote=""
                                onNoteChange={() => { }}
                                onApprove={() => { }}
                                onReject={() => { }}
                                processing={null}
                                errorMsg=""
                                readonly
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ReturnCard({
    r, adminNote, onNoteChange, onApprove, onReject, processing, errorMsg, readonly,
}: {
    r: ReturnItem;
    adminNote: string;
    onNoteChange: (v: string) => void;
    onApprove: () => void;
    onReject: () => void;
    processing: string | null;
    errorMsg: string;
    readonly?: boolean;
}) {
    const style = STATUS_STYLE[r.status] ?? { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.5)", glow: "none" };

    return (
        <div
            className="rounded-2xl p-6 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                            href={`/admin/orders/${r.order.id}`}
                            className="text-sm font-bold hover:opacity-70 transition-opacity"
                            style={{ color: "#e2c975" }}
                        >
                            {r.order.orderNumber}
                        </Link>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: style.bg, color: style.text, boxShadow: style.glow }}>
                            {r.status}
                        </span>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {r.user.name} · {r.user.email}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Requested {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                </div>
                <p className="text-sm font-bold" style={{ color: "#e2c975" }}>₹{r.order.total.toLocaleString("en-IN")}</p>
            </div>

            {/* Items */}
            <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Items</p>
                {r.order.items.map((item, i) => (
                    <p key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {item.productName} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                ))}
            </div>

            {/* Reason */}
            <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Return Reason</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{r.reason}</p>
            </div>

            {/* Admin note + waybill for processed */}
            {r.adminNote && (
                <div className="mb-4 p-3 rounded-xl" style={{
                    background: r.status === "REJECTED" ? "rgba(183,28,28,0.08)" : "rgba(46,125,50,0.08)",
                    border: `1px solid ${r.status === "REJECTED" ? "rgba(183,28,28,0.15)" : "rgba(46,125,50,0.15)"}`,
                }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Admin Note</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{r.adminNote}</p>
                </div>
            )}
            {r.returnWaybill && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.15)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Return Waybill</p>
                    <p className="text-sm font-mono font-bold" style={{ color: "#81c784" }}>{r.returnWaybill}</p>
                </div>
            )}

            {/* Actions */}
            {!readonly && (
                <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="mb-3">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                            Note to customer (optional)
                        </label>
                        <input
                            type="text"
                            value={adminNote}
                            onChange={(e) => onNoteChange(e.target.value)}
                            placeholder="e.g. Item must be unused, Approved — pickup in 2 days..."
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}
                        />
                    </div>
                    {errorMsg && (
                        <p className="mb-3 text-xs font-semibold px-3 py-2 rounded-xl" style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.2)" }}>{errorMsg}</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={onApprove}
                            disabled={!!processing}
                            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, rgba(46,125,50,0.3), rgba(46,125,50,0.1))", color: "#81c784", border: "1px solid rgba(46,125,50,0.2)" }}
                        >
                            {processing === r.id + "approve" ? "Approving..." : "Approve & Create Return"}
                        </button>
                        <button
                            onClick={onReject}
                            disabled={!!processing}
                            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.15)" }}
                        >
                            {processing === r.id + "reject" ? "Rejecting..." : "Reject"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
