"use client";

import { useState } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const cardStyle = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
};

const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 13,
    outline: "none",
    width: "100%",
};

export default function ReportsPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [downloading, setDownloading] = useState<"sales" | "returns" | null>(null);

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    async function download(type: "sales" | "returns") {
        setDownloading(type);
        try {
            const url = `/api/admin/reports/tcs?type=${type}&year=${year}&month=${month}`;
            const res = await fetch(url);
            if (!res.ok) {
                const err = await res.json();
                alert(err.error ?? "Failed to generate report");
                return;
            }
            const blob = await res.blob();
            const filename = type === "sales"
                ? `tcs-sales-${year}-${String(month).padStart(2, "0")}.xlsx`
                : `tcs-sales-return-${year}-${String(month).padStart(2, "0")}.xlsx`;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            a.click();
            URL.revokeObjectURL(a.href);
        } finally {
            setDownloading(null);
        }
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#fff" }}>TCS Reports</h1>
            <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
                Download month-wise TCS Sales and TCS Sales Return Excel reports.
            </p>

            {/* Period selector */}
            <div style={cardStyle} className="p-6 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Select Period
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Month
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            style={inputStyle}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={i + 1} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Year
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            style={inputStyle}
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Selected: {MONTHS[month - 1]} {year}
                </p>
            </div>

            {/* Report cards */}
            <div className="flex flex-col gap-4">
                {/* TCS Sales */}
                <div style={cardStyle} className="p-6 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="flex items-center justify-center rounded-lg"
                                style={{ width: 32, height: 32, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold" style={{ color: "#fff" }}>TCS Sales</span>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            All orders placed in {MONTHS[month - 1]} {year}
                        </p>
                        <p className="text-[11px] mt-1 font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                            tcs-sales-{year}-{String(month).padStart(2, "0")}.xlsx
                        </p>
                    </div>
                    <button
                        onClick={() => download("sales")}
                        disabled={downloading !== null}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 whitespace-nowrap"
                        style={{
                            background: "linear-gradient(135deg, #c9a84c, #e2c975)",
                            color: "#0c0c0c",
                            boxShadow: "0 4px 15px rgba(201,168,76,0.25)",
                            minWidth: 130,
                        }}
                    >
                        {downloading === "sales" ? (
                            <>
                                <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#0c0c0c" }} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download
                            </>
                        )}
                    </button>
                </div>

                {/* TCS Sales Return */}
                <div style={cardStyle} className="p-6 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="flex items-center justify-center rounded-lg"
                                style={{ width: 32, height: 32, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)" }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 14 4 9 9 4" />
                                    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold" style={{ color: "#fff" }}>TCS Sales Return</span>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Return requests raised in {MONTHS[month - 1]} {year}
                        </p>
                        <p className="text-[11px] mt-1 font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                            tcs-sales-return-{year}-{String(month).padStart(2, "0")}.xlsx
                        </p>
                    </div>
                    <button
                        onClick={() => download("returns")}
                        disabled={downloading !== null}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 whitespace-nowrap"
                        style={{
                            background: "rgba(239,83,80,0.12)",
                            color: "#ef5350",
                            border: "1px solid rgba(239,83,80,0.3)",
                            minWidth: 130,
                        }}
                    >
                        {downloading === "returns" ? (
                            <>
                                <div className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(239,83,80,0.2)", borderTopColor: "#ef5350" }} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info box */}
            <div
                className="mt-6 p-4 rounded-xl text-xs"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.3)",
                    lineHeight: 1.7,
                }}
            >
                <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Setup required</p>
                <p>Set these env vars for report metadata: <span className="font-mono" style={{ color: "rgba(201,168,76,0.7)" }}>TCS_IDENTIFIER</span>, <span className="font-mono" style={{ color: "rgba(201,168,76,0.7)" }}>TCS_SUP_NAME</span>, <span className="font-mono" style={{ color: "rgba(201,168,76,0.7)" }}>TCS_GSTIN</span>, <span className="font-mono" style={{ color: "rgba(201,168,76,0.7)" }}>TCS_SUPPLIER_ID</span></p>
                <p className="mt-1">Set <span className="font-mono" style={{ color: "rgba(201,168,76,0.7)" }}>HSN Code</span> and <span className="font-mono" style={{ color: "rgba(201,168,76,0.7)" }}>GST Rate</span> on each product via the Products admin.</p>
            </div>
        </div>
    );
}
