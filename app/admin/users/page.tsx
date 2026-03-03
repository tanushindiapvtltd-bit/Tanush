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
                <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>Users</h1>
                <p className="text-sm mt-0.5" style={{ color: "#888" }}>{users.length} registered users</p>
            </div>

            <div className="rounded-xl" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#e0d5c5", borderTopColor: "#c9a84c" }} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid #f0e6d0" }}>
                                    {["Name", "Email", "Orders", "Reviews", "Newsletter", "Joined", "Role", "Action"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "#888" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: "1px solid #f9f6f1" }}>
                                        <td className="px-5 py-4 font-semibold" style={{ color: "#1a1a1a" }}>{user.name}</td>
                                        <td className="px-5 py-4 text-xs" style={{ color: "#555" }}>{user.email}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="font-bold" style={{ color: "#c9a84c" }}>{user._count.orders}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span style={{ color: "#555" }}>{user._count.reviews}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span style={{ color: user.newsletter ? "#27ae60" : "#ccc" }}>{user.newsletter ? "✓" : "–"}</span>
                                        </td>
                                        <td className="px-5 py-4 text-xs" style={{ color: "#888" }}>
                                            {new Date(user.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                                                style={{
                                                    background: user.role === "ADMIN" ? "#c9a84c22" : "#f5f5f5",
                                                    color: user.role === "ADMIN" ? "#c9a84c" : "#888",
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
                                                style={{ color: user.role === "ADMIN" ? "#e74c3c" : "#c9a84c" }}
                                            >
                                                {updating === user.id ? "..." : user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <p className="text-center py-10 text-sm" style={{ color: "#aaa" }}>No users found</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
