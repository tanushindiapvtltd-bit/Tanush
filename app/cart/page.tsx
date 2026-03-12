"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/lib/cartContext";
import { useToast } from "@/lib/toastContext";

const TAX_RATE = 0.03; // 3% (matches checkout)

interface SuggestedProduct { id: number; name: string; price: string; mainImage: string; }

export default function CartPage() {
    const { items, removeItem, updateQty, subtotal } = useCart();
    const { showToast } = useToast();
    const shipping = 0; // complimentary
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);
    useEffect(() => {
        fetch("/api/products")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const cartIds = new Set(items.map((i) => i.id));
                    setSuggestions(data.filter((p: SuggestedProduct) => !cartIds.has(p.id)).slice(0, 4));
                }
            })
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col min-h-screen" style={{ background: "#faf9f6", fontFamily: "'Segoe UI', sans-serif" }}>
            <Navbar />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-10">

                {/* Breadcrumb */}
                <p className="text-xs text-[#999] mb-6 uppercase tracking-widest">
                    <Link href="/" className="hover:text-[#c8a045] transition-colors">Home</Link>
                    <span className="mx-2">›</span>
                    Shopping Bag
                </p>

                <h1
                    className="text-3xl md:text-4xl mb-8"
                    style={{ fontFamily: "Georgia, serif", color: "#1a0a00", fontStyle: "italic" }}
                >
                    Your Shopping Bag
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-lg text-[#888] mb-6">Your bag is empty.</p>
                        <Link
                            href="/collections"
                            className="inline-block px-8 py-4 text-white text-sm font-bold uppercase tracking-widest rounded-lg transition-all hover:opacity-90"
                            style={{ background: "#c8a045" }}
                        >
                            Browse Collections
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* ── Left: Cart items ── */}
                        <div className="flex-1">
                            {items.map((item, idx) => (
                                <CartRow
                                    key={item.id}
                                    item={item}
                                    onRemove={() => { removeItem(item.id); showToast({ type: "error", message: "Removed from Bag", subMessage: item.name }); }}
                                    onQtyChange={(qty) => updateQty(item.id, qty)}
                                    isLast={idx === items.length - 1}
                                />
                            ))}
                        </div>

                        {/* ── Right: Order summary ── */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <div
                                className="rounded-xl p-6"
                                style={{ background: "#fff", border: "1px solid #e8d5b0" }}
                            >
                                <h2
                                    className="text-xl mb-6 pb-4"
                                    style={{
                                        fontFamily: "Georgia, serif",
                                        color: "#1a0a00",
                                        borderBottom: "1px solid #f0e6d0",
                                    }}
                                >
                                    Order Summary
                                </h2>

                                <div className="flex flex-col gap-3 mb-6">
                                    <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
                                    <SummaryRow
                                        label="Shipping"
                                        value="COMPLIMENTARY"
                                        valueStyle={{ color: "#c8a045", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em" }}
                                    />
                                    <SummaryRow label="Tax (3%)" value={`₹${tax.toLocaleString("en-IN")}`} />
                                </div>

                                <div
                                    className="flex justify-between items-center py-4 mb-6"
                                    style={{ borderTop: "1px solid #f0e6d0" }}
                                >
                                    <span className="text-base font-bold" style={{ color: "#1a0a00", fontFamily: "Georgia, serif" }}>
                                        Total
                                    </span>
                                    <span className="text-base font-bold" style={{ color: "#b84c00" }}>
                                        ₹{total.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full py-4 rounded-lg text-white font-bold text-sm uppercase tracking-widest mb-4 transition-all hover:opacity-90 text-center"
                                    style={{ background: "#1a0a00", letterSpacing: "0.12em" }}
                                >
                                    Proceed to Checkout
                                </Link>

                                {/* Secure badge */}
                                <p className="text-center text-[11px] mb-5" style={{ color: "#aaa" }}>
                                    🔒 Secure checkout powered by Razorpay
                                </p>

                                {/* Trust notes */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-base">🚚</span>
                                        <p className="text-xs leading-relaxed" style={{ color: "#666" }}>
                                            Free priority shipping on all orders with signature confirmation.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-base">✨</span>
                                        <p className="text-xs leading-relaxed" style={{ color: "#666" }}>
                                            Ethically sourced materials in eco-friendly packaging.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── You May Also Like ── */}
                {suggestions.length > 0 && (
                    <div className="mt-20 mb-8">
                        <div className="flex items-end justify-between mb-2">
                            <h2
                                className="text-2xl"
                                style={{ fontFamily: "Georgia, serif", color: "#1a0a00", fontStyle: "italic" }}
                            >
                                You May Also Like
                            </h2>
                            <Link
                                href="/collections"
                                className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "#c8a045" }}
                            >
                                View All Collections →
                            </Link>
                        </div>
                        <p className="text-xs mb-6" style={{ color: "#999" }}>
                            Curated selections to complete your look
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {suggestions.map((p) => (
                                <SuggestedCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

// ── Cart row ─────────────────────────────────────────────────────────────────

function CartRow({
    item,
    onRemove,
    onQtyChange,
    isLast,
}: {
    item: { id: number; name: string; price: string; priceNum: number; image: string; subtitle: string; quantity: number };
    onRemove: () => void;
    onQtyChange: (qty: number) => void;
    isLast: boolean;
}) {
    return (
        <div
            className="flex gap-5 py-6"
            style={{ borderBottom: isLast ? "none" : "1px solid #f0e6d0" }}
        >
            {/* Image */}
            <div
                className="relative rounded-lg overflow-hidden flex-shrink-0"
                style={{ width: 100, height: 100, background: "#f5ede0" }}
            >
                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="100px" />
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-[15px] mb-0.5" style={{ color: "#1a0a00" }}>
                            {item.name}
                        </p>
                        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#999" }}>
                            {item.subtitle}
                        </p>
                    </div>
                    <p className="font-bold text-base" style={{ color: "#b84c00" }}>
                        {item.price}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    {/* Quantity control */}
                    <div
                        className="flex items-center gap-3 px-3 py-1 rounded-lg"
                        style={{ border: "1px solid #e8d5b0", background: "#fff" }}
                    >
                        <button
                            onClick={() => onQtyChange(item.quantity - 1)}
                            className="text-base font-medium w-4 text-center transition-colors hover:text-[#c8a045]"
                            style={{ color: "#555" }}
                        >
                            −
                        </button>
                        <span className="text-sm font-semibold w-4 text-center" style={{ color: "#1a0a00" }}>
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onQtyChange(item.quantity + 1)}
                            className="text-base font-medium w-4 text-center transition-colors hover:text-[#c8a045]"
                            style={{ color: "#555" }}
                        >
                            +
                        </button>
                    </div>

                    {/* Remove */}
                    <button
                        onClick={onRemove}
                        className="text-xs uppercase tracking-wider transition-colors hover:text-[#c0392b]"
                        style={{ color: "#aaa" }}
                    >
                        × Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({
    label,
    value,
    valueStyle,
}: {
    label: string;
    value: string;
    valueStyle?: React.CSSProperties;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider" style={{ color: "#888" }}>
                {label}
            </span>
            <span className="text-sm font-semibold" style={{ color: "#1a0a00", ...valueStyle }}>
                {value}
            </span>
        </div>
    );
}

// ── Suggested product card ────────────────────────────────────────────────────

function SuggestedCard({ product }: { product: { id: number; name: string; price: string; mainImage: string } }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Link
            href={`/collections/${product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="cursor-pointer">
                <div
                    className="relative w-full rounded-lg overflow-hidden mb-3"
                    style={{
                        height: 180,
                        background: "#f5ede0",
                        boxShadow: hovered ? "0 8px 20px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
                        transition: "box-shadow 0.2s",
                    }}
                >
                    <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        style={{
                            objectFit: "cover",
                            transform: hovered ? "scale(1.05)" : "scale(1)",
                            transition: "transform 0.35s",
                        }}
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </div>
                <p className="text-sm font-semibold leading-snug mb-1" style={{ color: "#3d1f00" }}>
                    {product.name}
                </p>
                <p className="text-sm font-bold" style={{ color: "#b84c00" }}>
                    {product.price}
                </p>
            </div>
        </Link>
    );
}
