"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: number;
    name: string;
    price: string;
    category: string;
    mainImage: string;
    inStock: boolean;
    _count: { reviews: number; orderItems: number };
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setDeleting(id);
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setDeleting(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Products</h1>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{products.length} products</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
                    style={{
                        background: "linear-gradient(135deg, #c9a84c, #e2c975)",
                        color: "#0c0c0c",
                        boxShadow: "0 4px 15px rgba(201,168,76,0.3)",
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Product
                </Link>
            </div>

            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["Product", "Category", "Price", "Stock", "Orders", "Reviews", "Actions"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="transition-colors duration-150"
                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="relative rounded-xl overflow-hidden flex-shrink-0"
                                                    style={{ width: 48, height: 48, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
                                                >
                                                    <Image src={product.mainImage} alt={product.name} fill style={{ objectFit: "cover" }} sizes="48px" />
                                                </div>
                                                <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{product.category}</td>
                                        <td className="px-5 py-4 font-bold" style={{ color: "#e2c975" }}>{product.price}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase"
                                                style={{
                                                    background: product.inStock ? "rgba(46,125,50,0.12)" : "rgba(183,28,28,0.12)",
                                                    color: product.inStock ? "#81c784" : "#ef5350",
                                                    boxShadow: product.inStock ? "0 0 8px rgba(46,125,50,0.15)" : "0 0 8px rgba(183,28,28,0.15)",
                                                }}
                                            >
                                                {product.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{product._count.orderItems}</td>
                                        <td className="px-5 py-4 text-center font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{product._count.reviews}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="text-xs font-semibold hover:opacity-70 transition-opacity"
                                                    style={{ color: "#c9a84c" }}
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deleting === product.id}
                                                    className="text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-50"
                                                    style={{ color: "#ef5350" }}
                                                >
                                                    {deleting === product.id ? "..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No products found</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
