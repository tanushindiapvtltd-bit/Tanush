"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products } from "@/lib/products";
import type { Product } from "@/lib/products";

type CategoryKey = "all" | "bridal" | "traditional" | "minimal" | "festive";

const categories: { key: CategoryKey; label: string; icon: string }[] = [
    { key: "all", label: "All Collections", icon: "" },
    { key: "bridal", label: "Bridal", icon: "💍" },
    { key: "traditional", label: "Traditional & Ethnic", icon: "🪬" },
    { key: "minimal", label: "Minimal & Daily", icon: "🌿" },
    { key: "festive", label: "Festive", icon: "🪔" },
];

const sectionConfig: {
    key: string;
    title: string;
    icon: string;
    subtitle: string;
}[] = [
        {
            key: "bridal",
            title: "Bridal Bangles",
            icon: "💍",
            subtitle: "Exquisite gold-plated sets crafted for your most special day",
        },
        {
            key: "traditional",
            title: "Traditional & Ethnic Bangles",
            icon: "🪬",
            subtitle: "Classic designs rooted in rich Indian heritage",
        },
        {
            key: "minimal",
            title: "Minimal & Daily Wear",
            icon: "🌿",
            subtitle: "Lightweight, elegant pieces for everyday grace",
        },
        {
            key: "festive",
            title: "Festive Bangles",
            icon: "🪔",
            subtitle: "Celebrate every occasion in style",
        },
    ];

export default function CollectionsPage() {
    const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");

    const isSectionVisible = (sectionKey: string) =>
        activeCategory === "all" || activeCategory === sectionKey;

    const sectionProducts = (key: string) =>
        products.filter((p) => p.categoryKey === key);

    return (
        <div
            className="flex flex-col min-h-screen w-full"
            style={{
                background: "#fdf8f2",
                fontFamily: "'Segoe UI', sans-serif",
                color: "#333",
            }}
        >
            <Navbar />

            {/* ── HEADER ── */}
            <header
                style={{
                    background: "linear-gradient(135deg, #1a0a00, #3d1f00)",
                    color: "#f5d89a",
                    textAlign: "center",
                    padding: "36px 20px 28px",
                }}
            >
                <h1
                    style={{
                        fontSize: "2.4rem",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        margin: 0,
                    }}
                >
                    ✦ Bangle Collection ✦
                </h1>
                <p
                    style={{
                        marginTop: "8px",
                        fontSize: "1rem",
                        color: "#d4a55e",
                        letterSpacing: "1.5px",
                    }}
                >
                    Handcrafted Elegance · Timeless Traditions
                </p>
            </header>

            {/* ── FILTER BAR ── */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    padding: "28px 20px 10px",
                    background: "#fff8ee",
                    borderBottom: "2px solid #e8d5b0",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                }}
            >
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        style={{
                            background: activeCategory === cat.key ? "#c8a045" : "#fff",
                            border: "2px solid #c8a045",
                            color: activeCategory === cat.key ? "#fff" : "#7a5c00",
                            padding: "8px 22px",
                            borderRadius: "30px",
                            cursor: "pointer",
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            transition: "all 0.25s",
                        }}
                    >
                        {cat.icon ? `${cat.icon} ` : ""}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ── SECTIONS ── */}
            <main style={{ flex: 1 }}>
                {sectionConfig.map((section) => {
                    if (!isSectionVisible(section.key)) return null;
                    const prods = sectionProducts(section.key);

                    return (
                        <div key={section.key}>
                            <div
                                style={{
                                    maxWidth: 1200,
                                    margin: "40px auto 16px",
                                    padding: "0 20px",
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: "1.6rem",
                                        color: "#5c3400",
                                        borderLeft: "5px solid #c8a045",
                                        paddingLeft: "14px",
                                        letterSpacing: "0.5px",
                                        margin: 0,
                                    }}
                                >
                                    {section.icon} {section.title}
                                </h2>
                                <p
                                    style={{
                                        marginTop: "5px",
                                        paddingLeft: "19px",
                                        fontSize: "0.9rem",
                                        color: "#888",
                                    }}
                                >
                                    {section.subtitle}
                                </p>
                            </div>

                            {prods.length > 0 ? (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill, minmax(230px, 1fr))",
                                        gap: "24px",
                                        maxWidth: 1200,
                                        margin: "0 auto 20px",
                                        padding: "0 20px",
                                    }}
                                >
                                    {prods.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "50px 20px" }}>
                                    <p
                                        style={{
                                            fontSize: "1.1rem",
                                            color: "#aaa",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        🌟 New festive collection coming soon — stay tuned!
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>

            <Footer />
        </div>
    );
}

// ── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={`/collections/${product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: hovered
                        ? "0 8px 24px rgba(0,0,0,0.15)"
                        : "0 2px 12px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.25s, box-shadow 0.25s",
                    transform: hovered ? "translateY(-5px)" : "translateY(0)",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        height: "240px",
                        background: "#f9f0e3",
                    }}
                >
                    <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        style={{
                            objectFit: "cover",
                            transition: "transform 0.35s",
                            transform: hovered ? "scale(1.06)" : "scale(1)",
                        }}
                        sizes="(max-width: 600px) 160px, 230px"
                    />
                    <span
                        style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "rgba(26,10,0,0.75)",
                            color: "#f5d89a",
                            fontSize: "0.72rem",
                            padding: "3px 9px",
                            borderRadius: "20px",
                        }}
                    >
                        {product.thumbs.length} photos
                    </span>
                    <span
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            background: "rgba(200,160,69,0.92)",
                            color: "#fff",
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontWeight: 600,
                            opacity: hovered ? 1 : 0,
                            transition: "opacity 0.25s",
                        }}
                    >
                        View Details
                    </span>
                </div>

                <div style={{ padding: "14px 16px 16px" }}>
                    <p
                        style={{
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            color: "#3d1f00",
                            lineHeight: 1.4,
                            minHeight: "38px",
                            margin: 0,
                        }}
                    >
                        {product.name}
                    </p>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "10px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: "#b84c00",
                            }}
                        >
                            {product.price}
                        </span>
                        <span
                            style={{
                                fontSize: "0.7rem",
                                background: "#fff3dc",
                                color: "#8a6000",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                border: "1px solid #dbb96a",
                                fontWeight: 600,
                            }}
                        >
                            {product.category}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
