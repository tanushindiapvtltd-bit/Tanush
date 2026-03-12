"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    size: string | null;
    color: string | null;
    sku: string | null;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string | null;
    shippingAddress: string;
    shippingApartment: string | null;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    createdAt: string;
    items: OrderItem[];
    deliveryTracking: { trackingNumber: string | null; carrier: string | null } | null;
}

export default function PrintLabelPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const printed = useRef(false);

    useEffect(() => {
        fetch(`/api/admin/orders/${id}`)
            .then((r) => { if (!r.ok) throw new Error("Not found or unauthorized"); return r.json(); })
            .then((data) => { setOrder(data); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (!loading && order && !printed.current) {
            printed.current = true;
            setTimeout(() => window.print(), 500);
        }
    }, [loading, order]);

    const orderDate = order
        ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "";

    return (
        /* Full-page white override — root layout applies bg-[#FAF9F6] to body */
        <div style={{ position: "fixed", inset: 0, overflowY: "auto", background: "#e8e8e8", fontFamily: "Arial, Helvetica, sans-serif" }}>

            {/* Print-only CSS */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body { background: #fff !important; }
                    .no-print { display: none !important; }
                    .print-card { border: none !important; box-shadow: none !important; margin: 0 !important; }
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            `}</style>

            {/* Loading / error states */}
            {loading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                    <p style={{ color: "#555", fontSize: 15 }}>Loading label…</p>
                </div>
            )}

            {!loading && (error || !order) && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                    <p style={{ color: "#c0392b", fontSize: 15 }}>{error || "Order not found"}</p>
                </div>
            )}

            {!loading && order && (
                <>
                    {/* Toolbar */}
                    <div className="no-print" style={{
                        background: "#fff", borderBottom: "2px solid #c9a84c",
                        padding: "10px 20px", display: "flex", gap: 10, alignItems: "center",
                        position: "sticky", top: 0, zIndex: 100,
                    }}>
                        <button onClick={() => window.print()} style={{
                            padding: "8px 22px", background: "#c9a84c", color: "#fff",
                            border: "none", borderRadius: 7, fontWeight: 800, fontSize: 13, cursor: "pointer",
                        }}>
                            Print / Save PDF
                        </button>
                        <button onClick={() => window.close()} style={{
                            padding: "8px 16px", background: "#fff", color: "#444",
                            border: "1px solid #ccc", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}>
                            Close
                        </button>
                        <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>
                            {order.orderNumber} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Label card */}
                    <div className="print-card" style={{
                        maxWidth: 740, margin: "24px auto 40px",
                        background: "#fff", border: "2px solid #111",
                        borderRadius: 10, overflow: "hidden",
                    }}>

                        {/* ── Header ── */}
                        <div style={{
                            background: "#111", padding: "14px 24px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div>
                                <div style={{ color: "#c9a84c", fontWeight: 900, fontSize: 26, letterSpacing: "0.14em" }}>TANUSH</div>
                                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.22em", marginTop: 3 }}>PACKING SLIP</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{order.orderNumber}</div>
                                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 4 }}>{orderDate}</div>
                            </div>
                        </div>

                        {/* ── Ship To + Order Info ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #ddd" }}>
                            {/* Ship To */}
                            <div style={{ padding: "16px 24px", borderRight: "1px solid #ddd" }}>
                                <p style={labelStyle}>Ship To</p>
                                <p style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 5 }}>{order.shippingName}</p>
                                <p style={{ fontSize: 12, color: "#444", lineHeight: 1.65 }}>
                                    {order.shippingAddress}{order.shippingApartment ? `, ${order.shippingApartment}` : ""}<br />
                                    {order.shippingCity}, {order.shippingState} – {order.shippingZip}<br />
                                    {order.shippingCountry}
                                </p>
                                {order.shippingPhone && (
                                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111", marginTop: 6 }}>{order.shippingPhone}</p>
                                )}
                            </div>

                            {/* Order Info */}
                            <div style={{ padding: "16px 24px" }}>
                                <p style={labelStyle}>Order Info</p>
                                {([
                                    ["Payment", order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"],
                                    ["Status", order.status],
                                    ...(order.deliveryTracking?.trackingNumber ? [["Tracking", order.deliveryTracking.trackingNumber]] : []),
                                    ...(order.deliveryTracking?.carrier ? [["Carrier", order.deliveryTracking.carrier]] : []),
                                ] as [string, string][]).map(([label, value]) => (
                                    <div key={label} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, color: "#888", minWidth: 56 }}>{label}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{value}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid #ddd" }}>
                                    <span style={{ fontSize: 12, color: "#888", minWidth: 56 }}>Total</span>
                                    <span style={{ fontSize: 15, fontWeight: 900, color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Items Table ── */}
                        <div style={{ padding: "18px 24px" }}>
                            <p style={labelStyle}>Items Ordered ({order.items.length})</p>

                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                                <thead>
                                    <tr style={{ background: "#f2f2f2", borderBottom: "2px solid #111" }}>
                                        <th style={TH("left")}>PRODUCT</th>
                                        <th style={TH("center", 64)}>SIZE</th>
                                        <th style={TH("center", 88)}>COLOR</th>
                                        <th style={TH("center", 100)}>SKU</th>
                                        <th style={TH("center", 44)}>QTY</th>
                                        <th style={TH("right", 84)}>PRICE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={item.id} style={{
                                            borderBottom: idx < order.items.length - 1 ? "1px solid #eee" : "none",
                                            background: idx % 2 === 0 ? "#fff" : "#fafafa",
                                        }}>

                                            {/* Product */}
                                            <td style={TD()}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd", flexShrink: 0, position: "relative" }}>
                                                        <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="42px" />
                                                    </div>
                                                    <span style={{ fontWeight: 700, fontSize: 12, color: "#111", lineHeight: 1.4 }}>{item.productName}</span>
                                                </div>
                                            </td>

                                            {/* Size */}
                                            <td style={TD("center")}>
                                                {item.size
                                                    ? <span style={{ ...chip, background: "#fff8e7", border: "1.5px solid #c9a84c", color: "#7a5800" }}>{item.size}</span>
                                                    : <span style={dash}>—</span>
                                                }
                                            </td>

                                            {/* Color */}
                                            <td style={TD("center")}>
                                                {item.color
                                                    ? <span style={{ ...chip, background: "#eef2ff", border: "1.5px solid #7986cb", color: "#283593" }}>{item.color}</span>
                                                    : <span style={dash}>—</span>
                                                }
                                            </td>

                                            {/* SKU */}
                                            <td style={TD("center")}>
                                                {item.sku
                                                    ? <span style={{ fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 700, color: "#222", background: "#f3f3f3", border: "1px solid #ccc", padding: "3px 7px", borderRadius: 4, display: "inline-block" }}>{item.sku}</span>
                                                    : <span style={dash}>—</span>
                                                }
                                            </td>

                                            {/* Qty */}
                                            <td style={TD("center")}>
                                                <span style={{ display: "inline-block", background: "#111", color: "#fff", fontWeight: 900, fontSize: 15, padding: "3px 12px", borderRadius: 5, minWidth: 32, textAlign: "center" }}>
                                                    {item.quantity}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td style={{ ...TD("right"), fontWeight: 700, fontSize: 13, color: "#111" }}>
                                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div style={{ marginTop: 16, borderTop: "2px solid #111", paddingTop: 14, display: "flex", justifyContent: "flex-end" }}>
                                <table style={{ width: 210, borderCollapse: "collapse" }}>
                                    <tbody>
                                        {([
                                            ["Subtotal", `₹${order.subtotal.toLocaleString("en-IN")}`, false],
                                            ["Shipping", `₹${order.shippingCost.toLocaleString("en-IN")}`, false],
                                            ["Tax (3%)", `₹${order.tax.toLocaleString("en-IN")}`, false],
                                            ["TOTAL", `₹${order.total.toLocaleString("en-IN")}`, true],
                                        ] as [string, string, boolean][]).map(([label, value, bold]) => (
                                            <tr key={label} style={{ borderTop: bold ? "2px solid #111" : "none" }}>
                                                <td style={{ fontSize: bold ? 14 : 11, fontWeight: bold ? 900 : 400, color: bold ? "#111" : "#666", padding: bold ? "8px 0 2px" : "3px 0", letterSpacing: bold ? "0.05em" : 0 }}>{label}</td>
                                                <td style={{ fontSize: bold ? 15 : 11, fontWeight: 900, color: bold ? "#c9a84c" : "#111", textAlign: "right", padding: bold ? "8px 0 2px" : "3px 0" }}>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ background: "#f8f8f8", borderTop: "1px solid #ddd", padding: "10px 24px", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 10, color: "#aaa" }}>Thank you for shopping with Tanush!</span>
                            <span style={{ fontSize: 10, color: "#aaa" }}>Printed: {new Date().toLocaleDateString("en-IN")}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#888",
    textTransform: "uppercase", marginBottom: 10,
};

const chip: React.CSSProperties = {
    display: "inline-block", fontWeight: 800, fontSize: 11,
    padding: "3px 9px", borderRadius: 4,
};

const dash: React.CSSProperties = {
    color: "#bbb", fontSize: 14, fontWeight: 700,
};

function TH(align: "left" | "center" | "right", width?: number): React.CSSProperties {
    return {
        textAlign: align,
        padding: "8px 8px",
        fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333",
        ...(width ? { width } : {}),
    };
}

function TD(align: "left" | "center" | "right" = "left"): React.CSSProperties {
    return { textAlign: align, padding: "11px 8px", verticalAlign: "middle" };
}
