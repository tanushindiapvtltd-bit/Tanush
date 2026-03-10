"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Suspense } from "react";

interface Product {
    id: number;
    name: string;
    price: string;
    priceNum: number;
    category: string;
    mainImage: string;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQ = searchParams.get("q") ?? "";

    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim() || q.length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialQ) doSearch(initialQ);
    }, [initialQ, doSearch]);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
                <h1
                    className="text-3xl md:text-4xl mb-10"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}
                >
                    Search
                </h1>

                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                )}

                {!loading && searched && results.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-lg" style={{ color: "#999", fontFamily: "var(--font-cormorant), serif", fontStyle: "italic" }}>
                            No results found for &ldquo;{initialQ}&rdquo;
                        </p>
                        <p className="text-sm mt-2" style={{ color: "#aaa" }}>
                            Try different keywords or browse our collections
                        </p>
                        <Link
                            href="/collections"
                            className="inline-block mt-6 px-6 py-3 text-sm font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-90"
                            style={{ background: "#1a1a1a", color: "#fff" }}
                        >
                            Browse Collections
                        </Link>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        <p className="text-sm mb-6" style={{ color: "#888" }}>
                            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{initialQ}&rdquo;
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map((product) => (
                                <Link key={product.id} href={`/collections/${product.id}`} className="group">
                                    <div className="rounded-xl overflow-hidden aspect-square relative mb-3" style={{ background: "#f5ede0" }}>
                                        <Image
                                            src={product.mainImage}
                                            alt={product.name}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            className="group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#999" }}>
                                        {product.category}
                                    </p>
                                    <p className="text-sm font-semibold leading-snug" style={{ color: "#1a1a1a" }}>
                                        {product.name}
                                    </p>
                                    <p className="text-sm font-bold mt-1" style={{ color: "#c9a84c" }}>
                                        {product.price}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {!searched && (
                    <div className="text-center py-16">
                        <p style={{ color: "#c9a84c", fontSize: 40 }}>✦</p>
                        <p className="mt-4 text-base" style={{ color: "#999", fontFamily: "var(--font-cormorant), serif", fontStyle: "italic" }}>
                            Search for bangles by name, style or collection
                        </p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense>
            <SearchContent />
        </Suspense>
    );
}
