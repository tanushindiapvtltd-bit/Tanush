"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { useCart } from "@/lib/cartContext";

export default function ProductDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const product = getProductById(id);
    const related = getRelatedProducts(id, 4);

    const [activeImage, setActiveImage] = useState(product?.mainImage ?? "");
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [shippingOpen, setShippingOpen] = useState(false);
    const [wishlist, setWishlist] = useState(false);
    const [added, setAdded] = useState(false);
    const { addItem } = useCart();
    const router = useRouter();

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen bg-[#fdf8f2]">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-20">
                        <p className="text-2xl text-[#3d1f00] font-semibold mb-4">Product not found</p>
                        <Link
                            href="/collections"
                            className="text-[#c8a045] underline text-base"
                        >
                            ← Back to Collections
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen" style={{ background: "#faf9f6", fontFamily: "'Segoe UI', sans-serif" }}>
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">

                {/* ── Breadcrumb ── */}
                <nav className="text-xs text-[#999] mb-8 flex items-center gap-1.5 flex-wrap">
                    <Link href="/" className="hover:text-[#c8a045] transition-colors">Home</Link>
                    <span>›</span>
                    <Link href="/collections" className="hover:text-[#c8a045] transition-colors">Collections</Link>
                    <span>›</span>
                    <Link href="/collections" className="hover:text-[#c8a045] transition-colors">Bangles</Link>
                    <span>›</span>
                    <span className="text-[#3d1f00] font-medium">{product.name}</span>
                </nav>

                {/* ── Main Product Section ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

                    {/* Left: Image gallery */}
                    <div>
                        {/* Main image */}
                        <div
                            className="relative w-full rounded-xl overflow-hidden mb-4"
                            style={{ height: 480, background: "#f5ede0" }}
                        >
                            {activeImage && (
                                <Image
                                    src={activeImage}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: "contain" }}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            )}
                            {/* "Ethically Sourced" badge */}
                            <div
                                className="absolute bottom-4 left-4 text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                                style={{
                                    background: "rgba(26,10,0,0.65)",
                                    color: "#f5d89a",
                                    letterSpacing: "0.15em",
                                }}
                            >
                                ✦ Handcrafted
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 flex-wrap">
                            {product.thumbs.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(src)}
                                    className="relative rounded-lg overflow-hidden transition-all duration-200"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        border:
                                            activeImage === src
                                                ? "2px solid #c8a045"
                                                : "2px solid #e0d5c5",
                                        background: "#f5ede0",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Image
                                        src={src}
                                        alt={`${product.name} view ${i + 1}`}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product info */}
                    <div className="flex flex-col">

                        {/* Category label */}
                        <p
                            className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
                            style={{ color: "#c8a045" }}
                        >
                            ✦ Handcrafted Elegance
                        </p>

                        {/* Brand logo row */}
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src="/tanush-logo-transparent.png"
                                alt="Tanush"
                                width={120}
                                height={32}
                                style={{ objectFit: "contain" }}
                            />
                        </div>

                        {/* Product name */}
                        <h1
                            className="text-3xl md:text-4xl font-semibold mb-3 leading-tight"
                            style={{ color: "#1a0a00", fontFamily: "Georgia, serif" }}
                        >
                            {product.name}
                        </h1>

                        {/* Price */}
                        <p
                            className="text-2xl font-bold mb-5"
                            style={{ color: "#b84c00" }}
                        >
                            {product.price}
                        </p>

                        {/* Description */}
                        <p className="text-[15px] leading-relaxed mb-6" style={{ color: "#555" }}>
                            {product.description}
                        </p>

                        {/* Specs table */}
                        <div
                            className="rounded-lg overflow-hidden mb-7"
                            style={{ border: "1px solid #e8d5b0" }}
                        >
                            {product.specs.map((spec, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between px-4 py-3 text-sm"
                                    style={{
                                        background: i % 2 === 0 ? "#fff" : "#fdf8f2",
                                        borderBottom:
                                            i < product.specs.length - 1 ? "1px solid #f0e6d0" : "none",
                                    }}
                                >
                                    <span style={{ color: "#888", fontWeight: 500 }}>{spec.label}</span>
                                    <span style={{ color: "#3d1f00", fontWeight: 600 }}>{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Add to Bag */}
                        <button
                            onClick={() => {
                                addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    priceNum: product.priceNum,
                                    image: product.mainImage,
                                    subtitle: product.specs[0]?.value ?? product.category,
                                });
                                setAdded(true);
                                setTimeout(() => router.push("/cart"), 800);
                            }}
                            className="w-full py-4 rounded-lg text-white font-bold text-sm tracking-widest uppercase mb-3 transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
                            style={{ background: added ? "#5a8a5a" : "#c8a045", letterSpacing: "0.15em" }}
                        >
                            {added ? "✓ Added! Redirecting..." : "🛍 Add to Bag"}
                        </button>

                        {/* Wishlist */}
                        <button
                            onClick={() => setWishlist(!wishlist)}
                            className="w-full py-3.5 rounded-lg font-semibold text-sm tracking-widest uppercase mb-7 transition-all duration-200"
                            style={{
                                background: "#fff",
                                border: `2px solid ${wishlist ? "#c0392b" : "#e8d5b0"}`,
                                color: wishlist ? "#c0392b" : "#555",
                                letterSpacing: "0.1em",
                            }}
                        >
                            {wishlist ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
                        </button>

                        {/* Trust badges */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "#fffbf2", border: "1px solid #f0e8d0" }}>
                                <span className="text-lg mt-0.5">🚚</span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3d1f00" }}>Complimentary Shipping</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>Insured delivery on all orders across India</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "#fffbf2", border: "1px solid #f0e8d0" }}>
                                <span className="text-lg mt-0.5">🔄</span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3d1f00" }}>30-Day Returns</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#888" }}>Hassle-free returns for your peace of mind</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── The Details Section ── */}
                <div
                    className="mb-20 mx-auto"
                    style={{ maxWidth: 760 }}
                >
                    <h2
                        className="text-center text-2xl mb-8"
                        style={{ fontFamily: "Georgia, serif", color: "#1a0a00", fontStyle: "italic" }}
                    >
                        The Details
                    </h2>

                    {/* Craftsmanship accordion */}
                    <div style={{ border: "1px solid #e8d5b0", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                        <button
                            className="w-full flex justify-between items-center px-6 py-5 text-left"
                            style={{ background: "#fffbf2" }}
                            onClick={() => setDetailsOpen(!detailsOpen)}
                        >
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3d1f00" }}>
                                Craftsmanship & Origin
                            </span>
                            <span className="text-lg font-light" style={{ color: "#c8a045" }}>
                                {detailsOpen ? "−" : "+"}
                            </span>
                        </button>
                        {detailsOpen && (
                            <div className="px-6 pb-6 pt-2" style={{ background: "#fff" }}>
                                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                                    Each bangle is meticulously handcrafted in our artisan atelier. Our master jewellers spend over 20 hours on every piece — ensuring the finish is polished to a mirror sheen and every stone is set with mathematical precision to maximise light reflection. We only use conflict-free materials sourced through verified processes.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Shipping accordion */}
                    <div style={{ border: "1px solid #e8d5b0", borderRadius: 8, overflow: "hidden" }}>
                        <button
                            className="w-full flex justify-between items-center px-6 py-5 text-left"
                            style={{ background: "#fffbf2" }}
                            onClick={() => setShippingOpen(!shippingOpen)}
                        >
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#3d1f00" }}>
                                Shipping & Returns
                            </span>
                            <span className="text-lg font-light" style={{ color: "#c8a045" }}>
                                {shippingOpen ? "−" : "+"}
                            </span>
                        </button>
                        {shippingOpen && (
                            <div className="px-6 pb-6 pt-2" style={{ background: "#fff" }}>
                                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                                    All orders are dispatched within 2-3 business days with complimentary insured shipping. We offer a 30-day hassle-free return policy — if you are not completely satisfied, simply contact our concierge team. Items must be returned in their original packaging.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── You May Also Like ── */}
                {related.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-end justify-between mb-2">
                            <h2
                                className="text-2xl"
                                style={{ fontFamily: "Georgia, serif", color: "#1a0a00", fontStyle: "italic" }}
                            >
                                You May Also Like
                            </h2>
                            <Link
                                href="/collections"
                                className="text-xs font-bold uppercase tracking-widest transition-colors"
                                style={{ color: "#c8a045", letterSpacing: "0.12em" }}
                            >
                                View All Bangles →
                            </Link>
                        </div>
                        <p className="text-xs mb-6" style={{ color: "#999" }}>
                            Curated selections to complete your look
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {related.map((rel) => (
                                <RelatedCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

// ── Related product card ─────────────────────────────────────────────────────

function RelatedCard({ product }: { product: { id: number; name: string; price: string; mainImage: string } }) {
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
                    className="relative w-full rounded-lg overflow-hidden mb-3 transition-shadow duration-200"
                    style={{
                        height: 200,
                        background: "#f5ede0",
                        boxShadow: hovered ? "0 8px 20px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        style={{
                            objectFit: "cover",
                            transition: "transform 0.35s",
                            transform: hovered ? "scale(1.05)" : "scale(1)",
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
