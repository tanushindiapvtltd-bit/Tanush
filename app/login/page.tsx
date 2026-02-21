"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) return;
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* ── Left: Image Panel ────────────────────────────────────── */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <Image
                    src="/collections/bridal.jpg"
                    alt="Luxury bridal jewellery"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Branding on image */}
                <div className="absolute inset-0 flex flex-col justify-between p-12">
                    {/* Logo */}
                    <Link href="/" className="no-underline">
                        <span className="font-cormorant font-semibold text-2xl text-white tracking-widest">
                            TANUSH
                        </span>
                    </Link>

                    {/* Quote */}
                    <div className="max-w-md">
                        <p className="font-cormorant text-[2rem] text-white/90 leading-snug mb-4 italic">
                            &ldquo;Elegance is when the inside is as beautiful as the outside.&rdquo;
                        </p>
                        <p className="text-sm text-white/50 tracking-widest uppercase">
                            — Coco Chanel
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: Login Form ────────────────────────────────────── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#FAF9F6] px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Link href="/">
                            <Image
                                src="/tanush-logo.png"
                                alt="Tanush"
                                width={160}
                                height={48}
                                className="object-contain"
                            />
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-cormorant text-[2.5rem] text-[#1A1A1A] leading-tight mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-[#6b6b6b]">
                            Sign in to explore your exclusive collections and orders.
                        </p>
                    </div>

                    {/* Social Logins */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#e8e3db] rounded-lg bg-white hover:border-[#C9A84C] transition-colors text-sm text-[#1A1A1A] cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#e8e3db] rounded-lg bg-white hover:border-[#C9A84C] transition-colors text-sm text-[#1A1A1A] cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1A1A1A">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-[#e8e3db]" />
                        <span className="text-xs text-[#9e9e9e] tracking-wider uppercase">
                            or sign in with email
                        </span>
                        <div className="flex-1 h-px bg-[#e8e3db]" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="login-email"
                                className="text-xs font-medium text-[#1A1A1A] tracking-wide"
                            >
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 text-sm border border-[#e8e3db] rounded-lg bg-white outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 text-[#1A1A1A] placeholder:text-[#bbb] transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="login-password"
                                    className="text-xs font-medium text-[#1A1A1A] tracking-wide"
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-[#C9A84C] hover:text-[#b8972a] transition-colors no-underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 pr-11 text-sm border border-[#e8e3db] rounded-lg bg-white outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 text-[#1A1A1A] placeholder:text-[#bbb] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-[#C9A84C] transition-colors cursor-pointer bg-transparent border-none p-0"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-[#e8e3db] accent-[#C9A84C]"
                            />
                            <span className="text-sm text-[#6b6b6b]">Keep me signed in</span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium tracking-wide bg-[#C9A84C] text-white hover:bg-[#b8972a] active:scale-[0.98] rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                                </svg>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-[#6b6b6b] mt-8">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-[#C9A84C] font-medium hover:text-[#b8972a] transition-colors no-underline"
                        >
                            Create one
                        </Link>
                    </p>

                    {/* Footer */}
                    <p className="text-center text-[11px] text-[#bbb] mt-6 leading-relaxed">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-[#C9A84C] transition-colors">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-[#C9A84C] transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
