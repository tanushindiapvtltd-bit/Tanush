"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Turnstile } from "@marsidev/react-turnstile";

interface TrackEvent {
    status: string;
    location: string;
    timestamp: string;
    instructions?: string;
}

interface TrackData {
    waybill: string;
    status: string;
    location: string;
    expectedDelivery?: string;
    events: TrackEvent[];
    origin?: string;
    destination?: string;
}

const STEPS = ["Order Confirmed", "Shipped", "In Transit", "Out for Delivery", "Delivered"];
const STEP_STATUSES: Record<string, number> = {
    "Manifested": 1,
    "Picked Up": 1,
    "In Transit": 2,
    "Reached At Hub": 2,
    "Reached At Destination Hub": 2,
    "Dispatched": 2,
    "Out For Delivery": 3,
    "Out for Delivery": 3,
    "Delivered": 4,
    "Order Placed": 0,
    "Confirmed": 0,
    "Shipped": 1,
};
const POLL_INTERVAL = 30000; // 30 seconds
const CAPTCHA_THRESHOLD = 5;
const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function TrackOrderPage() {
    const { awb } = useParams<{ awb: string }>();
    const [data, setData] = useState<TrackData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rateLimited, setRateLimited] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const requestCountRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchTracking = useCallback(async () => {
        requestCountRef.current += 1;

        // Show CAPTCHA after threshold
        if (requestCountRef.current > CAPTCHA_THRESHOLD && !captchaToken && TURNSTILE_KEY) {
            setShowCaptcha(true);
            return;
        }

        try {
            const res = await fetch(`/api/shipping/track/${encodeURIComponent(awb)}`);
            if (res.status === 429) {
                setRateLimited(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
                return;
            }
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Tracking failed");
                return;
            }
            setData(json);
            setError("");
        } catch {
            setError("Failed to fetch tracking data");
        } finally {
            setLoading(false);
        }
    }, [awb, captchaToken]);

    useEffect(() => {
        fetchTracking();
        intervalRef.current = setInterval(fetchTracking, POLL_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchTracking]);

    const currentStepIndex = data ? (STEP_STATUSES[data.status] ?? 0) : 0;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/track-order" className="text-xs font-semibold uppercase tracking-widest hover:opacity-70" style={{ color: "#c9a84c" }}>
                        ← Track another order
                    </Link>
                    <h1 className="text-2xl mt-3 font-bold" style={{ color: "#1a1a1a" }}>
                        Tracking: <span className="font-mono" style={{ color: "#6a1b9a" }}>{awb}</span>
                    </h1>
                    {data?.origin && (
                        <p className="text-sm mt-1" style={{ color: "#888" }}>
                            {data.origin} → {data.destination}
                        </p>
                    )}
                </div>

                {rateLimited && (
                    <div className="rounded-xl p-5 mb-6" style={{ background: "#fce4ec", border: "1px solid #f48fb1" }}>
                        <p className="text-sm font-semibold" style={{ color: "#b71c1c" }}>
                            Too many requests. Please wait a minute before tracking again.
                        </p>
                    </div>
                )}

                {showCaptcha && TURNSTILE_KEY && (
                    <div className="rounded-xl p-5 mb-6 text-center" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <p className="text-sm mb-4" style={{ color: "#555" }}>
                            Please complete the security check to continue tracking.
                        </p>
                        <Turnstile
                            siteKey={TURNSTILE_KEY}
                            onSuccess={(token) => {
                                setCaptchaToken(token);
                                setShowCaptcha(false);
                                fetchTracking();
                            }}
                        />
                    </div>
                )}

                {loading && !data && (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                )}

                {error && (
                    <div className="rounded-xl p-5 mb-6" style={{ background: "#fce4ec", border: "1px solid #f48fb1" }}>
                        <p className="text-sm font-semibold" style={{ color: "#b71c1c" }}>{error}</p>
                        <p className="text-xs mt-1" style={{ color: "#c62828" }}>
                            Verify the AWB number is correct. It may take a few hours after booking for tracking to activate.
                        </p>
                    </div>
                )}

                {data && (
                    <>
                        {/* Status Card */}
                        <div className="rounded-2xl p-6 mb-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#aaa" }}>Current Status</p>
                                    <p className="text-xl font-bold" style={{ color: "#6a1b9a" }}>{data.status}</p>
                                </div>
                                {data.location && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#aaa" }}>Location</p>
                                        <p className="text-base font-semibold" style={{ color: "#1a1a1a" }}>{data.location}</p>
                                    </div>
                                )}
                                {data.expectedDelivery && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#aaa" }}>Expected Delivery</p>
                                        <p className="text-base font-semibold" style={{ color: "#2e7d32" }}>
                                            {new Date(data.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Progress Steps */}
                            <div className="flex items-center overflow-x-auto pb-1">
                                {STEPS.map((step, i) => {
                                    const done = i <= currentStepIndex;
                                    const active = i === currentStepIndex;
                                    return (
                                        <div key={step} className="flex items-center flex-shrink-0">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                                    style={{
                                                        background: done ? "#6a1b9a" : "#f0e6d0",
                                                        color: done ? "#fff" : "#bbb",
                                                        boxShadow: active ? "0 0 0 3px #6a1b9a44" : "none",
                                                    }}
                                                >
                                                    {done && i < currentStepIndex ? "✓" : i + 1}
                                                </div>
                                                <p className="text-[9px] uppercase tracking-wide mt-1 text-center max-w-[64px]" style={{ color: done ? "#6a1b9a" : "#bbb" }}>
                                                    {step}
                                                </p>
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <div className="h-0.5 w-8 flex-shrink-0 mx-1" style={{ background: i < currentStepIndex ? "#6a1b9a" : "#e0d5c5" }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Scan History */}
                        {data.events.length > 0 && (
                            <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                                <h2 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: "#888" }}>
                                    Shipment History
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {[...data.events].reverse().map((ev, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="flex flex-col items-center pt-1">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ background: i === 0 ? "#c9a84c" : "#ddd" }}
                                                />
                                                {i < data.events.length - 1 && (
                                                    <div className="w-px flex-1 mt-1" style={{ background: "#eee", minHeight: 16 }} />
                                                )}
                                            </div>
                                            <div className="pb-3">
                                                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{ev.status}</p>
                                                {ev.location && (
                                                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>{ev.location}</p>
                                                )}
                                                {ev.instructions && (
                                                    <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{ev.instructions}</p>
                                                )}
                                                <p className="text-[10px] mt-1" style={{ color: "#bbb" }}>
                                                    {new Date(ev.timestamp).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-center text-xs mt-4" style={{ color: "#bbb" }}>
                            Auto-refreshes every 30 seconds · Powered by Delhivery
                        </p>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
