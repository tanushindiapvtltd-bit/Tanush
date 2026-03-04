"use client";

import { useState, useEffect, useCallback } from "react";

interface ManifestItem {
    id: string;
    trackingNumber: string | null;
    createdAt: string;
    order: { orderNumber: string; shippingName: string; shippingCity: string; createdAt: string };
}

export default function ManifestPage() {
    const [items, setItems] = useState<ManifestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [manifestUrl, setManifestUrl] = useState<string | null>(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/manifest");
        const data = await res.json();
        setItems(data.items ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const generateNow = async () => {
        setGenerating(true);
        setError("");
        setManifestUrl(null);
        const res = await fetch("/api/admin/manifest", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error ?? "Failed to generate manifest");
        } else {
            setManifestUrl(data.manifestUrl ?? null);
            load();
        }
        setGenerating(false);
    };

    const now = new Date();
    const isAfterCutoff = now.getHours() >= 17 && items.length > 0;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Manifest</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#888" }}>Generate daily manifest for Delhivery pickup</p>
                </div>
                <button
                    onClick={generateNow}
                    disabled={generating || items.length === 0}
                    className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
                    style={{ background: "#1a1a1a" }}
                >
                    {generating ? "Generating..." : `Generate Manifest (${items.length})`}
                </button>
            </div>

            {isAfterCutoff && (
                <div className="mb-5 rounded-xl p-4 flex items-start gap-3" style={{ background: "#fff8e6", border: "1px solid #f5c842" }}>
                    <span className="text-lg">⚠</span>
                    <div>
                        <p className="text-sm font-bold" style={{ color: "#a06000" }}>Pickup cutoff approaching</p>
                        <p className="text-xs mt-0.5" style={{ color: "#7a5200" }}>
                            It&apos;s after 5 PM and you have {items.length} unmanifested shipment{items.length !== 1 ? "s" : ""}.
                            Generate manifest now to include today&apos;s shipments in the pickup.
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-5 rounded-xl p-4" style={{ background: "#fce4ec", border: "1px solid #f48fb1" }}>
                    <p className="text-sm font-semibold" style={{ color: "#b71c1c" }}>{error}</p>
                </div>
            )}

            {manifestUrl && (
                <div className="mb-5 rounded-xl p-4 flex items-center justify-between" style={{ background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                    <p className="text-sm font-semibold" style={{ color: "#1b5e20" }}>
                        Manifest generated successfully for {items.length > 0 ? "previous" : "current"} shipments.
                    </p>
                    <a
                        href={manifestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg text-sm font-bold"
                        style={{ background: "#2e7d32", color: "#fff" }}
                    >
                        Download PDF
                    </a>
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid #f0e6d0" }}>
                    <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>
                        Unmanifested Shipments
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: items.length > 0 ? "#fff8e6" : "#f0f0f0", color: items.length > 0 ? "#d4860e" : "#888" }}>
                            {items.length}
                        </span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-2xl mb-2">✓</p>
                        <p className="text-sm font-semibold" style={{ color: "#2e7d32" }}>All shipments manifested</p>
                        <p className="text-xs mt-1" style={{ color: "#888" }}>No pending shipments for today</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                {["Order #", "Customer", "City", "AWB", "Created"].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? "1px solid #f8f4ee" : "none" }}>
                                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: "#c9a84c" }}>{item.order.orderNumber}</td>
                                    <td className="px-5 py-3" style={{ color: "#1a1a1a" }}>{item.order.shippingName}</td>
                                    <td className="px-5 py-3" style={{ color: "#555" }}>{item.order.shippingCity}</td>
                                    <td className="px-5 py-3 font-mono text-xs" style={{ color: "#6a1b9a" }}>{item.trackingNumber}</td>
                                    <td className="px-5 py-3 text-xs" style={{ color: "#888" }}>
                                        {new Date(item.order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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
