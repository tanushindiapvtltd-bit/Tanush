"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Review {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    imageUrl: string | null;
    approved: boolean;
    createdAt: string;
    user: { name: string; email: string };
    product: { name: string };
}

function Stars({ rating }: { rating: number }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ color: s <= rating ? "#c9a84c" : "#ddd" }}>★</span>
            ))}
        </span>
    );
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "APPROVED" | "HIDDEN">("ALL");

    useEffect(() => {
        fetch("/api/admin/reviews")
            .then((r) => r.json())
            .then((data) => setReviews(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const toggleApproval = async (review: Review) => {
        const res = await fetch(`/api/admin/reviews/${review.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approved: !review.approved }),
        });
        if (res.ok) {
            setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, approved: !r.approved } : r));
        }
    };

    const deleteReview = async (id: string) => {
        if (!confirm("Delete this review?")) return;
        await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
        setReviews((prev) => prev.filter((r) => r.id !== id));
    };

    const displayed = reviews.filter((r) => {
        if (filter === "APPROVED") return r.approved;
        if (filter === "HIDDEN") return !r.approved;
        return true;
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Reviews</h1>
                    <p className="text-sm mt-0.5" style={{ color: "#888" }}>{reviews.length} total reviews</p>
                </div>
                <div className="flex gap-2">
                    {(["ALL", "APPROVED", "HIDDEN"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer"
                            style={{
                                background: filter === f ? "#c9a84c" : "#fff",
                                color: filter === f ? "#fff" : "#888",
                                border: "1px solid " + (filter === f ? "#c9a84c" : "#e0d5c5"),
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayed.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-xl p-5"
                            style={{
                                background: "#fff",
                                border: "1px solid " + (review.approved ? "#e8e3db" : "#fce4ec"),
                                opacity: review.approved ? 1 : 0.85,
                            }}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                {review.imageUrl && (
                                    <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 80, height: 80 }}>
                                        <Image src={review.imageUrl} alt="Review" fill style={{ objectFit: "cover" }} sizes="80px" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: "#1a1a1a" }}>{review.user.name}</p>
                                            <p className="text-xs" style={{ color: "#aaa" }}>{review.user.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <Stars rating={review.rating} />
                                            <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#c9a84c" }}>{review.product.name}</p>
                                    {review.title && <p className="font-semibold text-sm mb-1" style={{ color: "#1a1a1a" }}>{review.title}</p>}
                                    <p className="text-sm" style={{ color: "#555" }}>{review.body}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                                    style={{ background: review.approved ? "#e8f5e9" : "#fce4ec", color: review.approved ? "#2e7d32" : "#b71c1c" }}
                                >
                                    {review.approved ? "Approved" : "Hidden"}
                                </span>
                                <button
                                    onClick={() => toggleApproval(review)}
                                    className="text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer"
                                    style={{ color: "#c9a84c" }}
                                >
                                    {review.approved ? "Hide" : "Approve"}
                                </button>
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer"
                                    style={{ color: "#e74c3c" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {displayed.length === 0 && (
                        <p className="text-center py-10 text-sm" style={{ color: "#aaa" }}>No reviews found</p>
                    )}
                </div>
            )}
        </div>
    );
}
