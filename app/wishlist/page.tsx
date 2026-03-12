"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import { useToast } from "@/lib/toastContext";

interface WishlistProduct {
    id: string;
    productId: number;
    product: {
        id: number;
        name: string;
        price: string;
        priceNum: number;
        category: string;
        mainImage: string;
    };
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { toggle } = useWishlist();
    const { showToast } = useToast();

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/wishlist");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWishlist(); }, []);

    const handleRemove = async (productId: number, productName: string) => {
        await toggle(productId);
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        showToast({ type: "wishlist-remove", message: "Removed from Wishlist", subMessage: productName });
    };

    const handleAddToCart = (item: WishlistProduct) => {
        addItem({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            priceNum: item.product.priceNum,
            image: item.product.mainImage,
            subtitle: item.product.category,
        });
        showToast({ type: "cart", message: "Added to Cart", subMessage: item.product.name });
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-10">
                <h1
                    className="text-3xl md:text-4xl mb-2"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}
                >
                    My Wishlist
                </h1>
                {!loading && (
                    <p className="text-sm mb-8" style={{ color: "#999" }}>
                        {items.length} saved item{items.length !== 1 ? "s" : ""}
                    </p>
                )}

                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4" style={{ color: "#e0d5c5" }}>♡</div>
                        <p className="text-lg italic mb-2" style={{ color: "#999", fontFamily: "var(--font-cormorant), serif" }}>
                            Your wishlist is empty
                        </p>
                        <p className="text-sm mb-6" style={{ color: "#aaa" }}>Save pieces you love by clicking the heart icon</p>
                        <Link
                            href="/collections"
                            className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-lg text-white hover:opacity-90 transition-opacity"
                            style={{ background: "#c9a84c" }}
                        >
                            Browse Collections
                        </Link>
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="group relative">
                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemove(item.productId, item.product.name)}
                                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                                    style={{ background: "rgba(255,255,255,0.9)", color: "#e05252" }}
                                    title="Remove from wishlist"
                                >
                                    ✕
                                </button>

                                <Link href={`/collections/${item.product.id}`}>
                                    <div className="rounded-xl overflow-hidden aspect-square relative mb-3" style={{ background: "#f5ede0" }}>
                                        <Image
                                            src={item.product.mainImage}
                                            alt={item.product.name}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            className="group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#999" }}>
                                        {item.product.category}
                                    </p>
                                    <p className="text-sm font-semibold leading-snug" style={{ color: "#1a1a1a" }}>
                                        {item.product.name}
                                    </p>
                                    <p className="text-sm font-bold mt-1" style={{ color: "#c9a84c" }}>
                                        {item.product.price}
                                    </p>
                                </Link>

                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="w-full mt-3 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:opacity-90 cursor-pointer"
                                    style={{ background: "#1a1a1a", color: "#fff" }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
