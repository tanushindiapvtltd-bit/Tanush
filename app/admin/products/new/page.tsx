"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader, ThumbsUploader } from "@/components/admin/ProductImageUpload";

interface Spec {
    label: string;
    value: string;
}

const inputCls = "w-full rounded-lg px-4 py-2.5 text-sm outline-none";
const inputStyle = { border: "1px solid #e0d5c5", background: "#fff" };

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [priceNum, setPriceNum] = useState("");
    const [category, setCategory] = useState("Bridal");
    const [categoryKey, setCategoryKey] = useState("bridal");
    const [mainImage, setMainImage] = useState("");
    const [thumbs, setThumbs] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [inStock, setInStock] = useState(true);
    const [specs, setSpecs] = useState<Spec[]>([{ label: "", value: "" }]);

    const categories = [
        { label: "Bridal", key: "bridal" },
        { label: "Traditional & Ethnic", key: "traditional" },
        { label: "Minimal & Daily", key: "minimal" },
    ];

    const handleCategoryChange = (key: string) => {
        const cat = categories.find((c) => c.key === key);
        if (cat) { setCategoryKey(cat.key); setCategory(cat.label); }
    };

    const addSpec = () => setSpecs((prev) => [...prev, { label: "", value: "" }]);
    const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));
    const updateSpec = (i: number, field: "label" | "value", val: string) => {
        setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainImage) { setError("Please upload a main product image."); return; }
        setError("");
        setSaving(true);
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, price, priceNum: parseInt(priceNum), category, categoryKey,
                    mainImage, thumbs, description,
                    specs: specs.filter((s) => s.label && s.value),
                    inStock,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Failed to create product");
                return;
            }
            router.push("/admin/products");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Link href="/admin/products" className="text-xs font-semibold uppercase tracking-widest hover:opacity-70 mb-6 inline-block" style={{ color: "#c9a84c" }}>
                ← Products
            </Link>
            <h1 className="text-2xl font-bold mb-8" style={{ color: "#1a1a1a" }}>Add New Product</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Product Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Gold Tone Bangle Set" className={inputCls} style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Price Display</label>
                        <input value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="₹599" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Price (₹ numeric)</label>
                        <input type="number" value={priceNum} onChange={(e) => setPriceNum(e.target.value)} required placeholder="599" min="1" className={inputCls} style={inputStyle} />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Category</label>
                    <select value={categoryKey} onChange={(e) => handleCategoryChange(e.target.value)} className={inputCls} style={inputStyle}>
                        {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                </div>

                <ImageUploader
                    label="Main Product Image"
                    value={mainImage}
                    onChange={setMainImage}
                    required
                />

                <ThumbsUploader
                    label="Gallery Thumbnails"
                    values={thumbs}
                    onChange={setThumbs}
                />

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Product description..." className={inputCls} style={inputStyle} />
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#888" }}>Specifications</p>
                    {specs.map((spec, i) => (
                        <div key={i} className="flex gap-3 mb-2 items-center">
                            <input value={spec.label} onChange={(e) => updateSpec(i, "label", e.target.value)}
                                placeholder="Label (e.g. Material)" className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                            <input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                                placeholder="Value (e.g. Gold Plated)" className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                            <button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 cursor-pointer text-lg leading-none">✕</button>
                        </div>
                    ))}
                    <button type="button" onClick={addSpec} className="text-xs font-semibold mt-1 cursor-pointer hover:opacity-70" style={{ color: "#c9a84c" }}>
                        + Add Spec
                    </button>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="cursor-pointer w-4 h-4" />
                    <span className="text-sm" style={{ color: "#555" }}>In Stock</span>
                </label>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving}
                        className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        style={{ background: "#c9a84c" }}>
                        {saving ? "Saving..." : "Create Product"}
                    </button>
                    <Link href="/admin/products" className="px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "#888" }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
