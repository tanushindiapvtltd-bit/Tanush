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
            .then((r) => {
                if (!r.ok) throw new Error("Not found or unauthorized");
                return r.json();
            })
            .then((data) => { setOrder(data); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (!loading && order && !printed.current) {
            printed.current = true;
            setTimeout(() => window.print(), 500);
        }
    }, [loading, order]);

    if (loading) return (
        <div style={center}>
            <p style={{ fontFamily: "Arial, sans-serif", color: "#555", fontSize: 14 }}>Loading label…</p>
        </div>
    );
    if (error || !order) return (
        <div style={center}>
            <p style={{ fontFamily: "Arial, sans-serif", color: "#c0392b", fontSize: 14 }}>{error || "Order not found"}</p>
        </div>
    );

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <title>Packing Label – {order.orderNumber}</title>
                <style>{`
                    @media print {
                        @page { size: A4 portrait; margin: 10mm; }
                        .no-print { display: none !important; }
                        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                    body { background: #fff; font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 13px; }
                    table { border-collapse: collapse; }
                    img { display: block; }
                `}</style>
            </head>
            <body style={{ background: "#f0f0f0", padding: "0 0 40px" }}>

                {/* Toolbar */}
                <div className="no-print" style={{
                    background: "#fff", borderBottom: "1px solid #ddd",
                    padding: "10px 20px", display: "flex", gap: 10, alignItems: "center",
                    position: "sticky", top: 0, zIndex: 10,
                }}>
                    <button onClick={() => window.print()} style={btnPrimary}>Print / Save PDF</button>
                    <button onClick={() => window.close()} style={btnSecondary}>Close</button>
                    <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>Order: {order.orderNumber}</span>
                </div>

                {/* Label card */}
                <div style={{ maxWidth: 720, margin: "24px auto", background: "#fff", border: "2px solid #111", borderRadius: 10, overflow: "hidden" }}>

                    {/* ─── Header ─── */}
                    <div style={{
                        background: "#111", padding: "14px 22px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div>
                            <div style={{ color: "#c9a84c", fontWeight: 900, fontSize: 24, letterSpacing: "0.14em" }}>TANUSH</div>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.22em", marginTop: 2 }}>PACKING SLIP</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{order.orderNumber}</div>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 3 }}>{orderDate}</div>
                        </div>
                    </div>

                    {/* ─── Ship To + Order Info ─── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #e0e0e0" }}>
                        <div style={{ padding: "14px 22px", borderRight: "1px solid #e0e0e0" }}>
                            <div style={sectionLabel}>Ship To</div>
                            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{order.shippingName}</div>
                            <div style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>
                                {order.shippingAddress}{order.shippingApartment ? `, ${order.shippingApartment}` : ""}<br />
                                {order.shippingCity}, {order.shippingState} – {order.shippingZip}<br />
                                {order.shippingCountry}
                            </div>
                            {order.shippingPhone && (
                                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{order.shippingPhone}</div>
                            )}
                        </div>

                        <div style={{ padding: "14px 22px" }}>
                            <div style={sectionLabel}>Order Info</div>
                            {[
                                ["Payment", order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"],
                                ["Status", order.status],
                                ...(order.deliveryTracking?.trackingNumber ? [["Tracking", order.deliveryTracking.trackingNumber]] : []),
                                ...(order.deliveryTracking?.carrier ? [["Carrier", order.deliveryTracking.carrier]] : []),
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: "#888", width: 60, flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{value}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e0e0e0", display: "flex", gap: 8 }}>
                                <span style={{ fontSize: 12, color: "#888", width: 60, flexShrink: 0 }}>Total</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Items ─── */}
                    <div style={{ padding: "16px 22px" }}>
                        <div style={sectionLabel}>Items Ordered ({order.items.length})</div>

                        <table style={{ width: "100%", marginTop: 6 }}>
                            <thead>
                                <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #111" }}>
                                    <th style={th("left")}>PRODUCT</th>
                                    <th style={th("center", 62)}>SIZE</th>
                                    <th style={th("center", 85)}>COLOR</th>
                                    <th style={th("center", 100)}>SKU</th>
                                    <th style={th("center", 42)}>QTY</th>
                                    <th style={th("right", 80)}>PRICE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={item.id} style={{
                                        borderBottom: idx < order.items.length - 1 ? "1px solid #ebebeb" : "none",
                                        background: idx % 2 === 1 ? "#fafafa" : "#fff",
                                    }}>
                                        {/* Product name + image */}
                                        <td style={td()}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd", flexShrink: 0, position: "relative" }}>
                                                    <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="40px" />
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.4, color: "#111" }}>{item.productName}</span>
                                            </div>
                                        </td>

                                        {/* Size */}
                                        <td style={td("center")}>
                                            {item.size
                                                ? <Badge text={item.size} bg="#fff8e7" border="#c9a84c" color="#7a5800" />
                                                : <Dash />
                                            }
                                        </td>

                                        {/* Color */}
                                        <td style={td("center")}>
                                            {item.color
                                                ? <Badge text={item.color} bg="#eef2ff" border="#7986cb" color="#283593" />
                                                : <Dash />
                                            }
                                        </td>

                                        {/* SKU */}
                                        <td style={td("center")}>
                                            {item.sku
                                                ? <span style={{ fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 700, color: "#333", background: "#f3f3f3", border: "1px solid #ccc", padding: "3px 7px", borderRadius: 4, display: "inline-block" }}>{item.sku}</span>
                                                : <Dash />
                                            }
                                        </td>

                                        {/* Qty */}
                                        <td style={td("center")}>
                                            <span style={{ display: "inline-block", background: "#111", color: "#fff", fontWeight: 900, fontSize: 14, padding: "3px 10px", borderRadius: 4, minWidth: 30, textAlign: "center" }}>
                                                {item.quantity}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td style={{ ...td("right"), fontWeight: 700, fontSize: 13 }}>
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ marginTop: 14, borderTop: "2px solid #111", paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
                            <table style={{ width: 210 }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontSize: 11, color: "#666", paddingBottom: 4 }}>Subtotal</td>
                                        <td style={{ fontSize: 11, fontWeight: 700, textAlign: "right", paddingBottom: 4 }}>₹{order.subtotal.toLocaleString("en-IN")}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontSize: 11, color: "#666", paddingBottom: 4 }}>Shipping</td>
                                        <td style={{ fontSize: 11, fontWeight: 700, textAlign: "right", paddingBottom: 4 }}>₹{order.shippingCost.toLocaleString("en-IN")}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontSize: 11, color: "#666", paddingBottom: 8 }}>Tax (3%)</td>
                                        <td style={{ fontSize: 11, fontWeight: 700, textAlign: "right", paddingBottom: 8 }}>₹{order.tax.toLocaleString("en-IN")}</td>
                                    </tr>
                                    <tr style={{ borderTop: "2px solid #111" }}>
                                        <td style={{ fontSize: 14, fontWeight: 900, paddingTop: 8, letterSpacing: "0.05em" }}>TOTAL</td>
                                        <td style={{ fontSize: 15, fontWeight: 900, textAlign: "right", color: "#c9a84c", paddingTop: 8 }}>₹{order.total.toLocaleString("en-IN")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ background: "#f8f8f8", borderTop: "1px solid #e0e0e0", padding: "9px 22px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "#aaa" }}>Thank you for shopping with Tanush!</span>
                        <span style={{ fontSize: 10, color: "#aaa" }}>Printed: {new Date().toLocaleDateString("en-IN")}</span>
                    </div>
                </div>
            </body>
        </html>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const center: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff" };
const sectionLabel: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 8 };

const btnPrimary: React.CSSProperties = { padding: "8px 20px", background: "#c9a84c", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer" };
const btnSecondary: React.CSSProperties = { padding: "8px 16px", background: "#fff", color: "#555", border: "1px solid #ccc", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer" };

function th(align: "left" | "center" | "right", width?: number): React.CSSProperties {
    return { textAlign: align, padding: "7px 8px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333", ...(width ? { width } : {}) };
}
function td(align: "left" | "center" | "right" = "left"): React.CSSProperties {
    return { textAlign: align, padding: "10px 8px", verticalAlign: "middle" };
}

function Badge({ text, bg, border, color }: { text: string; bg: string; border: string; color: string }) {
    return (
        <span style={{ display: "inline-block", background: bg, border: `1.5px solid ${border}`, color, fontWeight: 800, fontSize: 11, padding: "3px 8px", borderRadius: 4 }}>
            {text}
        </span>
    );
}
function Dash() {
    return <span style={{ color: "#bbb", fontSize: 13, fontWeight: 700 }}>—</span>;
}
