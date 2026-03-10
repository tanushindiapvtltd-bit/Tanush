"use client";

import { useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    newsletter: boolean;
    createdAt: string;
    _count: { orders: number; reviews: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/users")
            .then((r) => r.json())
            .then((data) => setUsers(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const toggleRole = async (user: User) => {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        setUpdating(user.id);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
            }
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Users</h1>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{users.length} registered users</p>
            </div>

            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(201,168,76,0.2)", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    {["Name", "Email", "Orders", "Reviews", "Newsletter", "Joined", "Role", "Action"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors duration-150"
                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex items-center justify-center rounded-lg text-xs font-bold"
                                                    style={{
                                                        width: 32, height: 32,
                                                        background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))",
                                                        color: "#e2c975",
                                                    }}
                                                >
                                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <span className="font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{user.email}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="font-bold" style={{ color: "#e2c975" }}>{user._count.orders}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center" style={{ color: "rgba(255,255,255,0.5)" }}>{user._count.reviews}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span style={{ color: user.newsletter ? "#81c784" : "rgba(255,255,255,0.15)" }}>
                                                {user.newsletter ? "✓" : "–"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                                            {new Date(user.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                                                style={{
                                                    background: user.role === "ADMIN"
                                                        ? "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))"
                                                        : "rgba(255,255,255,0.04)",
                                                    color: user.role === "ADMIN" ? "#e2c975" : "rgba(255,255,255,0.35)",
                                                    border: "1px solid " + (user.role === "ADMIN" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.06)"),
                                                }}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => toggleRole(user)}
                                                disabled={updating === user.id}
                                                className="text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-50"
                                                style={{ color: user.role === "ADMIN" ? "#ef5350" : "#c9a84c" }}
                                            >
                                                {updating === user.id ? "..." : user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <p className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No users found</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
