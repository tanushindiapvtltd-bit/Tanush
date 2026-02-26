"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
            } else {
                setSubmitted(true);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-inter">
            {/* Left banner */}
            <div className="hidden lg:flex w-1/2 relative bg-[#f4ebd0] overflow-hidden">
                <Image
                    src="/hero-bangle.png"
                    alt="Tanush Jewelry"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-16 left-12 z-10 text-white">
                    <h2 className="font-cormorant italic text-5xl mb-3 tracking-wide drop-shadow-lg text-[#FAF9F6]">
                        Timeless Elegance
                    </h2>
                    <p className="text-xs tracking-[0.2em] font-medium uppercase text-white/90">
                        The Signature Collection
                    </p>
                </div>
            </div>

            {/* Right form */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 md:px-24 xl:px-32 py-12">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/feather-logo.png"
                            alt="Tanush Logo"
                            width={64}
                            height={64}
                            className="object-contain"
                            priority
                        />
                    </div>

                    {submitted ? (
                        /* Success state */
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Check Your Email</h1>
                            <p className="text-[#6b6b6b] text-sm leading-relaxed mb-8">
                                If an account exists for <span className="font-semibold text-[#1a1a1a]">{email}</span>, you will receive a password reset link shortly. Check your spam folder if it doesn&apos;t arrive.
                            </p>
                            <Link
                                href="/sign-in"
                                className="text-sm font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors"
                            >
                                ← Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        /* Form state */
                        <>
                            <div className="text-center mb-10">
                                <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Forgot Password?</h1>
                                <p className="text-[#6b6b6b] text-sm leading-relaxed">
                                    Enter the email address linked to your account and we&apos;ll send you a reset link.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 text-center">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold text-[#1a1a1a] mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3.5 bg-[#faf9f6]/50 border border-[#e8e3db] rounded text-sm text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#c9a84c] hover:bg-[#b8972a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded text-sm tracking-widest uppercase transition-colors"
                                >
                                    {loading ? "SENDING…" : "SEND RESET LINK"}
                                </button>
                            </form>

                            <p className="text-center mt-8 text-sm text-[#6b6b6b]">
                                Remembered your password?{" "}
                                <Link href="/sign-in" className="font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
