"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  user: { name: string | null };
  product: { id: number; name: string; mainImage: string };
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= rating ? "#C9A84C" : "none"} stroke="#C9A84C" strokeWidth={1.5}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 animate-pulse" style={{ background: "#fff", border: "1px solid #ede8df" }}>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map(i => <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: "#e8e3db" }} />)}
      </div>
      <div className="h-4 rounded mb-2" style={{ background: "#e8e3db", width: "60%" }} />
      <div className="space-y-2 mb-4">
        <div className="h-3 rounded" style={{ background: "#f0ebe2" }} />
        <div className="h-3 rounded" style={{ background: "#f0ebe2", width: "85%" }} />
        <div className="h-3 rounded" style={{ background: "#f0ebe2", width: "70%" }} />
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid #f0ebe2" }}>
        <div className="w-8 h-8 rounded-full" style={{ background: "#e8e3db" }} />
        <div className="space-y-1.5">
          <div className="h-3 rounded" style={{ background: "#e8e3db", width: 80 }} />
          <div className="h-2.5 rounded" style={{ background: "#f0ebe2", width: 60 }} />
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function getInitials(name?: string | null) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ background: "#1a1a1a" }}>
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
        <div className="relative w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] mb-5" style={{ color: "#C9A84C", fontFamily: "inherit" }}>
            Tanush Fine Jewellery
          </p>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}
          >
            What Our Customers Say
          </h1>
          {/* Gold ornamental divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, #C9A84C)" }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#C9A84C">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, #C9A84C)" }} />
          </div>
          <p className="text-base" style={{ color: "#999", fontFamily: "inherit" }}>
            Honest words from those who wear our craft
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-14">

        {/* Stats bar */}
        {!loading && reviews.length > 0 && (
          <div className="rounded-2xl mb-12 overflow-hidden" style={{ background: "#fff", border: "1px solid #ede8df" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Average */}
              <div className="flex flex-col items-center justify-center py-10 px-8" style={{ borderRight: "1px solid #ede8df" }}>
                <p
                  className="text-7xl mb-2 leading-none"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#1a1a1a", fontWeight: 500 }}
                >
                  {avgRating.toFixed(1)}
                </p>
                <StarRating rating={Math.round(avgRating)} size={20} />
                <p className="text-sm mt-3" style={{ color: "#888" }}>
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
              {/* Distribution */}
              <div className="py-8 px-8 flex flex-col justify-center gap-2.5">
                {ratingCounts.map(({ star, count, pct }) => (
                  <button
                    key={star}
                    onClick={() => setFilter(filter === star ? null : star)}
                    className="flex items-center gap-3 group w-full text-left transition-opacity"
                    style={{ opacity: filter && filter !== star ? 0.4 : 1 }}
                  >
                    <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: "#888" }}>{star}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9A84C" className="flex-shrink-0">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f0ebe2" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: "#C9A84C" }}
                      />
                    </div>
                    <span className="text-xs w-6 flex-shrink-0" style={{ color: "#888" }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter pills */}
        {!loading && reviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {[null, 5, 4, 3, 2, 1].map((star) => (
              <button
                key={star ?? "all"}
                onClick={() => setFilter(star)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                style={{
                  border: "1px solid",
                  borderColor: filter === star ? "#C9A84C" : "#e0d5c5",
                  background: filter === star ? "#C9A84C" : "#fff",
                  color: filter === star ? "#fff" : "#4a4a4a",
                }}
              >
                {star === null ? "All Reviews" : `${star} ★`}
              </button>
            ))}
            {filter !== null && (
              <span className="px-3 py-1.5 text-xs" style={{ color: "#aaa" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* No reviews at all CTA */}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-24">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16" style={{ background: "#e0d5c5" }} />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth={1.2}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <div className="h-px w-16" style={{ background: "#e0d5c5" }} />
            </div>
            <h2
              className="text-3xl mb-3"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}
            >
              No Reviews Yet
            </h2>
            <p className="text-sm mb-8" style={{ color: "#888" }}>
              Be the first to share your experience with Tanush jewellery.
            </p>
            <Link
              href="/collections"
              className="inline-block px-8 py-3 text-sm font-semibold uppercase tracking-widest rounded-full transition-opacity hover:opacity-80"
              style={{ background: "#1a1a1a", color: "#faf9f6" }}
            >
              Shop & Review
            </Link>
          </div>
        )}

        {/* Empty filter state */}
        {!loading && reviews.length > 0 && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#999" }}>
              No {filter}★ reviews yet
            </p>
            <button onClick={() => setFilter(null)} className="text-sm underline underline-offset-4 cursor-pointer" style={{ color: "#C9A84C" }}>
              Show all reviews
            </button>
          </div>
        )}

        {/* Review grid — masonry via CSS columns */}
        {!loading && filtered.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {filtered.map((review) => (
              <div
                key={review.id}
                className="break-inside-avoid mb-6 rounded-2xl overflow-hidden"
                style={{ background: "#fff", border: "1px solid #ede8df" }}
              >
                {/* Review image */}
                {review.imageUrl && (
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={review.imageUrl}
                      alt="Customer review photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.08))" }} />
                  </div>
                )}

                <div className="p-6">
                  {/* Stars */}
                  <StarRating rating={review.rating} />

                  {/* Title */}
                  {review.title && (
                    <h3 className="mt-3 text-base font-semibold leading-snug" style={{ color: "#1a1a1a" }}>
                      {review.title}
                    </h3>
                  )}

                  {/* Body */}
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
                    {review.body}
                  </p>

                  {/* Product reference */}
                  <Link
                    href={`/collections/${review.product.id}`}
                    className="mt-4 flex items-center gap-2.5 group w-fit"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#f5ede0" }}>
                      <Image
                        src={review.product.mainImage}
                        alt={review.product.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className="text-xs group-hover:underline underline-offset-2 truncate max-w-[160px]"
                      style={{ color: "#C9A84C" }}
                    >
                      {review.product.name}
                    </span>
                  </Link>

                  {/* Footer: author + date */}
                  <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid #f0ebe2" }}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: "#C9A84C" }}
                      >
                        {getInitials(review.user.name)}
                      </div>
                      <span className="text-xs font-medium" style={{ color: "#1a1a1a" }}>
                        {review.user.name ?? "Anonymous"}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: "#bbb" }}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
