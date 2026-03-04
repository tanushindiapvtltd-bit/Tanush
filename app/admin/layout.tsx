"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
    { href: "/admin", label: "Dashboard", icon: "◈" },
    { href: "/admin/orders", label: "Orders", icon: "📦" },
    { href: "/admin/products", label: "Products", icon: "💎" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/reviews", label: "Reviews", icon: "★" },
    { href: "/admin/delivery", label: "Delivery", icon: "🚚" },
    { href: "/admin/manifest", label: "Manifest", icon: "🗂" },
    { href: "/admin/ndr", label: "NDR", icon: "⚠" },
    { href: "/admin/analytics/shipping", label: "Analytics", icon: "📊" },
    { href: "/admin/cod-remittance", label: "COD Remittance", icon: "💰" },
    { href: "/admin/returns", label: "Returns", icon: "↩" },
    { href: "/admin/shipments/bulk-upload", label: "Bulk Upload", icon: "📤" },
    { href: "/admin/pincode-blacklist", label: "Pincodes", icon: "📍" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex" style={{ background: "#f5f3ef" }}>
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ width: 240, background: "#1a1a1a", color: "#fff" }}
            >
                {/* Logo */}
                <div className="px-6 py-5" style={{ borderBottom: "1px solid #2e2e2e" }}>
                    <Link href="/" className="block">
                        <p className="text-xs uppercase tracking-[0.2em] mb-0.5" style={{ color: "#c9a84c" }}>Tanush</p>
                        <p className="text-xs" style={{ color: "#666" }}>Admin Panel</p>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {NAV.map((item) => {
                        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                                style={{
                                    background: active ? "#c9a84c22" : "transparent",
                                    color: active ? "#c9a84c" : "#aaa",
                                    fontWeight: active ? 600 : 400,
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign out */}
                <div className="px-3 py-4" style={{ borderTop: "1px solid #2e2e2e" }}>
                    <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:text-white" style={{ color: "#888" }}>
                        <span>🏠</span> View Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:text-white cursor-pointer"
                        style={{ color: "#888" }}
                    >
                        <span>→</span> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header
                    className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
                    style={{ background: "#fff", borderBottom: "1px solid #e8e3db" }}
                >
                    <button
                        className="lg:hidden p-2 rounded-lg cursor-pointer"
                        style={{ color: "#555" }}
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#c9a84c" }}>
                            Admin
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-8">{children}</main>
            </div>
        </div>
    );
}
