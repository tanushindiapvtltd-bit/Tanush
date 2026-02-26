"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/lib/data";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#e8e3db]">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <Image
                        src="/tanush-logo-transparent.png"
                        alt="Tanush logo"
                        width={240}
                        height={60}
                        className="object-contain h-[60px] w-auto"
                        priority
                    />
                </Link>

                {/* Centre Nav — desktop only */}
                <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] transition-colors duration-200 tracking-wide no-underline"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Icons */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <button aria-label="Search" className="text-[#4a4a4a] hover:text-[#C9A84C] transition-colors cursor-pointer">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* Cart */}
                    <button aria-label="Cart" className="relative text-[#4a4a4a] hover:text-[#C9A84C] transition-colors cursor-pointer">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
                        </svg>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C9A84C] text-white text-[9px] font-semibold flex items-center justify-center">
                            2
                        </span>
                    </button>

                    {/* Account */}
                    <Link href="/sign-in" aria-label="Account" className="text-[#4a4a4a] hover:text-[#C9A84C] transition-colors cursor-pointer">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </Link>

                    {/* Hamburger — mobile only */}
                    <button
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden text-[#4a4a4a] hover:text-[#C9A84C] transition-colors cursor-pointer"
                    >
                        {menuOpen ? (
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile nav drawer */}
            {menuOpen && (
                <nav
                    className="md:hidden border-t border-[#e8e3db] bg-white/95 backdrop-blur-sm px-6 py-5 flex flex-col gap-4"
                    aria-label="Mobile navigation"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] transition-colors duration-200 tracking-wide no-underline py-1"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
