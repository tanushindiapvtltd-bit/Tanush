"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// ── Single image uploader ─────────────────────────────────────────────────

interface ImageUploaderProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    required?: boolean;
}

export function ImageUploader({ label, value, onChange, required }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setError("");
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload/product", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
            onChange(data.url);
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) upload(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
    };

    return (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {label}{required && " *"}
            </label>

            {value ? (
                <div className="flex items-start gap-4">
                    <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: 100, height: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Image src={value} alt="Product image" fill style={{ objectFit: "cover" }} sizes="100px" />
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all hover:opacity-80 cursor-pointer disabled:opacity-50"
                            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)" }}
                        >
                            {uploading ? "Uploading..." : "Change Image"}
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all hover:opacity-80 cursor-pointer"
                            style={{ border: "1px solid rgba(183,28,28,0.15)", background: "rgba(183,28,28,0.12)", color: "#ef5350" }}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl cursor-pointer transition-all"
                    style={{
                        border: "2px dashed rgba(201,168,76,0.25)",
                        background: uploading ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.02)",
                        minHeight: 120,
                        padding: 24,
                    }}
                >
                    {uploading ? (
                        <>
                            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth={1.5}>
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>Click or drag image here</span>
                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>JPG, PNG, WebP up to 10MB</span>
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-xs mt-1.5" style={{ color: "#ef5350" }}>{error}</p>}

            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden" onChange={handleFile} />
        </div>
    );
}

// ── Multi-image thumbnails uploader ────────────────────────────────────────

interface ThumbsUploaderProps {
    label: string;
    values: string[];
    onChange: (urls: string[]) => void;
}

export function ThumbsUploader({ label, values, onChange }: ThumbsUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File) => {
        setError("");
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload/product", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
            onChange([...values, data.url]);
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        e.target.value = "";
    };

    const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

    return (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
            <div className="flex flex-wrap gap-3 items-start">
                {values.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: 80, height: 80, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Image src={url} alt={`Thumb ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="80px" />
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center cursor-pointer"
                            style={{ background: "rgba(0,0,0,0.55)" }}
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {/* Add button */}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                    style={{ width: 80, height: 80, border: "2px dashed rgba(201,168,76,0.25)", background: "rgba(255,255,255,0.02)" }}
                >
                    {uploading ? (
                        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth={2}>
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>Add</span>
                        </>
                    )}
                </button>
            </div>
            {error && <p className="text-xs mt-1.5" style={{ color: "#ef5350" }}>{error}</p>}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden" onChange={handleFiles} />
        </div>
    );
}
