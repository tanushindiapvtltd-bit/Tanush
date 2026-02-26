"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-[#6b6b6b] text-sm mb-6">Invalid or missing reset link.</p>
                <Link href="/forgot-password" className="font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors text-sm">
                    Request a new link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
            } else {
                setSuccess(true);
                setTimeout(() => router.push("/sign-in"), 3000);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Password Updated</h1>
                <p className="text-[#6b6b6b] text-sm mb-4">
                    Your password has been reset successfully. Redirecting you to sign in…
                </p>
                <Link href="/sign-in" className="font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors text-sm">
                    Sign In now →
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-10">
                <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Set New Password</h1>
                <p className="text-[#6b6b6b] text-sm">Choose a strong password for your account.</p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 text-center">
                    {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-[#1a1a1a] mb-2">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 bg-[#faf9f6]/50 border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#1a1a1a] mb-2">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 bg-[#faf9f6]/50 border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#c9a84c] hover:bg-[#b8972a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded text-sm tracking-widest uppercase transition-colors"
                >
                    {loading ? "UPDATING…" : "UPDATE PASSWORD"}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
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
                    <div className="flex justify-center mb-8">
                        <Image src="/feather-logo.png" alt="Tanush Logo" width={64} height={64} className="object-contain" priority />
                    </div>
                    <Suspense fallback={
                        <div className="space-y-4 animate-pulse">
                            <div className="h-8 bg-[#e8e3db] rounded w-3/4 mx-auto" />
                            <div className="h-4 bg-[#e8e3db] rounded w-1/2 mx-auto" />
                            <div className="h-12 bg-[#e8e3db] rounded mt-8" />
                            <div className="h-12 bg-[#e8e3db] rounded" />
                            <div className="h-12 bg-[#c9a84c]/30 rounded" />
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
