"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
    {
        href: "/admin", label: "Dashboard",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: "/admin/orders", label: "Orders",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
        ),
    },
    {
        href: "/admin/products", label: "Products",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9Z" /><path d="M11 3l1 6h10" /><path d="M2 9h10l1-6" />
            </svg>
        ),
    },
    {
        href: "/admin/users", label: "Users",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        href: "/admin/reviews", label: "Reviews",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
    {
        href: "/admin/delivery", label: "Delivery",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18h6a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-3.923-1.308A1 1 0 0 0 16 13.28V18" />
                <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
            </svg>
        ),
    },
    {
        href: "/admin/returns", label: "Returns",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
        ),
    },
    {
        href: "/admin/reports", label: "Reports",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex" style={{ background: "#0c0c0c" }}>
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{
                    width: 260,
                    background: "linear-gradient(180deg, #141414 0%, #0e0e0e 100%)",
                    borderRight: "1px solid rgba(201, 168, 76, 0.1)",
                }}
            >
                {/* Logo */}
                <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative" style={{ width: 36, height: 36 }}>
                            <Image src="/feather-logo.png" alt="Tanush" fill style={{ objectFit: "contain" }} sizes="36px" />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-[0.15em] uppercase" style={{ color: "#c9a84c" }}>Tanush</p>
                            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold px-3 mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>
                        Menu
                    </p>
                    {NAV.map((item) => {
                        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group"
                                style={{
                                    background: active
                                        ? "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)"
                                        : "transparent",
                                    color: active ? "#e2c975" : "rgba(255,255,255,0.45)",
                                    fontWeight: active ? 600 : 400,
                                    boxShadow: active ? "0 0 20px rgba(201,168,76,0.08)" : "none",
                                    border: active ? "1px solid rgba(201,168,76,0.15)" : "1px solid transparent",
                                }}
                            >
                                {/* Active indicator bar */}
                                {active && (
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                                        style={{
                                            width: 3,
                                            height: 20,
                                            background: "linear-gradient(180deg, #e2c975, #c9a84c)",
                                            boxShadow: "0 0 8px rgba(201,168,76,0.4)",
                                        }}
                                    />
                                )}
                                <span className="transition-colors duration-200" style={{ color: active ? "#e2c975" : "rgba(255,255,255,0.35)" }}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                        View Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header
                    className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 py-4"
                    style={{
                        background: "rgba(12,12,12,0.8)",
                        backdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <button
                        className="lg:hidden p-2 rounded-lg cursor-pointer transition-colors"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3 ml-auto">
                        {/* Notification bell */}
                        <div
                            className="flex items-center justify-center rounded-xl transition-all"
                            style={{
                                width: 38, height: 38,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.5)",
                                cursor: "pointer",
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                        </div>
                        {/* Admin badge */}
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-xl"
                            style={{
                                background: "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)",
                                border: "1px solid rgba(201,168,76,0.15)",
                            }}
                        >
                            <div
                                className="flex items-center justify-center rounded-lg"
                                style={{
                                    width: 26, height: 26,
                                    background: "linear-gradient(135deg, #c9a84c, #e2c975)",
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0c0c0c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#e2c975" }}>
                                Admin
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-8">{children}</main>
            </div>
        </div>
    );
}
