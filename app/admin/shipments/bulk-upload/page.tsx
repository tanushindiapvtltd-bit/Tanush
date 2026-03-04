"use client";

import { useState, useRef } from "react";

interface UploadResult {
    orderNumber: string;
    waybill?: string;
    error?: string;
}

interface UploadResponse {
    total: number;
    successful: number;
    failed: number;
    results: UploadResult[];
}

const CSV_TEMPLATE = `order_number,customer_name,address,city,state,pincode,phone,payment_mode,cod_amount,total_amount,product_desc,weight
TAN-001,John Doe,"123 Main St",Mumbai,Maharashtra,400001,9876543210,Prepaid,,5000,Gold Ring,0.1
TAN-002,Jane Smith,"456 Park Ave",Delhi,Delhi,110001,9876543211,CoD,3000,3000,Silver Necklace,0.2`;

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [response, setResponse] = useState<UploadResponse | null>(null);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        if (!f.name.endsWith(".csv")) { setError("Only CSV files are accepted"); return; }
        setFile(f);
        setResponse(null);
        setError("");
    };

    const upload = async () => {
        if (!file) return;
        setUploading(true);
        setError("");
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/bulk-upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error ?? "Upload failed");
            if (data.details) setError(prev => prev + ": " + data.details.slice(0, 3).join("; "));
        } else {
            setResponse(data);
        }
        setUploading(false);
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "bulk-shipment-template.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const downloadResults = () => {
        if (!response) return;
        const rows = ["order_number,waybill,status,error"];
        for (const r of response.results) {
            rows.push(`${r.orderNumber},${r.waybill ?? ""},${r.waybill ? "success" : "failed"},${r.error ?? ""}`);
        }
        const blob = new Blob([rows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "upload-results.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Bulk Shipment Upload</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#888" }}>Upload a CSV to book multiple Delhivery shipments at once</p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                    style={{ background: "#f5f5f5", color: "#555", border: "1px solid #e0d5c5" }}
                >
                    Download Template
                </button>
            </div>

            {/* Drop zone */}
            <div
                className="rounded-xl p-10 text-center mb-6 cursor-pointer transition-all"
                style={{
                    border: `2px dashed ${dragOver ? "#c9a84c" : "#e0d5c5"}`,
                    background: dragOver ? "#fffbf0" : "#fff",
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
            >
                <p className="text-3xl mb-2">📄</p>
                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                    {file ? file.name : "Drag & drop CSV here, or click to browse"}
                </p>
                {file && <p className="text-xs mt-1" style={{ color: "#888" }}>{(file.size / 1024).toFixed(1)} KB</p>}
                {!file && <p className="text-xs mt-1" style={{ color: "#aaa" }}>CSV files only</p>}
                <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </div>

            {error && (
                <div className="mb-4 rounded-xl p-4" style={{ background: "#fce4ec", border: "1px solid #f48fb1" }}>
                    <p className="text-sm font-semibold" style={{ color: "#b71c1c" }}>{error}</p>
                </div>
            )}

            <button
                onClick={upload}
                disabled={!file || uploading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer mb-6"
                style={{ background: "#1a1a1a" }}
            >
                {uploading ? "Uploading & Booking..." : "Upload & Book Shipments"}
            </button>

            {/* Results */}
            {response && (
                <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f0e6d0" }}>
                        <div className="flex gap-4">
                            <span className="text-sm"><span className="font-bold" style={{ color: "#2e7d32" }}>{response.successful}</span> <span style={{ color: "#888" }}>successful</span></span>
                            <span className="text-sm"><span className="font-bold" style={{ color: "#b71c1c" }}>{response.failed}</span> <span style={{ color: "#888" }}>failed</span></span>
                            <span className="text-sm"><span className="font-bold">{response.total}</span> <span style={{ color: "#888" }}>total</span></span>
                        </div>
                        <button onClick={downloadResults} className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                            Download Results CSV
                        </button>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                {["Order #", "AWB / Waybill", "Status"].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {response.results.map((r, i) => (
                                <tr key={r.orderNumber} style={{ borderBottom: i < response.results.length - 1 ? "1px solid #f8f4ee" : "none" }}>
                                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: "#c9a84c" }}>{r.orderNumber}</td>
                                    <td className="px-5 py-3 font-mono text-xs" style={{ color: r.waybill ? "#6a1b9a" : "#888" }}>
                                        {r.waybill ?? (r.error ? <span style={{ color: "#b71c1c", fontFamily: "sans-serif" }}>{r.error}</span> : "—")}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                            style={{ background: r.waybill ? "#e8f5e9" : "#fce4ec", color: r.waybill ? "#2e7d32" : "#b71c1c" }}>
                                            {r.waybill ? "Success" : "Failed"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
