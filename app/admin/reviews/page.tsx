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
                <span key={s} style={{ color: s <= rating ? "#e2c975" : "rgba(255,255,255,0.1)" }}>★</span>
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
                    <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Reviews</h1>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{reviews.length} total reviews</p>
                </div>
                <div className="flex gap-2">
                    {(["ALL", "APPROVED", "HIDDEN"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer"
                            style={{
                                background: filter === f
                                    ? "linear-gradient(135deg, #c9a84c, #e2c975)"
                                    : "rgba(255,255,255,0.04)",
                                color: filter === f ? "#0c0c0c" : "rgba(255,255,255,0.4)",
                                border: "1px solid " + (filter === f ? "transparent" : "rgba(255,255,255,0.08)"),
                                boxShadow: filter === f ? "0 2px 10px rgba(201,168,76,0.25)" : "none",
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayed.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-2xl p-5 transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid " + (review.approved ? "rgba(255,255,255,0.06)" : "rgba(183,28,28,0.15)"),
                                opacity: review.approved ? 1 : 0.85,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                e.currentTarget.style.borderColor = review.approved ? "rgba(255,255,255,0.06)" : "rgba(183,28,28,0.15)";
                            }}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                {review.imageUrl && (
                                    <div
                                        className="relative rounded-xl overflow-hidden flex-shrink-0"
                                        style={{ width: 80, height: 80, border: "1px solid rgba(255,255,255,0.06)" }}
                                    >
                                        <Image src={review.imageUrl} alt="Review" fill style={{ objectFit: "cover" }} sizes="80px" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center justify-center rounded-lg text-xs font-bold"
                                                style={{
                                                    width: 32, height: 32,
                                                    background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))",
                                                    color: "#e2c975",
                                                }}
                                            >
                                                {review.user.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{review.user.name}</p>
                                                <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{review.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Stars rating={review.rating} />
                                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                                                {new Date(review.createdAt).toLocaleDateString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#c9a84c" }}>{review.product.name}</p>
                                    {review.title && <p className="font-semibold text-sm mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>{review.title}</p>}
                                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{review.body}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                                    style={{
                                        background: review.approved ? "rgba(46,125,50,0.12)" : "rgba(183,28,28,0.12)",
                                        color: review.approved ? "#81c784" : "#ef5350",
                                        boxShadow: review.approved ? "0 0 8px rgba(46,125,50,0.15)" : "0 0 8px rgba(183,28,28,0.15)",
                                    }}
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
                                    style={{ color: "#ef5350" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {displayed.length === 0 && (
                        <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No reviews found</p>
                    )}
                </div>
            )}
        </div>
    );
}
