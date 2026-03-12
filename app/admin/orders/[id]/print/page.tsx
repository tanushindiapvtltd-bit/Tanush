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
    deliveryTracking: {
        trackingNumber: string | null;
        carrier: string | null;
    } | null;
}

export default function PrintLabelPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const printed = useRef(false);

    useEffect(() => {
        fetch(`/api/admin/orders/${id}`)
            .then((r) => r.json())
            .then((data) => { setOrder(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!loading && order && !printed.current) {
            printed.current = true;
            setTimeout(() => window.print(), 400);
        }
    }, [loading, order]);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <p style={{ fontFamily: "sans-serif", color: "#666" }}>Loading label...</p>
        </div>
    );

    if (!order) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <p style={{ fontFamily: "sans-serif", color: "#666" }}>Order not found.</p>
        </div>
    );

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <>
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #fff; font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; }
                table { border-collapse: collapse; width: 100%; }
                th, td { padding: 0; }
            `}</style>

            {/* Toolbar */}
            <div className="no-print" style={{ padding: "10px 20px", background: "#f5f5f5", borderBottom: "1px solid #ddd", display: "flex", gap: 10 }}>
                <button onClick={() => window.print()}
                    style={{ padding: "8px 20px", background: "#c9a84c", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Print / Save PDF
                </button>
                <button onClick={() => window.close()}
                    style={{ padding: "8px 16px", background: "#fff", color: "#666", border: "1px solid #ddd", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Close
                </button>
            </div>

            {/* Label */}
            <div style={{ maxWidth: 760, margin: "20px auto", padding: "0 16px" }}>
                <div style={{ border: "2px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>

                    {/* ── Header ── */}
                    <div style={{ background: "#1a1a1a", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ color: "#c9a84c", fontWeight: 900, fontSize: 22, letterSpacing: "0.12em" }}>TANUSH</div>
                            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: "0.2em", marginTop: 2 }}>PACKING SLIP</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{order.orderNumber}</div>
                            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 2 }}>{orderDate}</div>
                        </div>
                    </div>

                    {/* ── Address + Order Info ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        <div style={{ padding: "14px 20px", borderRight: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8" }}>
                            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Ship To</div>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{order.shippingName}</div>
                            <div style={{ fontSize: 12, color: "#444", marginBottom: 2 }}>
                                {order.shippingAddress}{order.shippingApartment ? `, ${order.shippingApartment}` : ""}
                            </div>
                            <div style={{ fontSize: 12, color: "#444", marginBottom: 2 }}>
                                {order.shippingCity}, {order.shippingState} – {order.shippingZip}
                            </div>
                            <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>{order.shippingCountry}</div>
                            {order.shippingPhone && (
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{order.shippingPhone}</div>
                            )}
                        </div>

                        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e8e8e8" }}>
                            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Order Info</div>
                            <table>
                                <tbody>
                                    {[
                                        ["Payment", order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"],
                                        ["Status", order.status],
                                        ...(order.deliveryTracking?.trackingNumber ? [["Tracking", order.deliveryTracking.trackingNumber]] : []),
                                        ...(order.deliveryTracking?.carrier ? [["Carrier", order.deliveryTracking.carrier]] : []),
                                        ["Total", `₹${order.total.toLocaleString("en-IN")}`],
                                    ].map(([label, value]) => (
                                        <tr key={label}>
                                            <td style={{ fontSize: 11, color: "#888", paddingBottom: 4, paddingRight: 16, whiteSpace: "nowrap" }}>{label}</td>
                                            <td style={{ fontSize: 11, fontWeight: label === "Total" ? 800 : 600, color: label === "Total" ? "#c9a84c" : "#1a1a1a", paddingBottom: 4 }}>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Items Table ── */}
                    <div style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#888", marginBottom: 10, textTransform: "uppercase" }}>
                            Items Ordered ({order.items.length})
                        </div>

                        <table style={{ fontSize: 12 }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #1a1a1a" }}>
                                    <th style={{ textAlign: "left", paddingBottom: 7, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333" }}>PRODUCT</th>
                                    <th style={{ textAlign: "center", paddingBottom: 7, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333", width: 60 }}>SIZE</th>
                                    <th style={{ textAlign: "center", paddingBottom: 7, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333", width: 80 }}>COLOR</th>
                                    <th style={{ textAlign: "center", paddingBottom: 7, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333", width: 95 }}>SKU</th>
                                    <th style={{ textAlign: "center", paddingBottom: 7, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333", width: 40 }}>QTY</th>
                                    <th style={{ textAlign: "right", paddingBottom: 7, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#333", width: 80 }}>PRICE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: idx < order.items.length - 1 ? "1px solid #ebebeb" : "none" }}>
                                        {/* Product */}
                                        <td style={{ paddingTop: 10, paddingBottom: 10, verticalAlign: "middle" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ position: "relative", width: 38, height: 38, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd", flexShrink: 0 }}>
                                                    <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="38px" />
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.35 }}>{item.productName}</span>
                                            </div>
                                        </td>
                                        {/* Size */}
                                        <td style={{ textAlign: "center", paddingTop: 10, paddingBottom: 10, verticalAlign: "middle" }}>
                                            {item.size
                                                ? <span style={{ display: "inline-block", background: "#fff8e7", border: "1.5px solid #c9a84c", color: "#7a5800", fontWeight: 800, fontSize: 11, padding: "3px 8px", borderRadius: 4 }}>{item.size}</span>
                                                : <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                                            }
                                        </td>
                                        {/* Color */}
                                        <td style={{ textAlign: "center", paddingTop: 10, paddingBottom: 10, verticalAlign: "middle" }}>
                                            {item.color
                                                ? <span style={{ display: "inline-block", background: "#eef2ff", border: "1.5px solid #7986cb", color: "#303f9f", fontWeight: 700, fontSize: 11, padding: "3px 8px", borderRadius: 4 }}>{item.color}</span>
                                                : <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                                            }
                                        </td>
                                        {/* SKU */}
                                        <td style={{ textAlign: "center", paddingTop: 10, paddingBottom: 10, verticalAlign: "middle" }}>
                                            {item.sku
                                                ? <span style={{ display: "inline-block", fontFamily: "monospace", fontSize: 11, color: "#333", background: "#f3f3f3", border: "1px solid #ddd", padding: "3px 7px", borderRadius: 4 }}>{item.sku}</span>
                                                : <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                                            }
                                        </td>
                                        {/* Qty */}
                                        <td style={{ textAlign: "center", paddingTop: 10, paddingBottom: 10, verticalAlign: "middle" }}>
                                            <span style={{ display: "inline-block", background: "#1a1a1a", color: "#fff", fontWeight: 900, fontSize: 13, padding: "3px 10px", borderRadius: 4, minWidth: 28 }}>{item.quantity}</span>
                                        </td>
                                        {/* Price */}
                                        <td style={{ textAlign: "right", paddingTop: 10, paddingBottom: 10, verticalAlign: "middle", fontWeight: 700, fontSize: 12 }}>
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── Totals ── */}
                        <div style={{ borderTop: "2px solid #1a1a1a", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
                            <table style={{ width: 220 }}>
                                <tbody>
                                    {[
                                        ["Subtotal", `₹${order.subtotal.toLocaleString("en-IN")}`, false],
                                        ["Shipping", `₹${order.shippingCost.toLocaleString("en-IN")}`, false],
                                        ["Tax (3%)", `₹${order.tax.toLocaleString("en-IN")}`, false],
                                        ["TOTAL", `₹${order.total.toLocaleString("en-IN")}`, true],
                                    ].map(([label, value, bold]) => (
                                        <tr key={String(label)} style={{ borderTop: bold ? "2px solid #1a1a1a" : "none" }}>
                                            <td style={{ fontSize: bold ? 13 : 11, fontWeight: bold ? 800 : 400, color: bold ? "#1a1a1a" : "#666", paddingTop: bold ? 6 : 3, paddingBottom: bold ? 2 : 3, letterSpacing: bold ? "0.05em" : 0 }}>{label}</td>
                                            <td style={{ fontSize: bold ? 14 : 11, fontWeight: 800, color: bold ? "#c9a84c" : "#1a1a1a", textAlign: "right", paddingTop: bold ? 6 : 3, paddingBottom: bold ? 2 : 3 }}>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{ background: "#f8f8f8", borderTop: "1px solid #e8e8e8", padding: "9px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#aaa" }}>Thank you for your order!</span>
                        <span style={{ fontSize: 10, color: "#aaa" }}>Printed: {new Date().toLocaleDateString("en-IN")}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
