"use client";

import { useState } from "react";

interface TrackingHistory {
    status: string;
    description: string;
    timestamp: string;
    location: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    total: number;
    shippingZip: string;
    deliveryTracking: {
        trackingNumber: string | null;
        carrier: string | null;
        currentStatus: string;
        currentLocation: string | null;
        history: TrackingHistory[] | string;
    } | null;
}

interface LiveTrack {
    status: string;
    location: string;
    timestamp: string;
    courierName: string;
    etd: string;
    scans: Array<{ status: string; location: string; timestamp: string; detail: string }>;
}

const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse the _meta history entry — split on first ":" only for robustness. */
function parseMeta(history: TrackingHistory[]): { srOrderId: string; shipmentId: string } | null {
    const meta = history.find((h) => h.status === "_meta");
    if (!meta?.description) return null;

    const parts = meta.description.split("|");
    let srOrderId = "";
    let shipmentId = "";

    for (const part of parts) {
        const idx = part.indexOf(":");
        if (idx === -1) continue;
        const key = part.slice(0, idx);
        const val = part.slice(idx + 1);
        if (key === "srOrderId") srOrderId = val;
        if (key === "shipmentId") shipmentId = val;
    }

    if (!srOrderId || !shipmentId) return null;
    // Verify both are numeric strings (expected from Shiprocket)
    if (!/^\d+$/.test(srOrderId) || !/^\d+$/.test(shipmentId)) return null;
    return { srOrderId, shipmentId };
}

/** Safely parse a history JSON string, always returning an array. */
function parseHistory(raw: TrackingHistory[] | string | undefined): TrackingHistory[] {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
        try { return JSON.parse(raw) as TrackingHistory[]; } catch { return []; }
    }
    return [];
}

/** Format a timestamp safely — returns "" for invalid dates. */
function fmtDate(ts: string): string {
    if (!ts) return "";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts; // return raw if unparseable
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShiprocketCard({ order, onUpdate }: { order: Order; onUpdate: () => Promise<void> }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [errorExpanded, setErrorExpanded] = useState(false);
    const [liveTrack, setLiveTrack] = useState<LiveTrack | null>(null);
    const [showTrack, setShowTrack] = useState(false);

    // Dimension form
    const [weight, setWeight] = useState("500");
    const [length, setLength] = useState("10");
    const [breadth, setBreadth] = useState("10");
    const [height, setHeight] = useState("10");
    const [dimError, setDimError] = useState("");
    const [showDimensions, setShowDimensions] = useState(false);

    const awb = order.deliveryTracking?.trackingNumber;
    const isShiprocket = order.deliveryTracking?.carrier === "Shiprocket";
    const alreadyBooked = isShiprocket && !!awb;

    const history = parseHistory(order.deliveryTracking?.history);
    const meta = parseMeta(history);

    // Any operation in flight — disable all action buttons
    const busy = loading !== null;

    // ── Dimension validation ────────────────────────────────────────────────────
    function validateDimensions(): boolean {
        const w = Number(weight);
        const l = Number(length);
        const b = Number(breadth);
        const h = Number(height);
        if (!Number.isFinite(w) || w < 1) { setDimError("Weight must be at least 1g"); return false; }
        if (!Number.isFinite(l) || l < 1) { setDimError("Length must be at least 1cm"); return false; }
        if (!Number.isFinite(b) || b < 1) { setDimError("Breadth must be at least 1cm"); return false; }
        if (!Number.isFinite(h) || h < 1) { setDimError("Height must be at least 1cm"); return false; }
        if (w > 100_000) { setDimError("Weight exceeds maximum (100,000g)"); return false; }
        if (l > 200 || b > 200 || h > 200) { setDimError("Dimensions cannot exceed 200cm"); return false; }
        setDimError("");
        return true;
    }

    // ── Actions ─────────────────────────────────────────────────────────────────

    async function bookShipment() {
        if (busy) return;
        if (!validateDimensions()) return;
        setLoading("book");
        setError("");
        setErrorExpanded(false);
        try {
            const res = await fetch("/api/admin/shiprocket/create-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    weight: Number(weight),
                    length: Number(length),
                    breadth: Number(breadth),
                    height: Number(height),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to book shipment");
            setShowDimensions(false);
            await onUpdate();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(null);
        }
    }

    async function liveTrackShipment() {
        if (busy || !awb) return;
        setLoading("track");
        setError("");
        setErrorExpanded(false);
        setShowTrack(true);
        try {
            const res = await fetch(`/api/admin/shiprocket/track?awb=${encodeURIComponent(awb)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Track failed");
            setLiveTrack(data);
            await onUpdate();
        } catch (e: unknown) {
            setShowTrack(false);
            setError(e instanceof Error ? e.message : "Track error");
        } finally {
            setLoading(null);
        }
    }

    async function printLabel() {
        if (busy) return;
        if (!meta?.shipmentId) {
            setError("Shipment ID not found. Re-book the shipment to regenerate label.");
            return;
        }
        setLoading("label");
        setError("");
        setErrorExpanded(false);
        try {
            const res = await fetch("/api/admin/shiprocket/label", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentId: Number(meta.shipmentId) }),
            });

            if (res.headers.get("content-type")?.includes("application/pdf")) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.click();
                // Revoke after a tick so the new tab can start loading
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? "Label generation failed");
                if (data.labelUrl) {
                    window.open(data.labelUrl, "_blank", "noopener,noreferrer");
                } else {
                    throw new Error("No label URL returned");
                }
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Label error");
        } finally {
            setLoading(null);
        }
    }

    async function cancelShipment() {
        if (busy) return;
        if (!meta?.srOrderId) {
            setError("Shiprocket order ID not found. Cannot cancel.");
            return;
        }
        if (!confirm("Cancel this Shiprocket shipment? This cannot be undone.")) return;
        setLoading("cancel");
        setError("");
        setErrorExpanded(false);
        try {
            const res = await fetch("/api/admin/shiprocket/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id, srOrderId: Number(meta.srOrderId) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Cancel failed");
            await onUpdate();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Cancel error");
        } finally {
            setLoading(null);
        }
    }

    // ── Error display helpers ───────────────────────────────────────────────────
    const ERROR_TRUNCATE = 200;
    const displayError = errorExpanded ? error : error.slice(0, ERROR_TRUNCATE);
    const errorTruncated = !errorExpanded && error.length > ERROR_TRUNCATE;

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-bold text-sm uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.7)" }}>
                        Shiprocket
                    </h2>
                    {alreadyBooked && (
                        <p className="text-xs mt-0.5 font-mono select-all" style={{ color: "rgba(255,255,255,0.4)" }}>
                            AWB: {awb}
                        </p>
                    )}
                </div>
                <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "rgba(255,107,53,0.15)", color: "#ff7043", border: "1px solid rgba(255,107,53,0.2)" }}>
                    Shiprocket
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(183,28,28,0.2)" }}>
                    <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ background: "rgba(183,28,28,0.2)" }}>
                        <div className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="#ef5350">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-bold" style={{ color: "#ef5350" }}>Error</p>
                        </div>
                        <button onClick={() => { setError(""); setErrorExpanded(false); }}
                            className="opacity-70 hover:opacity-100 cursor-pointer text-sm leading-none" style={{ color: "#ef5350" }}>✕</button>
                    </div>
                    <div className="px-3 py-2.5" style={{ background: "rgba(183,28,28,0.08)" }}>
                        <p className="text-xs leading-relaxed wrap-break-word" style={{ color: "#ef5350" }}>{displayError}</p>
                        {errorTruncated && (
                            <button onClick={() => setErrorExpanded(true)} className="text-[10px] mt-1 underline cursor-pointer" style={{ color: "rgba(239,83,80,0.7)" }}>
                                Show full error
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Action buttons — all disabled when any op is in flight */}
            <div className="flex flex-wrap gap-2">
                {!alreadyBooked && (
                    <button
                        onClick={() => { setShowDimensions(!showDimensions); setDimError(""); }}
                        disabled={busy}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                    >
                        Book Shipment
                    </button>
                )}

                {alreadyBooked && (
                    <>
                        <button
                            onClick={liveTrackShipment}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, rgba(21,101,192,0.3), rgba(21,101,192,0.1))", color: "#64b5f6", border: "1px solid rgba(21,101,192,0.2)" }}
                        >
                            {loading === "track" ? "Tracking..." : "Live Track"}
                        </button>
                        <button
                            onClick={printLabel}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "rgba(106,27,154,0.12)", color: "#ba68c8", border: "1px solid rgba(106,27,154,0.15)" }}
                        >
                            {loading === "label" ? "Loading..." : "Print Label"}
                        </button>
                        <button
                            onClick={() => { setShowDimensions(!showDimensions); setDimError(""); setError(""); setErrorExpanded(false); }}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            Re-book
                        </button>
                        <button
                            onClick={cancelShipment}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.15)" }}
                        >
                            {loading === "cancel" ? "Cancelling..." : "Cancel"}
                        </button>
                    </>
                )}
            </div>

            {/* Dimensions / booking form */}
            {showDimensions && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {alreadyBooked ? "Re-book Shipment" : "Shipment Dimensions"}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {[
                            { label: "Weight (g)", value: weight, set: setWeight, min: 1, max: 100000 },
                            { label: "Length (cm)", value: length, set: setLength, min: 1, max: 200 },
                            { label: "Breadth (cm)", value: breadth, set: setBreadth, min: 1, max: 200 },
                            { label: "Height (cm)", value: height, set: setHeight, min: 1, max: 200 },
                        ].map(({ label, value, set, min, max }) => (
                            <div key={label}>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                                <input
                                    type="number"
                                    value={value}
                                    min={min}
                                    max={max}
                                    step="1"
                                    onChange={(e) => { set(e.target.value); setDimError(""); }}
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        ))}
                    </div>
                    {dimError && (
                        <p className="mb-3 text-xs font-semibold px-3 py-2 rounded-xl"
                            style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.2)" }}>
                            {dimError}
                        </p>
                    )}
                    <button
                        onClick={bookShipment}
                        disabled={busy}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                    >
                        {loading === "book" ? "Booking..." : "Confirm & Book"}
                    </button>
                </div>
            )}

            {/* Live tracking panel */}
            {showTrack && liveTrack && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.35)" }}>Live Status</p>
                        <button onClick={() => setShowTrack(false)} className="text-xs cursor-pointer" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>
                    </div>
                    <div className="mb-3 p-3 rounded-xl" style={{ background: "rgba(21,101,192,0.1)", border: "1px solid rgba(21,101,192,0.2)" }}>
                        <p className="text-sm font-bold" style={{ color: "#64b5f6" }}>{liveTrack.status || "—"}</p>
                        {liveTrack.courierName && (
                            <p className="text-xs mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{liveTrack.courierName}</p>
                        )}
                        {liveTrack.location && (
                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{liveTrack.location}</p>
                        )}
                        {liveTrack.etd && (
                            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>ETD: {liveTrack.etd}</p>
                        )}
                    </div>
                    {liveTrack.scans.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                            {liveTrack.scans.map((scan, i) => (
                                <div key={`${scan.timestamp}-${i}`} className="flex gap-2 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                                            style={{ background: i === 0 ? "#c9a84c" : "rgba(255,255,255,0.15)" }} />
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{scan.status || "—"}</p>
                                        {scan.detail && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{scan.detail}</p>}
                                        {scan.location && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{scan.location}</p>}
                                        {scan.timestamp && (
                                            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{fmtDate(scan.timestamp)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No scan events yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
