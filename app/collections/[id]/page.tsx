"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { useCart } from "@/lib/cartContext";

/* ── Sizes ──────────────────────────────────────────────────────────────── */

const sizes = ["2.2", "2.4", "2.6", "2.8"];

/* ── Mock reviews ───────────────────────────────────────────────────────── */

const reviews = [
    {
        id: 1,
        name: "Eleanor R.",
        date: "Oct 12, 2023",
        rating: 5,
        title: "Simply Breathtaking",
        comment:
            "The craftsmanship is even more impressive in person. It catches the light so beautifully. I wore it for my anniversary dinner and received so many compliments.",
        verified: true,
    },
    {
        id: 2,
        name: "Amara K.",
        date: "Aug 15, 2023",
        rating: 5,
        title: "Exquisite Detail",
        comment:
            "The 22k gold has such a rich, warm glow. The sizing was perfect according to the guide. Shipping was fast and the packaging was luxury grade.",
        verified: true,
    },
    {
        id: 3,
        name: "Lila H.",
        date: "Jun 21, 2023",
        rating: 5,
        title: "Worth Every Penny",
        comment:
            "Investment piece that I'll pass down to my daughter. The weight feels substantial but comfortable.",
        verified: true,
    },
    {
        id: 4,
        name: "Sophia L.",
        date: "Sep 28, 2023",
        rating: 5,
        title: "Modern Classic",
        comment:
            "I love the minimalist aesthetic. It's sophisticated enough for gala events but simple enough for daily wear. The ethical diamond sourcing was very important to me.",
        verified: true,
    },
    {
        id: 5,
        name: "James M.",
        date: "Jul 02, 2023",
        rating: 5,
        title: "Perfection",
        comment:
            "Exactly what I was looking for. Elegant, sleek, and timeless.",
        verified: true,
    },
];

const avgRating = 4.9;
const totalReviews = 42;

/* Rating distribution */
const ratingBars = [
    { stars: 5, count: 38, pct: 90 },
    { stars: 4, count: 3, pct: 7 },
    { stars: 3, count: 1, pct: 3 },
    { stars: 2, count: 0, pct: 0 },
    { stars: 1, count: 0, pct: 0 },
];

/* ── Star component ─────────────────────────────────────────────────────── */

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(rating) ? "#c9a84c" : "none"}
                    stroke="#c9a84c"
                    strokeWidth={1.5}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */

export default function ProductDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const product = getProductById(id);
    const related = getRelatedProducts(id, 4);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("2.4");
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [careOpen, setCareOpen] = useState(false);
    const [added, setAdded] = useState(false);
    const [wishlist, setWishlist] = useState(false);
    const { addItem } = useCart();
    const router = useRouter();

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center py-20">
                        <p className="text-2xl font-semibold mb-4" style={{ color: "#1a1a1a" }}>
                            Product not found
                        </p>
                        <Link href="/collections" className="text-sm underline" style={{ color: "#c9a84c" }}>
                            ← Back to Collections
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const originalPrice = Math.round(product.priceNum * 1.15);
    const activeThumb = product.thumbs[activeImage] ?? product.mainImage;

    return (
        <div className="flex flex-col min-h-screen" style={{ background: "#faf9f6" }}>
            <Navbar />

            <main className="flex-1 w-full">
                {/* ── Breadcrumb ── */}
                <div className="w-full max-w-7xl mx-auto px-6 md:px-10 pt-5 pb-2">
                    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]" style={{ color: "#999" }}>
                        <Link href="/" className="hover:text-[#c9a84c] transition-colors">Home</Link>
                        <span>›</span>
                        <Link href="/collections" className="hover:text-[#c9a84c] transition-colors">Collections</Link>
                        <span>›</span>
                        <span style={{ color: "#c9a84c" }}>{product.name}</span>
                    </nav>
                </div>

                {/* ═══ PRODUCT SECTION ═══ */}
                <section className="w-full max-w-7xl mx-auto px-6 md:px-10 pt-4 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                        {/* ── LEFT: Gallery ── */}
                        <div className="flex gap-4">
                            {/* Thumbnail strip */}
                            <div className="hidden md:flex flex-col gap-3" style={{ width: 64 }}>
                                {product.thumbs.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className="relative rounded-md overflow-hidden transition-all duration-200 cursor-pointer"
                                        style={{
                                            width: 64,
                                            height: 64,
                                            border: activeImage === i
                                                ? "2px solid #c9a84c"
                                                : "1px solid #e0d5c5",
                                            background: "#f5ede0",
                                        }}
                                    >
                                        <Image
                                            src={src}
                                            alt={`View ${i + 1}`}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            sizes="64px"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Main image */}
                            <div className="flex-1 relative rounded-xl overflow-hidden" style={{ background: "#f0e8d8", aspectRatio: "4/5" }}>
                                {/* NEW badge */}
                                <div
                                    className="absolute top-4 right-4 z-10 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md"
                                    style={{ background: "#c9a84c", color: "#fff" }}
                                >
                                    New
                                </div>

                                <Image
                                    src={activeThumb}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: "contain" }}
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />

                                {/* Try in 3D button */}
                                <button
                                    className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all hover:shadow-lg cursor-pointer"
                                    style={{ background: "#fff", color: "#1a1a1a", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    Try in 3D
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT: Product Info ── */}
                        <div className="flex flex-col pt-2">
                            {/* Name */}
                            <h1
                                className="text-3xl md:text-[2.5rem] mb-3 leading-tight"
                                style={{
                                    fontFamily: "var(--font-cormorant), Georgia, serif",
                                    color: "#1a1a1a",
                                    fontWeight: 500,
                                    fontStyle: "italic",
                                }}
                            >
                                {product.name}
                            </h1>

                            {/* Price + rating */}
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-xl font-bold" style={{ color: "#c9a84c" }}>
                                    {product.price}
                                </span>
                                <span
                                    className="text-sm line-through"
                                    style={{ color: "#aaa" }}
                                >
                                    ₹{originalPrice.toLocaleString("en-IN")}
                                </span>
                                <div className="flex items-center gap-2 ml-2">
                                    <Stars rating={avgRating} size={12} />
                                    <Link
                                        href="#reviews"
                                        className="text-[11px] underline"
                                        style={{ color: "#c9a84c" }}
                                    >
                                        {totalReviews} Reviews
                                    </Link>
                                </div>
                            </div>

                            {/* Tagline */}
                            <p
                                className="text-sm mb-4"
                                style={{
                                    fontFamily: "var(--font-cormorant), Georgia, serif",
                                    fontStyle: "italic",
                                    color: "#888",
                                }}
                            >
                                "Grace in every circle."
                            </p>

                            {/* Description */}
                            <p className="text-[13px] leading-relaxed mb-7" style={{ color: "#555" }}>
                                {product.description}
                            </p>

                            {/* Size selector */}
                            <div className="mb-7">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "#1a1a1a" }}>
                                        Select Size
                                    </span>
                                    <button className="text-[10px] font-semibold underline decoration-dotted" style={{ color: "#c9a84c" }}>
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    {sizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className="flex-1 py-3 rounded-md text-sm font-semibold transition-all cursor-pointer"
                                            style={{
                                                border: selectedSize === s
                                                    ? "2px solid #c9a84c"
                                                    : "1px solid #e0d5c5",
                                                background: selectedSize === s ? "#fffbf2" : "#fff",
                                                color: selectedSize === s ? "#c9a84c" : "#555",
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
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
                                className="w-full py-4 rounded-md text-white text-[13px] font-bold tracking-[0.18em] uppercase flex items-center justify-center gap-2 mb-3 transition-all duration-200 hover:opacity-90 active:scale-[0.99] cursor-pointer"
                                style={{ background: added ? "#5a8a5a" : "#c9a84c" }}
                            >
                                {added ? "✓ Added! Redirecting..." : (
                                    <>
                                        Add to Bag
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* Add to Wishlist */}
                            <button
                                onClick={() => setWishlist(!wishlist)}
                                className="w-full py-3.5 rounded-md text-[13px] font-bold tracking-[0.18em] uppercase mb-6 transition-all duration-200 cursor-pointer"
                                style={{
                                    background: "#fff",
                                    border: `1px solid ${wishlist ? "#c0392b" : "#e0d5c5"}`,
                                    color: wishlist ? "#c0392b" : "#555",
                                }}
                            >
                                {wishlist ? "♥ Added to Wishlist" : "Add to Wishlist"}
                            </button>

                            {/* Trust badges */}
                            <div className="flex items-center gap-6 mb-7" style={{ borderTop: "1px solid #f0e6d0", paddingTop: 18 }}>
                                {[
                                    { icon: "🚚", title: "Free Shipping", desc: "Global delivery included" },
                                    { icon: "💎", title: "Certified", desc: "BIS Hallmarked Gold" },
                                ].map((badge) => (
                                    <div key={badge.title} className="flex items-center gap-2.5">
                                        <span className="text-xl">{badge.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "#1a1a1a" }}>
                                                {badge.title}
                                            </p>
                                            <p className="text-[10px]" style={{ color: "#999" }}>
                                                {badge.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Accordion: Product Details */}
                            <div style={{ borderTop: "1px solid #e8e3db" }}>
                                <button
                                    className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
                                    onClick={() => setDetailsOpen(!detailsOpen)}
                                >
                                    <span
                                        className="text-sm"
                                        style={{
                                            fontFamily: "var(--font-cormorant), Georgia, serif",
                                            fontStyle: "italic",
                                            color: "#1a1a1a",
                                            fontSize: 16,
                                        }}
                                    >
                                        Product Details
                                    </span>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#c9a84c"
                                        strokeWidth={2}
                                        style={{
                                            transition: "transform 0.2s",
                                            transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {detailsOpen && (
                                    <div className="pb-5">
                                        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #e8e3db" }}>
                                            {product.specs.map((spec, i) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between px-4 py-2.5 text-sm"
                                                    style={{
                                                        background: i % 2 === 0 ? "#fff" : "#faf9f6",
                                                        borderBottom: i < product.specs.length - 1 ? "1px solid #f0e6d0" : "none",
                                                    }}
                                                >
                                                    <span style={{ color: "#888" }}>{spec.label}</span>
                                                    <span style={{ color: "#1a1a1a", fontWeight: 600 }}>{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Accordion: Material & Care */}
                            <div style={{ borderTop: "1px solid #e8e3db" }}>
                                <button
                                    className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
                                    onClick={() => setCareOpen(!careOpen)}
                                >
                                    <span
                                        style={{
                                            fontFamily: "var(--font-cormorant), Georgia, serif",
                                            fontStyle: "italic",
                                            color: "#1a1a1a",
                                            fontSize: 16,
                                        }}
                                    >
                                        Material & Care
                                    </span>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#c9a84c"
                                        strokeWidth={2}
                                        style={{
                                            transition: "transform 0.2s",
                                            transform: careOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                {careOpen && (
                                    <div className="pb-5">
                                        <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                                            Store in the provided velvet pouch away from moisture and perfumes. Clean gently with a soft dry cloth. Avoid contact with chemicals, lotions, and water. All materials are ethically sourced. We offer a 30-day hassle-free return policy — items must be returned in their original packaging with the certificate of authenticity.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div style={{ borderTop: "1px solid #e8e3db" }} />
                        </div>
                    </div>
                </section>

                {/* ═══ GUEST REVIEWS ═══ */}
                <section
                    id="reviews"
                    className="w-full"
                    style={{ borderTop: "6px solid #f0ece4", background: "#fff" }}
                >
                    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 md:py-20">
                        {/* Header row */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                            <div>
                                <h2
                                    className="text-3xl md:text-4xl mb-6"
                                    style={{
                                        fontFamily: "var(--font-cormorant), Georgia, serif",
                                        fontStyle: "italic",
                                        color: "#1a1a1a",
                                        fontWeight: 400,
                                    }}
                                >
                                    Guest Reviews
                                </h2>

                                {/* Rating + bar chart */}
                                <div className="flex items-start gap-6">
                                    <div>
                                        <span
                                            className="text-4xl font-bold block"
                                            style={{ color: "#c9a84c", fontFamily: "var(--font-cormorant), Georgia, serif" }}
                                        >
                                            {avgRating}
                                        </span>
                                        <Stars rating={avgRating} size={13} />
                                        <p className="text-[10px] uppercase tracking-[0.12em] mt-1" style={{ color: "#999" }}>
                                            Based on {totalReviews} reviews
                                        </p>
                                    </div>

                                    {/* Bar chart */}
                                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                                        {ratingBars.map((bar) => (
                                            <div key={bar.stars} className="flex items-center gap-2">
                                                <span className="text-[10px] font-semibold w-3 text-right" style={{ color: "#888" }}>
                                                    {bar.stars}
                                                </span>
                                                <div className="flex-1 h-2 rounded-full" style={{ background: "#f0ece4" }}>
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{ width: `${bar.pct}%`, background: "#c9a84c" }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                className="self-start px-6 py-3 rounded-md text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:opacity-85 cursor-pointer"
                                style={{ border: "2px solid #c9a84c", color: "#c9a84c", background: "transparent" }}
                            >
                                Write a Review
                            </button>
                        </div>

                        {/* Review cards — 3-column grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="rounded-lg p-5 flex flex-col transition-all hover:shadow-md"
                                    style={{ border: "1px solid #e8e3db", background: "#faf9f6" }}
                                >
                                    {/* Top row: stars + date */}
                                    <div className="flex items-center justify-between mb-3">
                                        <Stars rating={review.rating} size={12} />
                                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "#aaa" }}>
                                            {review.date}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h4
                                        className="text-[15px] font-semibold mb-2"
                                        style={{
                                            fontFamily: "var(--font-cormorant), Georgia, serif",
                                            fontStyle: "italic",
                                            color: "#1a1a1a",
                                        }}
                                    >
                                        {review.title}
                                    </h4>

                                    {/* Comment */}
                                    <p className="text-[13px] leading-relaxed mb-4 flex-1" style={{ color: "#6b6b6b" }}>
                                        {review.comment}
                                    </p>

                                    {/* Reviewer */}
                                    <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #f0e6d0" }}>
                                        <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "#1a1a1a" }}>
                                            {review.name}
                                        </span>
                                        {review.verified && (
                                            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#c9a84c" }}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c" stroke="none">
                                                    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8z" />
                                                </svg>
                                                Verified Buyer
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View all */}
                        <div className="text-center">
                            <button
                                className="text-[11px] font-bold uppercase tracking-[0.2em] pb-1 transition-colors hover:opacity-70 cursor-pointer"
                                style={{ color: "#1a1a1a", borderBottom: "1px solid #1a1a1a" }}
                            >
                                View All {totalReviews} Reviews
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
