"use client";

import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/data";

export default function CollectionsSection() {
    return (
        <section className="w-full bg-[#FAF9F6] py-16 md:py-20">
            <div className="w-full max-w-6xl mx-auto px-6">
                {/* Heading */}
                <div className="text-center mb-10">
                    <p
                        className="text-[10px] uppercase tracking-[0.3em] mb-4"
                        style={{ color: "#c9a84c" }}
                    >
                        Handcrafted Excellence
                    </p>
                    <h2
                        className="text-[2.4rem] md:text-[3rem] leading-tight mb-3"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            color: "#1A1A1A",
                            fontWeight: 400,
                            fontStyle: "italic",
                        }}
                    >
                        Curated Collections
                    </h2>
                    {/* Gold underline */}
                    <div className="mx-auto mb-4 w-12 h-[2px] bg-[#C9A84C]" />
                    <p
                        className="text-sm max-w-md mx-auto leading-relaxed"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontStyle: "italic",
                            color: "#6b6b6b",
                        }}
                    >
                        Discover our refined selection of artisanal bangles, thoughtfully organized
                        to accompany every chapter of your life.
                    </p>
                </div>

                {/* 2×2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            href={col.href}
                            className="group relative block overflow-hidden rounded-xl no-underline"
                            style={{ height: 380 }}
                        >
                            {/* Background image */}
                            <Image
                                src={col.image}
                                alt={col.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />

                            {/* Dark overlay */}
                            <div
                                className="absolute inset-0 transition-opacity duration-500"
                                style={{
                                    background:
                                        "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)",
                                }}
                            />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-7">
                                <p
                                    className="text-[9px] uppercase tracking-[0.25em] mb-1.5"
                                    style={{ color: "#c9a84c" }}
                                >
                                    {col.tag}
                                </p>
                                <h3
                                    className="text-2xl md:text-3xl"
                                    style={{
                                        fontFamily:
                                            "var(--font-cormorant), Georgia, serif",
                                        color: "#fff",
                                        fontWeight: 400,
                                        fontStyle: "italic",
                                    }}
                                >
                                    {col.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
