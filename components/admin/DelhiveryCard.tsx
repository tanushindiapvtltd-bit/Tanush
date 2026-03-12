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
    scans: Array<{ status: string; location: string; timestamp: string; detail: string }>;
}

const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" };

export default function DelhiveryCard({ order, onUpdate }: { order: Order; onUpdate: () => Promise<void> }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [liveTrack, setLiveTrack] = useState<LiveTrack | null>(null);
    const [showTrack, setShowTrack] = useState(false);

    // Dimensions for shipment booking
    const [weight, setWeight] = useState("500");
    const [length, setLength] = useState("10");
    const [breadth, setBreadth] = useState("10");
    const [height, setHeight] = useState("10");
    const [showDimensions, setShowDimensions] = useState(false);

    // Update shipment state
    const [showUpdate, setShowUpdate] = useState(false);
    const [updateName, setUpdateName] = useState("");
    const [updatePhone, setUpdatePhone] = useState("");
    const [updateAdd, setUpdateAdd] = useState("");
    const [updateSuccess, setUpdateSuccess] = useState("");

    const waybill = order.deliveryTracking?.trackingNumber;
    const isDelhivery = order.deliveryTracking?.carrier === "Delhivery";

    async function bookShipment() {
        setLoading("book");
        setError("");
        try {
            const res = await fetch("/api/admin/delhivery/create-shipment", {
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
            await onUpdate();
            setShowDimensions(false);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error");
        } finally {
            setLoading(null);
        }
    }

    async function liveTrackShipment() {
        if (!waybill) return;
        setLoading("track");
        setError("");
        setShowTrack(true);
        try {
            const res = await fetch(`/api/admin/delhivery/track/${encodeURIComponent(waybill)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Track failed");
            setLiveTrack(data);
            await onUpdate();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Track error");
        } finally {
            setLoading(null);
        }
    }

    async function cancelDelhivery() {
        if (!waybill || !confirm("Cancel this Delhivery shipment?")) return;
        setLoading("cancel");
        setError("");
        try {
            const res = await fetch("/api/admin/delhivery/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waybill, orderId: order.id }),
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

    async function updateShipmentDetails() {
        if (!waybill) return;
        setLoading("update");
        setError("");
        setUpdateSuccess("");
        try {
            const fields: Record<string, string> = {};
            if (updateName.trim()) fields.name = updateName.trim();
            if (updatePhone.trim()) fields.phone = updatePhone.trim();
            if (updateAdd.trim()) fields.add = updateAdd.trim();
            if (Object.keys(fields).length === 0) throw new Error("Fill at least one field to update");
            const res = await fetch("/api/admin/delhivery/update-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waybill, ...fields }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Update failed");
            setUpdateSuccess(data.message ?? "Updated successfully");
            setUpdateName(""); setUpdatePhone(""); setUpdateAdd("");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Update error");
        } finally {
            setLoading(null);
        }
    }

    const alreadyBooked = isDelhivery && !!waybill;

    return (
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-bold text-sm uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.7)" }}>
                        Delhivery One
                    </h2>
                    {alreadyBooked && (
                        <p className="text-xs mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Waybill: {waybill}
                        </p>
                    )}
                </div>
                <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(230,57,70,0.15)", color: "#ef5350", border: "1px solid rgba(230,57,70,0.2)" }}>
                    Delhivery
                </div>
            </div>

            {error && (
                <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(183,28,28,0.2)" }}>
                    <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ background: "rgba(183,28,28,0.2)" }}>
                        <div className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="#ef5350"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                            <p className="text-xs font-bold" style={{ color: "#ef5350" }}>Delhivery Error</p>
                        </div>
                        <button onClick={() => setError("")} className="opacity-70 hover:opacity-100 cursor-pointer text-sm leading-none" style={{ color: "#ef5350" }}>✕</button>
                    </div>
                    <div className="px-3 py-2.5" style={{ background: "rgba(183,28,28,0.08)" }}>
                        <p className="text-xs leading-relaxed" style={{ color: "#ef5350" }}>{error}</p>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {!alreadyBooked && (
                    <button
                        onClick={() => setShowDimensions(!showDimensions)}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                    >
                        Book Shipment
                    </button>
                )}

                {alreadyBooked && (
                    <>
                        <button
                            onClick={liveTrackShipment}
                            disabled={loading === "track"}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, rgba(21,101,192,0.3), rgba(21,101,192,0.1))", color: "#64b5f6", border: "1px solid rgba(21,101,192,0.2)" }}
                        >
                            {loading === "track" ? "Tracking..." : "Live Track"}
                        </button>
                        <button
                            onClick={() => { setShowUpdate(!showUpdate); setError(""); setUpdateSuccess(""); }}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                            style={{ background: "rgba(46,125,50,0.12)", color: "#81c784", border: "1px solid rgba(46,125,50,0.15)" }}
                        >
                            Edit Shipment
                        </button>
                        <button
                            onClick={cancelDelhivery}
                            disabled={loading === "cancel"}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                            style={{ background: "rgba(183,28,28,0.12)", color: "#ef5350", border: "1px solid rgba(183,28,28,0.15)" }}
                        >
                            {loading === "cancel" ? "Cancelling..." : "Cancel"}
                        </button>
                    </>
                )}
            </div>

            {/* Update shipment form */}
            {showUpdate && alreadyBooked && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Edit Shipment Details</p>
                    {updateSuccess && (
                        <p className="mb-3 text-xs font-semibold px-3 py-2 rounded-xl" style={{ background: "rgba(46,125,50,0.12)", color: "#81c784", border: "1px solid rgba(46,125,50,0.2)" }}>{updateSuccess}</p>
                    )}
                    <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Leave fields blank to keep unchanged.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {[
                            { label: "Customer Name", value: updateName, set: setUpdateName, placeholder: "e.g. Rahul Sharma" },
                            { label: "Phone", value: updatePhone, set: setUpdatePhone, placeholder: "10-digit number" },
                            { label: "Address", value: updateAdd, set: setUpdateAdd, placeholder: "Street address" },
                        ].map(({ label, value, set, placeholder }) => (
                            <div key={label}>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => set(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={updateShipmentDetails}
                        disabled={loading === "update"}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, rgba(46,125,50,0.3), rgba(46,125,50,0.1))", color: "#81c784", border: "1px solid rgba(46,125,50,0.2)" }}
                    >
                        {loading === "update" ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            )}

            {/* Dimensions form */}
            {showDimensions && !alreadyBooked && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Shipment Dimensions</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[
                            { label: "Weight (g)", value: weight, set: setWeight },
                            { label: "Length (cm)", value: length, set: setLength },
                            { label: "Breadth (cm)", value: breadth, set: setBreadth },
                            { label: "Height (cm)", value: height, set: setHeight },
                        ].map(({ label, value, set }) => (
                            <div key={label}>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => set(e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={bookShipment}
                        disabled={loading === "book"}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #c9a84c, #e2c975)", color: "#0c0c0c", boxShadow: "0 4px 15px rgba(201,168,76,0.3)" }}
                    >
                        {loading === "book" ? "Booking..." : "Confirm & Book"}
                    </button>
                </div>
            )}

            {/* Live tracking result */}
            {showTrack && liveTrack && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.35)" }}>Live Status</p>
                        <button onClick={() => setShowTrack(false)} className="text-xs cursor-pointer" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>
                    </div>
                    <div className="mb-3 p-3 rounded-xl" style={{ background: "rgba(21,101,192,0.1)", border: "1px solid rgba(21,101,192,0.2)" }}>
                        <p className="text-sm font-bold" style={{ color: "#64b5f6" }}>{liveTrack.status}</p>
                        {liveTrack.location && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{liveTrack.location}</p>}
                        {liveTrack.timestamp && (
                            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                                {new Date(liveTrack.timestamp).toLocaleString("en-IN")}
                            </p>
                        )}
                    </div>
                    {liveTrack.scans.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                            {[...liveTrack.scans].reverse().map((scan, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? "#c9a84c" : "rgba(255,255,255,0.15)" }} />
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{scan.status}</p>
                                        {scan.detail && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{scan.detail}</p>}
                                        {scan.location && <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{scan.location}</p>}
                                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                                            {new Date(scan.timestamp).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
