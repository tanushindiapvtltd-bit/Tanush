"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cartContext";

/* ── Category meta ─────────────────────────────────────────────────────── */

const categories = [
    { key: "all", label: "All" },
    { key: "bridal", label: "Bridal" },
    { key: "festive", label: "Festive" },
    { key: "minimal", label: "Minimal & Daily" },
    { key: "traditional", label: "Traditional Ethnic" },
];

/* ── Stars ──────────────────────────────────────────────────────────────── */

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg
                    key={s}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill={s <= Math.round(rating) ? "#c9a84c" : "none"}
                    stroke="#c9a84c"
                    strokeWidth={1.5}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

/* ── Main ───────────────────────────────────────────────────────────────── */

export default function CollectionsPage() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category") ?? "all";
    const [activeCategory, setActiveCategory] = useState(categoryParam);

    const filtered = useMemo(() => {
        if (activeCategory === "all") return products;
        return products.filter((p) => p.categoryKey === activeCategory);
    }, [activeCategory]);

    const activeLabel =
        categories.find((c) => c.key === activeCategory)?.label ?? "All Collections";

    return (
        <div className="flex flex-col min-h-screen w-full" style={{ background: "#faf9f6" }}>
            <Navbar />

            <main className="flex-1 w-full">
                {/* ═══ HERO ═══ */}
                <section className="text-center py-14 md:py-20 px-6">
                    <p
                        className="text-[10px] uppercase tracking-[0.3em] mb-3"
                        style={{ color: "#c9a84c" }}
                    >
                        Handcrafted Excellence
                    </p>
                    <h1
                        className="text-4xl md:text-5xl mb-4 leading-tight"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            color: "#1a1a1a",
                            fontWeight: 400,
                            fontStyle: "italic",
                        }}
                    >
                        {activeCategory === "all" ? "Our Collections" : activeLabel}
                    </h1>
                    <div className="mx-auto w-12 h-[2px] bg-[#c9a84c] mb-4" />
                    <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "#6b6b6b" }}>
                        {activeCategory === "all"
                            ? "Explore our entire range of artisanal bangles."
                            : `Discover our finest ${activeLabel.toLowerCase()} pieces, handcrafted with love.`}
                    </p>
                </section>

                {/* ═══ CATEGORY TABS ═══ */}
                <div className="w-full max-w-6xl mx-auto px-6 mb-10 flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className="px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer"
                            style={{
                                background: activeCategory === cat.key ? "#c9a84c" : "#fff",
                                color: activeCategory === cat.key ? "#fff" : "#555",
                                border: `1px solid ${activeCategory === cat.key ? "#c9a84c" : "#e0d5c5"}`,
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* ═══ PRODUCT GRID ═══ */}
                <section className="w-full max-w-6xl mx-auto px-6 pb-20">
                    {filtered.length === 0 ? (
                        <p className="text-center text-sm py-20" style={{ color: "#999" }}>
                            No products in this category yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

/* ── Product Card ──────────────────────────────────────────────────────── */

function ProductCard({ product }: { product: (typeof products)[0] }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [hovered, setHovered] = useState(false);

    const originalPrice = Math.round(product.priceNum * 1.15);
    const rating = 4.2 + (product.id % 8) * 0.1; // pseudo-rating

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            priceNum: product.priceNum,
            image: product.mainImage,
            subtitle: product.category,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlisted(!wishlisted);
    };

    return (
        <div
            className="group relative rounded-xl overflow-hidden transition-all duration-300"
            style={{
                background: "#fff",
                border: "1px solid #e8e3db",
                boxShadow: hovered ? "0 8px 30px rgba(201,168,76,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <Link href={`/collections/${product.id}`} className="block relative" style={{ aspectRatio: "4/5" }}>
                <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Wishlist button (top-right) */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
                    style={{
                        background: "#fff",
                        border: "1px solid #e8e3db",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={wishlisted ? "#c9a84c" : "none"}
                        stroke="#c9a84c"
                        strokeWidth={2}
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                </button>

                {/* NEW badge */}
                {product.id <= 3 && (
                    <div
                        className="absolute top-3 left-3 z-10 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                        style={{ background: "#c9a84c", color: "#fff" }}
                    >
                        New
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="p-4">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                    <Stars rating={rating} size={11} />
                    <span className="text-[10px]" style={{ color: "#aaa" }}>
                        ({Math.floor(rating * 10)})
                    </span>
                </div>

                {/* Name */}
                <Link href={`/collections/${product.id}`} className="no-underline">
                    <h3
                        className="text-[15px] mb-1.5 leading-snug line-clamp-2 hover:text-[#c9a84c] transition-colors"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontWeight: 600,
                            color: "#1a1a1a",
                        }}
                    >
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>
                        {product.price}
                    </span>
                    <span className="text-xs line-through" style={{ color: "#bbb" }}>
                        ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                        style={{
                            background: added ? "#5a8a5a" : "#c9a84c",
                            color: "#fff",
                            border: "none",
                        }}
                    >
                        {added ? (
                            "✓ Added"
                        ) : (
                            <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                Add to Cart
                            </>
                        )}
                    </button>

                    {/* Show More */}
                    <Link
                        href={`/collections/${product.id}`}
                        className="py-2.5 px-4 rounded-md text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-200 no-underline text-center"
                        style={{
                            background: "#fff",
                            color: "#c9a84c",
                            border: "1px solid #c9a84c",
                        }}
                    >
                        Show More
                    </Link>
                </div>
            </div>
        </div>
    );
}
