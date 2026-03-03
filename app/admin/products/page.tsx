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
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Products</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#888" }}>{products.length} products</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                    style={{ background: "#c9a84c" }}
                >
                    + Add Product
                </Link>
            </div>

            <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                    {["Product", "Category", "Price", "Stock", "Orders", "Reviews", "Actions"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: "1px solid #f9f6f1" }}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 48, height: 48, background: "#f5ede0" }}>
                                                    <Image src={product.mainImage} alt={product.name} fill style={{ objectFit: "cover" }} sizes="48px" />
                                                </div>
                                                <span className="font-semibold" style={{ color: "#1a1a1a" }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs uppercase tracking-wider" style={{ color: "#888" }}>{product.category}</td>
                                        <td className="px-5 py-4 font-bold" style={{ color: "#c9a84c" }}>{product.price}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase"
                                                style={{ background: product.inStock ? "#e8f5e9" : "#fce4ec", color: product.inStock ? "#2e7d32" : "#b71c1c" }}
                                            >
                                                {product.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center font-bold" style={{ color: "#555" }}>{product._count.orderItems}</td>
                                        <td className="px-5 py-4 text-center font-bold" style={{ color: "#555" }}>{product._count.reviews}</td>
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
                                                    style={{ color: "#e74c3c" }}
                                                >
                                                    {deleting === product.id ? "..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && <p className="text-center py-10 text-sm" style={{ color: "#aaa" }}>No products found</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
