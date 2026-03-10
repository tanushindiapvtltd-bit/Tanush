"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { navLinks } from "@/lib/data";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";

function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    }
    return (email?.[0] ?? "U").toUpperCase();
}

function UserMenu() {
    const { data: session, status } = useSession();
    const { clearUserData } = useCart();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    const handleSignOut = useCallback(() => {
        setOpen(false);
        clearUserData();
        signOut({ callbackUrl: "/" });
    }, [clearUserData]);

    if (status === "loading") return <div className="w-8 h-8 rounded-full bg-[#e8e3db] animate-pulse" />;

    if (status !== "authenticated") {
        return (
            <Link href="/sign-in" aria-label="Sign in" className="text-[#4a4a4a] hover:text-[#C9A84C] transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            </Link>
        );
    }

    const initials = getInitials(session.user?.name, session.user?.email);
    const displayName = session.user?.name ?? session.user?.email ?? "Account";
    const isAdmin = session.user?.role === "ADMIN";

    return (
        <div ref={menuRef} className="relative">
            <button onClick={() => setOpen((o) => !o)} aria-label="Open account menu" aria-expanded={open} aria-haspopup="true"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c9a84c] hover:bg-[#b8972a] text-white text-[11px] font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2">
                {initials}
            </button>

            {open && (
                <div role="menu" className="absolute right-0 mt-2 w-56 bg-white border border-[#e8e3db] rounded shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#e8e3db] bg-[#faf9f6]">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{displayName}</p>
                        {session.user?.email && <p className="text-xs text-[#6b6b6b] truncate mt-0.5">{session.user.email}</p>}
                        {isAdmin && <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: "#c9a84c22", color: "#c9a84c" }}>Admin</span>}
                    </div>
                    <div className="py-1">
                        <Link role="menuitem" href="/orders" onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#faf9f6] hover:text-[#c9a84c] transition-colors">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            My Orders
                        </Link>
                        <Link role="menuitem" href="/wishlist" onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#faf9f6] hover:text-[#c9a84c] transition-colors">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            Wishlist
                        </Link>
                        {isAdmin && (
                            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#faf9f6] hover:text-[#c9a84c] transition-colors">
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                Admin Panel
                            </Link>
                        )}
                        <button role="menuitem" onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4a4a4a] hover:bg-[#faf9f6] hover:text-[#c9a84c] transition-colors text-left cursor-pointer">
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CartButton() {
    const { totalCount } = useCart();
    return (
        <Link href="/cart" aria-label="Shopping bag" className="relative text-[#C9A84C] hover:text-[#b8963f] transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
            </svg>
            {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C9A84C] text-white text-[9px] font-semibold flex items-center justify-center">
                    {totalCount > 9 ? "9+" : totalCount}
                </span>
            )}
        </Link>
    );
}

function WishlistButton() {
    const { ids } = useWishlist();
    const count = ids.length;
    return (
        <Link href="/wishlist" aria-label="Wishlist" className="relative text-[#C9A84C] hover:text-[#b8963f] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C9A84C] text-white text-[9px] font-semibold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}

function SearchBar() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="hidden md:flex items-center relative w-full max-w-md">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={2} className="absolute left-3 pointer-events-none">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-4 py-1.5 text-xs rounded-full outline-none transition-all w-full"
                style={{ border: "1px solid #e0d5c5", background: "#faf9f6", color: "#1a1a1a" }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d5c5")}
            />
        </form>
    );
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: session, status } = useSession();
    const { clearUserData } = useCart();
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#e8e3db]">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <Image src="/tanush-logo-transparent.png" alt="Tanush logo" width={240} height={60} className="object-contain h-[60px] w-auto" priority />
                </Link>

                {/* Centre Search Bar */}
                <div className="hidden md:flex flex-1 justify-center px-8">
                    <SearchBar />
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-4">
                    <WishlistButton />
                    <CartButton />
                    <UserMenu />

                    {/* Hamburger */}
                    <button aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden text-[#C9A84C] hover:text-[#b8963f] transition-colors cursor-pointer">
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
                <nav className="md:hidden border-t border-[#e8e3db] bg-white/95 backdrop-blur-sm px-6 py-5 flex flex-col gap-4" aria-label="Mobile navigation">
                    {/* Mobile search */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.querySelector("input") as HTMLInputElement);
                        if (input?.value.trim().length >= 2) {
                            closeMenu();
                            window.location.href = `/search?q=${encodeURIComponent(input.value.trim())}`;
                        }
                    }} className="flex gap-2">
                        <input type="text" placeholder="Search bangles..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
                            style={{ border: "1px solid #e0d5c5", background: "#faf9f6" }} />
                        <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer" style={{ background: "#c9a84c" }}>Go</button>
                    </form>

                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} onClick={closeMenu}
                            className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] transition-colors duration-200 tracking-wide no-underline py-1">
                            {link.label}
                        </Link>
                    ))}

                    <div className="border-t border-[#e8e3db] pt-4 mt-1">
                        {status === "loading" ? (
                            <div className="h-4 w-24 bg-[#e8e3db] rounded animate-pulse" />
                        ) : status === "authenticated" ? (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs text-[#6b6b6b] uppercase tracking-widest font-semibold">
                                    {session?.user?.name ?? session?.user?.email}
                                </p>
                                <Link href="/orders" onClick={closeMenu} className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] tracking-wide no-underline py-1">My Orders</Link>
                                <Link href="/wishlist" onClick={closeMenu} className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] tracking-wide no-underline py-1">Wishlist</Link>
                                {session?.user?.role === "ADMIN" && (
                                    <Link href="/admin" onClick={closeMenu} className="text-sm font-semibold hover:opacity-80 tracking-wide no-underline py-1" style={{ color: "#c9a84c" }}>Admin Panel</Link>
                                )}
                                <button onClick={() => { closeMenu(); clearUserData(); signOut({ callbackUrl: "/" }); }}
                                    className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] transition-colors tracking-wide text-left py-1 cursor-pointer">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link href="/sign-in" onClick={closeMenu} className="text-sm text-[#4a4a4a] hover:text-[#C9A84C] tracking-wide no-underline py-1">Sign In</Link>
                                <Link href="/sign-up" onClick={closeMenu} className="text-sm text-[#c9a84c] hover:text-[#b8972a] tracking-wide no-underline py-1 font-semibold">Create Account</Link>
                            </div>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
