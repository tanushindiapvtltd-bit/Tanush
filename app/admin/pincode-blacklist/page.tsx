"use client";

import { useState, useEffect, useCallback } from "react";

interface BlacklistEntry {
    id: string;
    pincode: string;
    reason: string | null;
    addedBy: string;
    createdAt: string;
}

export default function PincodeBlacklistPage() {
    const [entries, setEntries] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [pincode, setPincode] = useState("");
    const [reason, setReason] = useState("");
    const [adding, setAdding] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/pincode-blacklist");
        if (res.ok) setEntries(await res.json());
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const add = async () => {
        if (!/^\d{6}$/.test(pincode)) { setError("Enter a valid 6-digit pincode"); return; }
        setAdding(true); setError(""); setSuccess("");
        const res = await fetch("/api/admin/pincode-blacklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pincode, reason }),
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(`Pincode ${pincode} added to blacklist`);
            setPincode(""); setReason("");
            load();
        } else {
            setError(data.error ?? "Failed to add pincode");
        }
        setAdding(false);
    };

    const remove = async (entry: BlacklistEntry) => {
        setRemovingId(entry.id); setError(""); setSuccess("");
        const res = await fetch(`/api/admin/pincode-blacklist/${entry.pincode}`, { method: "DELETE" });
        if (res.ok) {
            setSuccess(`Pincode ${entry.pincode} removed`);
            load();
        } else {
            setError("Failed to remove pincode");
        }
        setRemovingId(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1a1a" }}>Pincode Blacklist</h1>
            <p className="text-sm mb-6" style={{ color: "#888" }}>Block specific pincodes from placing orders (e.g., high-RTO areas)</p>

            {/* Add form */}
            <div className="rounded-xl p-5 mb-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                <p className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>Add Pincode to Blacklist</p>
                <div className="flex gap-3 flex-wrap">
                    <input
                        value={pincode}
                        onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Pincode (6 digits)"
                        className="rounded-lg px-3 py-2 text-sm font-mono outline-none w-40"
                        style={{ border: "1px solid #e0d5c5" }}
                        maxLength={6}
                    />
                    <input
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none min-w-[200px]"
                        style={{ border: "1px solid #e0d5c5" }}
                        onKeyDown={e => e.key === "Enter" && add()}
                    />
                    <button
                        onClick={add}
                        disabled={adding || pincode.length !== 6}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-white cursor-pointer disabled:opacity-40"
                        style={{ background: "#1a1a1a" }}
                    >
                        {adding ? "Adding..." : "Add"}
                    </button>
                </div>
                {error && <p className="text-xs mt-2 font-semibold" style={{ color: "#b71c1c" }}>{error}</p>}
                {success && <p className="text-xs mt-2 font-semibold" style={{ color: "#2e7d32" }}>{success}</p>}
            </div>

            {/* List */}
            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid #f0e6d0" }}>
                    <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
                        Blacklisted Pincodes
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#fce4ec", color: "#b71c1c" }}>
                            {entries.length}
                        </span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm" style={{ color: "#888" }}>No pincodes blacklisted yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                {["Pincode", "Reason", "Added By", "Date", ""].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, i) => (
                                <tr key={entry.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #f8f4ee" : "none" }}>
                                    <td className="px-5 py-3 font-mono font-bold" style={{ color: "#b71c1c" }}>{entry.pincode}</td>
                                    <td className="px-5 py-3" style={{ color: "#555" }}>{entry.reason ?? <span style={{ color: "#bbb" }}>—</span>}</td>
                                    <td className="px-5 py-3 text-xs" style={{ color: "#888" }}>{entry.addedBy}</td>
                                    <td className="px-5 py-3 text-xs" style={{ color: "#888" }}>
                                        {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                                    </td>
                                    <td className="px-5 py-3">
                                        <button
                                            onClick={() => remove(entry)}
                                            disabled={removingId === entry.id}
                                            className="text-xs font-semibold cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                                            style={{ color: "#b71c1c" }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
