"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TrackOrderPage() {
    const [awb, setAwb] = useState("");
    const router = useRouter();

    const handleTrack = () => {
        const trimmed = awb.trim();
        if (trimmed) router.push(`/track-order/${encodeURIComponent(trimmed)}`);
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <h1
                        className="text-3xl md:text-4xl text-center mb-2"
                        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}
                    >
                        Track Your Order
                    </h1>
                    <p className="text-sm text-center mb-8" style={{ color: "#888" }}>
                        Enter your Delhivery waybill / AWB number to track your shipment.
                    </p>
                    <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                            AWB / Tracking Number
                        </label>
                        <input
                            value={awb}
                            onChange={(e) => setAwb(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                            placeholder="e.g. 1234567890123"
                            className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none mb-4"
                            style={{ border: "1px solid #e0d5c5" }}
                            autoFocus
                        />
                        <button
                            onClick={handleTrack}
                            disabled={!awb.trim()}
                            className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40"
                            style={{ background: "#c9a84c" }}
                        >
                            Track Shipment
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
