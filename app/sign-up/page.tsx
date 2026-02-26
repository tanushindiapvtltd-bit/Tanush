"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [newsletter, setNewsletter] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, newsletter }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create account.");
            } else {
                router.push("/sign-in?registered=true");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-inter">
            {/* Left side banner - hidden on mobile, 50% width on large screens */}
            <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden flex-col justify-between">
                {/* Background image covering the pane with a dark overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-bangle.png"
                        alt="Tanush Jewelry"
                        fill
                        className="object-cover object-center opacity-60"
                        priority
                    />
                </div>

                {/* Top Logo - Using the Tanush logo from home page */}
                <div className="relative z-10 pt-16 pl-12 flex items-center gap-3">
                    <Image
                        src="/tanush-logo-transparent.png"
                        alt="Tanush Logo"
                        width={200}
                        height={50}
                        className="object-contain filter brightness-0 invert"
                    />
                </div>

                {/* Middle Text */}
                <div className="relative z-10 px-12 max-w-lg mb-20">
                    <h2 className="font-cormorant italic text-5xl mb-6 text-white leading-tight drop-shadow-md">
                        Exquisite craftsmanship<br />for the modern icon.
                    </h2>
                    <p className="text-sm font-light text-white/90 leading-relaxed tracking-wide">
                        Discover our curated collection of timeless pieces<br />
                        designed to illuminate your unique radiance.
                    </p>
                </div>

                {/* Bottom Copyright */}
                <div className="relative z-10 pb-12 pl-12 text-[11px] text-white/70 tracking-[0.2em] uppercase font-semibold">
                    &copy; 2024 TANUSH JEWELRY ATELIER
                </div>
            </div>

            {/* Right side form */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 md:px-24 xl:px-32 py-12 bg-[#faf9f6]">
                <div className="w-full max-w-md mx-auto">
                    {/* Heading */}
                    <div className="mb-10">
                        <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Create Your Account</h1>
                        <p className="text-[#6b6b6b] text-sm font-light">Join our exclusive world of timeless elegance.</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Google sign-up */}
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e8e3db] rounded bg-white hover:bg-[#faf9f6] transition-colors mb-6"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-semibold text-[#1a1a1a]">Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-[#e8e3db]" />
                        <span className="text-xs text-[#999] font-medium tracking-widest uppercase whitespace-nowrap">or sign up with email</span>
                        <div className="h-px flex-1 bg-[#e8e3db]" />
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                            >
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Julianna Vielle"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[15px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="julianna@luxe.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[15px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                                >
                                    Confirm
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="flex items-start mt-6 mb-8">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="newsletter"
                                    type="checkbox"
                                    checked={newsletter}
                                    onChange={(e) => setNewsletter(e.target.checked)}
                                    className="w-4 h-4 text-[#c9a84c] bg-white border-[#e8e3db] rounded focus:ring-[#c9a84c] focus:ring-2 accent-[#c9a84c] cursor-pointer"
                                />
                            </div>
                            <label htmlFor="newsletter" className="ml-3 text-[13px] text-[#4a4a4a]">
                                Join the <span className="font-cormorant italic text-[#c9a84c] font-semibold text-base">Inner Circle</span> for exclusive previews and rewards.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#dfc067] hover:bg-[#c9a84c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded text-xs tracking-widest uppercase transition-colors"
                        >
                            {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
                        </button>
                    </form>

                    <p className="text-center mt-10 text-[13px] text-[#6b6b6b]">
                        Already part of our heritage?{' '}
                        <Link href="/sign-in" className="font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors">
                            Sign In
                        </Link>
                    </p>

                    {/* Bottom Icons */}
                    <div className="mt-16 flex items-center justify-center gap-10 text-[#a3a3a3]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        <svg width="28" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
