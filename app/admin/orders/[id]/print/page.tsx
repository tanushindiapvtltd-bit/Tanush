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
            .then((data) => {
                setOrder(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!loading && order && !printed.current) {
            printed.current = true;
            setTimeout(() => window.print(), 400);
        }
    }, [loading, order]);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ fontFamily: "sans-serif", color: "#666" }}>Loading label...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <p style={{ fontFamily: "sans-serif", color: "#666" }}>Order not found.</p>
            </div>
        );
    }

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <>
            <style>{`
                @media print {
                    @page { size: A5 landscape; margin: 8mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
                * { box-sizing: border-box; }
                body { margin: 0; padding: 0; background: #fff; font-family: 'Helvetica Neue', Arial, sans-serif; }
            `}</style>

            {/* Print button - hidden when printing */}
            <div className="no-print" style={{ padding: "12px 20px", background: "#f5f5f5", borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 12 }}>
                <button
                    onClick={() => window.print()}
                    style={{ padding: "8px 20px", background: "#c9a84c", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.06em" }}
                >
                    Print / Save PDF
                </button>
                <button
                    onClick={() => window.close()}
                    style={{ padding: "8px 16px", background: "#fff", color: "#666", border: "1px solid #ddd", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                    Close
                </button>
            </div>

            {/* Label */}
            <div style={{ maxWidth: 800, margin: "20px auto", padding: "0 16px" }}>
                <div style={{ border: "2px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>

                    {/* Header */}
                    <div style={{ background: "#1a1a1a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <p style={{ color: "#c9a84c", fontWeight: 800, fontSize: 20, letterSpacing: "0.12em", margin: 0 }}>TANUSH</p>
                            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.15em", margin: "2px 0 0" }}>PACKING LABEL</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0 }}>{order.orderNumber}</p>
                            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, margin: "2px 0 0" }}>{orderDate}</p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                        {/* Ship To */}
                        <div style={{ padding: "16px 20px", borderRight: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8" }}>
                            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Ship To</p>
                            <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", margin: "0 0 3px" }}>{order.shippingName}</p>
                            <p style={{ fontSize: 12, color: "#444", margin: "0 0 2px" }}>{order.shippingAddress}{order.shippingApartment ? `, ${order.shippingApartment}` : ""}</p>
                            <p style={{ fontSize: 12, color: "#444", margin: "0 0 2px" }}>{order.shippingCity}, {order.shippingState} – {order.shippingZip}</p>
                            <p style={{ fontSize: 12, color: "#444", margin: "0 0 6px" }}>{order.shippingCountry}</p>
                            {order.shippingPhone && <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>+91 {order.shippingPhone}</p>}
                        </div>

                        {/* Order Info */}
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8" }}>
                            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Order Info</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <InfoRow label="Payment" value={order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"} />
                                <InfoRow label="Status" value={order.status} />
                                {order.deliveryTracking?.trackingNumber && (
                                    <InfoRow label="Tracking" value={order.deliveryTracking.trackingNumber} />
                                )}
                                {order.deliveryTracking?.carrier && (
                                    <InfoRow label="Carrier" value={order.deliveryTracking.carrier} />
                                )}
                                <InfoRow label="Total" value={`₹${order.total.toLocaleString("en-IN")}`} bold />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ padding: "16px 20px" }}>
                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#888", marginBottom: 10, textTransform: "uppercase" }}>Items Ordered</p>

                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
                                    <th style={{ textAlign: "left", paddingBottom: 6, color: "#888", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em" }}>PRODUCT</th>
                                    <th style={{ textAlign: "center", paddingBottom: 6, color: "#888", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", width: 65 }}>SIZE</th>
                                    <th style={{ textAlign: "center", paddingBottom: 6, color: "#888", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", width: 80 }}>COLOR</th>
                                    <th style={{ textAlign: "left", paddingBottom: 6, color: "#888", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", width: 100 }}>SKU</th>
                                    <th style={{ textAlign: "center", paddingBottom: 6, color: "#888", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", width: 40 }}>QTY</th>
                                    <th style={{ textAlign: "right", paddingBottom: 6, color: "#888", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", width: 80 }}>PRICE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: idx < order.items.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                                        <td style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ position: "relative", width: 36, height: 36, borderRadius: 6, overflow: "hidden", border: "1px solid #e8e8e8", flexShrink: 0 }}>
                                                <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: "cover" }} sizes="36px" />
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3 }}>{item.productName}</span>
                                        </td>
                                        <td style={{ textAlign: "center", padding: "8px 0", verticalAlign: "middle" }}>
                                            {item.size ? (
                                                <span style={{ background: "#fff8e7", border: "1px solid #c9a84c", color: "#a07820", fontWeight: 700, fontSize: 11, padding: "2px 7px", borderRadius: 4 }}>
                                                    {item.size}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#ccc", fontSize: 11 }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "center", padding: "8px 0", verticalAlign: "middle" }}>
                                            {item.color ? (
                                                <span style={{ background: "#eef2ff", border: "1px solid #aab8e8", color: "#3a4a8a", fontWeight: 600, fontSize: 11, padding: "2px 7px", borderRadius: 4 }}>
                                                    {item.color}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#ccc", fontSize: 11 }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "8px 0", verticalAlign: "middle" }}>
                                            {item.sku ? (
                                                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555", background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>
                                                    {item.sku}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#ccc", fontSize: 11 }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "center", padding: "8px 0", verticalAlign: "middle" }}>
                                            <span style={{ background: "#1a1a1a", color: "#fff", fontWeight: 800, fontSize: 12, padding: "3px 9px", borderRadius: 4, display: "inline-block" }}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#1a1a1a", verticalAlign: "middle" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ borderTop: "2px solid #e8e8e8", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "flex-end" }}>
                            <div style={{ minWidth: 200, display: "flex", flexDirection: "column", gap: 4 }}>
                                <TotalRow label="Subtotal" value={`₹${order.subtotal.toLocaleString("en-IN")}`} />
                                <TotalRow label="Shipping" value={`₹${order.shippingCost.toLocaleString("en-IN")}`} />
                                <TotalRow label="Tax (3%)" value={`₹${order.tax.toLocaleString("en-IN")}`} />
                                <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 4, marginTop: 2 }}>
                                    <TotalRow label="Total" value={`₹${order.total.toLocaleString("en-IN")}`} bold />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ background: "#faf9f6", borderTop: "1px solid #e8e8e8", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>Thank you for your order!</p>
                        <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>Printed: {new Date().toLocaleDateString("en-IN")}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: bold ? 700 : 600, color: bold ? "#c9a84c" : "#1a1a1a" }}>{value}</span>
        </div>
    );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ fontSize: 11, color: bold ? "#1a1a1a" : "#888", fontWeight: bold ? 700 : 400 }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: bold ? 700 : 600, color: bold ? "#c9a84c" : "#1a1a1a" }}>{value}</span>
        </div>
    );
}
