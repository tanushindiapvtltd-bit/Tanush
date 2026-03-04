"use client";

import { useState, useEffect, useCallback } from "react";

interface NDRItem {
    waybill: string;
    status: string;
    ndrReason: string;
    attemptCount: number;
    lastAttempt?: string;
    customerName?: string;
    customerPhone?: string;
    customerCity?: string;
}

interface AddressForm {
    address: string;
    city: string;
    pincode: string;
    phone: string;
}

export default function NDRPage() {
    const [items, setItems] = useState<NDRItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [addressModal, setAddressModal] = useState<{ waybill: string } | null>(null);
    const [addressForm, setAddressForm] = useState<AddressForm>({ address: "", city: "", pincode: "", phone: "" });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/ndr");
        if (res.ok) setItems(await res.json());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const doAction = async (waybill: string, action: "reattempt" | "cancel", newAddress?: AddressForm) => {
        setActionLoading(waybill + action);
        setError(""); setSuccess("");
        const res = await fetch(`/api/admin/ndr/${waybill}/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, newAddress }),
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(`${action === "reattempt" ? "Reattempt" : "Cancellation"} submitted for ${waybill}`);
            load();
        } else {
            setError(data.error ?? "Action failed");
        }
        setActionLoading(null);
    };

    const submitAddressUpdate = async () => {
        if (!addressModal) return;
        setActionLoading(addressModal.waybill + "address_update");
        setError(""); setSuccess("");
        const res = await fetch(`/api/admin/ndr/${addressModal.waybill}/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "address_update", newAddress: addressForm }),
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(`Address updated for ${addressModal.waybill}`);
            setAddressModal(null);
            load();
        } else {
            setError(data.error ?? "Update failed");
        }
        setActionLoading(null);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>NDR Management</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#888" }}>Non-Delivery Report — manage failed delivery attempts</p>
                </div>
                <button onClick={load} className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: "#f5f5f5", color: "#555" }}>
                    Refresh
                </button>
            </div>

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
                ) : items.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-2xl mb-2">✓</p>
                        <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>No NDR cases</p>
                        <p className="text-xs mt-1" style={{ color: "#888" }}>All shipments are on track</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                    {["AWB", "Customer", "City", "NDR Reason", "Attempts", "Last Attempt", "Actions"].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={item.waybill} style={{ borderBottom: i < items.length - 1 ? "1px solid #f8f4ee" : "none" }}>
                                        <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#6a1b9a" }}>{item.waybill}</td>
                                        <td className="px-4 py-3" style={{ color: "#1a1a1a" }}>
                                            <div>{item.customerName ?? "—"}</div>
                                            {item.customerPhone && <div className="text-xs" style={{ color: "#888" }}>{item.customerPhone}</div>}
                                        </td>
                                        <td className="px-4 py-3" style={{ color: "#555" }}>{item.customerCity ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#fff8e6", color: "#d4860e" }}>
                                                {item.ndrReason || "Unspecified"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold" style={{ color: item.attemptCount >= 3 ? "#b71c1c" : "#1a1a1a" }}>
                                            {item.attemptCount}
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: "#888" }}>
                                            {item.lastAttempt ? new Date(item.lastAttempt).toLocaleDateString("en-IN") : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => doAction(item.waybill, "reattempt")}
                                                    disabled={actionLoading === item.waybill + "reattempt"}
                                                    className="px-2.5 py-1 rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                                                    style={{ background: "#e8f5e9", color: "#2e7d32" }}
                                                >
                                                    Reattempt
                                                </button>
                                                <button
                                                    onClick={() => { setAddressModal({ waybill: item.waybill }); setAddressForm({ address: "", city: "", pincode: "", phone: item.customerPhone ?? "" }); }}
                                                    className="px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
                                                    style={{ background: "#e3f2fd", color: "#1565c0" }}
                                                >
                                                    Address
                                                </button>
                                                <button
                                                    onClick={() => doAction(item.waybill, "cancel")}
                                                    disabled={actionLoading === item.waybill + "cancel"}
                                                    className="px-2.5 py-1 rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                                                    style={{ background: "#fce4ec", color: "#b71c1c" }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Address update modal */}
            {addressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }}>
                    <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#fff" }}>
                        <h3 className="text-lg font-bold mb-1" style={{ color: "#1a1a1a" }}>Update Delivery Address</h3>
                        <p className="text-xs mb-4" style={{ color: "#888" }}>AWB: {addressModal.waybill}</p>
                        <div className="flex flex-col gap-3 mb-5">
                            {([["address", "New Address"], ["city", "City"], ["pincode", "Pincode"], ["phone", "Phone"]] as const).map(([field, label]) => (
                                <div key={field}>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: "#555" }}>{label}</label>
                                    <input
                                        value={addressForm[field]}
                                        onChange={e => setAddressForm(f => ({ ...f, [field]: e.target.value }))}
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                        style={{ border: "1px solid #e0d5c5" }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setAddressModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#f5f5f5", color: "#555" }}>
                                Cancel
                            </button>
                            <button
                                onClick={submitAddressUpdate}
                                disabled={!!actionLoading}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
                                style={{ background: "#1565c0" }}
                            >
                                {actionLoading ? "Updating..." : "Update Address"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
