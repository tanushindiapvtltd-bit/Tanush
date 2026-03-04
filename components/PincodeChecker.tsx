"use client";

import { useState } from "react";
import { calculateEDD } from "@/lib/edd";

interface PincodeResult {
    available: boolean;
    cod?: boolean;
    prepaid?: boolean;
    estimatedDays?: number;
    city?: string;
    state?: string;
    reason?: string;
}

interface Props {
    compact?: boolean; // compact = single row inline
}

export default function PincodeChecker({ compact = false }: Props) {
    const [pincode, setPincode] = useState("");
    const [result, setResult] = useState<PincodeResult | null>(null);
    const [loading, setLoading] = useState(false);

    const check = async () => {
        const pin = pincode.trim();
        if (!/^\d{6}$/.test(pin)) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`/api/shipping/pincode-check?pincode=${pin}`);
            setResult(await res.json());
        } catch {
            setResult({ available: false, reason: "Check failed. Try again." });
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <input
                        value={pincode}
                        onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(null); }}
                        onKeyDown={(e) => e.key === "Enter" && check()}
                        maxLength={6}
                        placeholder="Enter pincode"
                        className="flex-1 rounded-lg px-3 py-2 text-sm font-mono outline-none"
                        style={{ border: "1px solid #e0d5c5" }}
                    />
                    <button
                        onClick={check}
                        disabled={loading || pincode.length !== 6}
                        className="px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40"
                        style={{ background: "#f5ede0", color: "#c9a84c" }}
                    >
                        {loading ? "..." : "Check"}
                    </button>
                </div>
                <PincodeResult result={result} />
            </div>
        );
    }

    return (
        <div className="rounded-xl p-4" style={{ background: "#faf9f6", border: "1px solid #e0d5c5" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#888" }}>
                Check Delivery
            </p>
            <div className="flex gap-2 mb-2">
                <input
                    value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setResult(null); }}
                    onKeyDown={(e) => e.key === "Enter" && check()}
                    maxLength={6}
                    placeholder="Enter your pincode"
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-mono outline-none"
                    style={{ border: "1px solid #e0d5c5" }}
                />
                <button
                    onClick={check}
                    disabled={loading || pincode.length !== 6}
                    className="px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ background: "#c9a84c", color: "#fff" }}
                >
                    {loading ? "..." : "Check"}
                </button>
            </div>
            <PincodeResult result={result} />
        </div>
    );
}

function PincodeResult({ result }: { result: PincodeResult | null }) {
    if (!result) return null;

    if (!result.available) {
        return (
            <p className="text-xs font-semibold" style={{ color: "#b71c1c" }}>
                ✗ {result.reason ?? "Delivery not available in your area"}
            </p>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold" style={{ color: "#2e7d32" }}>
                ✓ {result.estimatedDays ? calculateEDD(result.estimatedDays) : "Delivery available"}
                {result.city ? ` · ${result.city}` : ""}
            </p>
            {result.cod && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                    COD Available
                </span>
            )}
            {result.prepaid && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#e3f2fd", color: "#1565c0" }}>
                    Prepaid
                </span>
            )}
        </div>
    );
}
