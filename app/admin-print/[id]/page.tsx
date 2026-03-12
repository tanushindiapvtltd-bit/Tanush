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

    /* Override root-layout body styles so the page is white */
    useEffect(() => {
        const prev = document.body.getAttribute("class") ?? "";
        const prevBg = document.body.style.background;
        document.body.style.background = "#f0f0f0";
        document.body.style.padding = "0";
        document.body.style.margin = "0";
        return () => {
            document.body.setAttribute("class", prev);
            document.body.style.background = prevBg;
        };
    }, []);

    useEffect(() => {
        fetch(`/api/admin/orders/${id}`)
            .then((r) => { if (!r.ok) throw new Error("Not found or forbidden"); return r.json(); })
            .then((data) => { setOrder(data); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (!loading && order && !printed.current) {
            printed.current = true;
            setTimeout(() => window.print(), 600);
        }
    }, [loading, order]);

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f0f0" }}>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: "#555" }}>Loading packing slip…</p>
        </div>
    );

    if (error || !order) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f0f0" }}>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: "#c0392b" }}>{error || "Order not found"}</p>
        </div>
    );

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#f0f0f0", minHeight: "100vh", padding: "0 0 40px" }}>

            <style>{`
                * { box-sizing: border-box; }
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .card { margin: 0 !important; max-width: 100% !important; box-shadow: none !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            `}</style>

            {/* Toolbar — hidden when printing */}
            <div className="no-print" style={{
                background: "#1a1a1a", padding: "10px 20px",
                display: "flex", alignItems: "center", gap: 10,
                position: "sticky", top: 0, zIndex: 50,
            }}>
                <button onClick={() => window.print()} style={{
                    padding: "8px 22px", background: "#c9a84c", color: "#111",
                    border: "none", borderRadius: 6, fontWeight: 800, fontSize: 13, cursor: "pointer",
                }}>
                    🖨 Print / Save PDF
                </button>
                <button onClick={() => window.close()} style={{
                    padding: "8px 16px", background: "transparent", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                    Close
                </button>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>
                    {order.orderNumber} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── LABEL CARD ── */}
            <div className="card" style={{
                maxWidth: 740, margin: "24px auto",
                background: "#fff",
                border: "2px solid #111",
                borderRadius: 10,
                overflow: "hidden",
            }}>

                {/* Header */}
                <table style={{ width: "100%", background: "#111", borderCollapse: "collapse" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "14px 22px" }}>
                                <div style={{ color: "#c9a84c", fontWeight: 900, fontSize: 26, letterSpacing: "0.14em", fontFamily: "Arial Black, Arial, sans-serif" }}>TANUSH</div>
                                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: "0.22em", marginTop: 3 }}>PACKING SLIP</div>
                            </td>
                            <td style={{ padding: "14px 22px", textAlign: "right" }}>
                                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{order.orderNumber}</div>
                                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 4 }}>{orderDate}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Ship To + Order Info */}
                <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #ddd" }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "50%", padding: "16px 22px", borderRight: "1px solid #ddd", verticalAlign: "top" }}>
                                <div style={sLabel}>Ship To</div>
                                <div style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 5 }}>{order.shippingName}</div>
                                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>
                                    {order.shippingAddress}
                                    {order.shippingApartment ? `, ${order.shippingApartment}` : ""}
                                    <br />{order.shippingCity}, {order.shippingState} – {order.shippingZip}
                                    <br />{order.shippingCountry}
                                </div>
                                {order.shippingPhone && (
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginTop: 6 }}>{order.shippingPhone}</div>
                                )}
                            </td>
                            <td style={{ width: "50%", padding: "16px 22px", verticalAlign: "top" }}>
                                <div style={sLabel}>Order Info</div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <tbody>
                                        {([
                                            ["Payment", order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"],
                                            ["Status", order.status],
                                            ...(order.deliveryTracking?.trackingNumber ? [["Tracking", order.deliveryTracking.trackingNumber]] : []),
                                            ...(order.deliveryTracking?.carrier ? [["Carrier", order.deliveryTracking.carrier]] : []),
                                        ] as [string, string][]).map(([l, v]) => (
                                            <tr key={l}>
                                                <td style={{ fontSize: 11, color: "#888", padding: "2px 10px 2px 0", whiteSpace: "nowrap" }}>{l}</td>
                                                <td style={{ fontSize: 11, fontWeight: 700, color: "#111", padding: "2px 0" }}>{v}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={2} style={{ padding: "8px 0 2px", borderTop: "1px solid #ddd" }}>
                                                <span style={{ fontSize: 12, color: "#888" }}>Total </span>
                                                <span style={{ fontSize: 16, fontWeight: 900, color: "#c9a84c" }}>₹{order.total.toLocaleString("en-IN")}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Items */}
                <div style={{ padding: "18px 22px" }}>
                    <div style={sLabel}>Items Ordered ({order.items.length})</div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                        <thead>
                            <tr style={{ background: "#f2f2f2", borderBottom: "2px solid #111" }}>
                                <th style={TH("left")}>PRODUCT</th>
                                <th style={TH("center", 62)}>SIZE</th>
                                <th style={TH("center", 82)}>COLOR</th>
                                <th style={TH("center", 100)}>SKU</th>
                                <th style={TH("center", 44)}>QTY</th>
                                <th style={TH("right", 82)}>PRICE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={item.id} style={{
                                    background: idx % 2 === 0 ? "#fff" : "#fafafa",
                                    borderBottom: idx < order.items.length - 1 ? "1px solid #eee" : "none",
                                }}>
                                    {/* Product */}
                                    <td style={TD()}>
                                        <table style={{ borderCollapse: "collapse" }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: 44, verticalAlign: "middle", paddingRight: 10 }}>
                                                        <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd", position: "relative" }}>
                                                            <Image
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                fill
                                                                style={{ objectFit: "cover" }}
                                                                sizes="44px"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td style={{ verticalAlign: "middle" }}>
                                                        <span style={{ fontWeight: 700, fontSize: 12, color: "#111", lineHeight: 1.4 }}>{item.productName}</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>

                                    {/* Size */}
                                    <td style={TD("center")}>
                                        {item.size
                                            ? <span style={{ display: "inline-block", background: "#fff8e7", border: "1.5px solid #c9a84c", color: "#7a5800", fontWeight: 800, fontSize: 12, padding: "3px 9px", borderRadius: 4 }}>
                                                {item.size}
                                            </span>
                                            : <span style={{ color: "#bbb", fontSize: 14, fontWeight: 700 }}>—</span>
                                        }
                                    </td>

                                    {/* Color */}
                                    <td style={TD("center")}>
                                        {item.color
                                            ? <span style={{ display: "inline-block", background: "#eef2ff", border: "1.5px solid #7986cb", color: "#283593", fontWeight: 700, fontSize: 11, padding: "3px 8px", borderRadius: 4 }}>
                                                {item.color}
                                            </span>
                                            : <span style={{ color: "#bbb", fontSize: 14, fontWeight: 700 }}>—</span>
                                        }
                                    </td>

                                    {/* SKU */}
                                    <td style={TD("center")}>
                                        {item.sku
                                            ? <span style={{ display: "inline-block", fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 700, color: "#222", background: "#f3f3f3", border: "1px solid #ccc", padding: "3px 8px", borderRadius: 4 }}>
                                                {item.sku}
                                            </span>
                                            : <span style={{ color: "#bbb", fontSize: 14, fontWeight: 700 }}>—</span>
                                        }
                                    </td>

                                    {/* Qty */}
                                    <td style={TD("center")}>
                                        <span style={{ display: "inline-block", background: "#111", color: "#fff", fontWeight: 900, fontSize: 15, padding: "4px 12px", borderRadius: 5, minWidth: 34, textAlign: "center" }}>
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
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, borderTop: "2px solid #111" }}>
                        <tbody>
                            <tr>
                                <td></td>
                                <td style={{ width: 200, paddingTop: 12 }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <tbody>
                                            <tr>
                                                <td style={TotL}>Subtotal</td>
                                                <td style={TotR}>₹{order.subtotal.toLocaleString("en-IN")}</td>
                                            </tr>
                                            <tr>
                                                <td style={TotL}>Shipping</td>
                                                <td style={TotR}>₹{order.shippingCost.toLocaleString("en-IN")}</td>
                                            </tr>
                                            <tr>
                                                <td style={TotL}>Tax (3%)</td>
                                                <td style={TotR}>₹{order.tax.toLocaleString("en-IN")}</td>
                                            </tr>
                                            <tr style={{ borderTop: "2px solid #111" }}>
                                                <td style={{ fontSize: 14, fontWeight: 900, padding: "8px 0 2px", letterSpacing: "0.04em" }}>TOTAL</td>
                                                <td style={{ fontSize: 15, fontWeight: 900, textAlign: "right", color: "#c9a84c", padding: "8px 0 2px" }}>₹{order.total.toLocaleString("en-IN")}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ background: "#f8f8f8", borderTop: "1px solid #ddd", padding: "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#aaa" }}>Thank you for shopping with Tanush!</span>
                    <span style={{ fontSize: 10, color: "#aaa" }}>Printed: {new Date().toLocaleDateString("en-IN")}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Style constants ───────────────────────────────────────────────────────────

const sLabel: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, letterSpacing: "0.2em",
    color: "#888", textTransform: "uppercase", marginBottom: 10,
};

function TH(align: "left" | "center" | "right", width?: number): React.CSSProperties {
    return {
        textAlign: align, padding: "8px 8px",
        fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333",
        ...(width ? { width } : {}),
    };
}
function TD(align: "left" | "center" | "right" = "left"): React.CSSProperties {
    return { textAlign: align, padding: "11px 8px", verticalAlign: "middle" };
}

const TotL: React.CSSProperties = { fontSize: 11, color: "#666", padding: "3px 0", fontWeight: 400 };
const TotR: React.CSSProperties = { fontSize: 11, fontWeight: 700, textAlign: "right", color: "#111", padding: "3px 0" };
