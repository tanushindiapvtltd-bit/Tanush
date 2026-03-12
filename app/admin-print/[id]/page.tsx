"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

interface OrderItem {
    id: string;
    productName: string;
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
    total: number;
    shippingName: string;
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

interface SellerConfig {
    sellerName: string;
    returnAddress: string;
    returnCity: string;
    returnPin: string;
    returnState: string;
    returnPhone: string;
    gstin: string;
}

export default function PrintLabelPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [seller, setSeller] = useState<SellerConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const printed = useRef(false);

    useEffect(() => {
        document.body.style.background = "#fff";
        document.body.style.margin = "0";
    }, []);

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/orders/${id}`).then(r => { if (!r.ok) throw new Error("Order not found"); return r.json(); }),
            fetch(`/api/admin/label-config`).then(r => r.json()),
        ])
            .then(([orderData, sellerData]) => {
                setOrder(orderData);
                setSeller(sellerData);
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (!loading && order && !printed.current) {
            printed.current = true;
            setTimeout(() => window.print(), 500);
        }
    }, [loading, order]);

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <p style={{ fontFamily: "Arial, sans-serif", color: "#555" }}>Loading label…</p>
        </div>
    );
    if (error || !order) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <p style={{ fontFamily: "Arial, sans-serif", color: "#c00" }}>{error || "Order not found"}</p>
        </div>
    );

    const waybill = order.deliveryTracking?.trackingNumber ?? "";
    const carrier = order.deliveryTracking?.carrier ?? "";
    const isPrepaid = order.paymentMethod !== "COD";
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });

    const sellerName = seller?.sellerName ?? "Tanush India";
    const returnAddress = seller?.returnAddress ?? "";
    const returnCity = seller?.returnCity ?? "";
    const returnPin = seller?.returnPin ?? "";
    const returnState = seller?.returnState ?? "";

    return (
        <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", minHeight: "100vh" }}>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @media print {
                    @page { size: A5 portrait; margin: 5mm; }
                    body { background: #fff !important; }
                    .no-print { display: none !important; }
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                table { border-collapse: collapse; width: 100%; }
                td, th { padding: 0; }
            `}</style>

            {/* Toolbar */}
            <div className="no-print" style={{ background: "#1a1a1a", padding: "10px 20px", display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => window.print()} style={{ padding: "7px 20px", background: "#c9a84c", color: "#111", border: "none", borderRadius: 6, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                    Print / Save PDF
                </button>
                <button onClick={() => window.close()} style={{ padding: "7px 14px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Close
                </button>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{order.orderNumber}</span>
            </div>

            {/* ── LABEL ── */}
            <div style={{ maxWidth: 560, margin: "20px auto", border: "2px solid #000", fontSize: 11 }}>

                {/* Row 1: Customer Address + Waybill */}
                <table style={{ borderBottom: "2px solid #000" }}>
                    <tbody>
                        <tr>
                            {/* Customer Address */}
                            <td style={{ width: "60%", padding: "10px 12px", borderRight: "2px solid #000", verticalAlign: "top" }}>
                                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#555", marginBottom: 5, textTransform: "uppercase" }}>Customer Address</div>
                                <div style={{ fontWeight: 900, fontSize: 14, textTransform: "uppercase", marginBottom: 3 }}>{order.shippingName}</div>
                                <div style={{ fontSize: 11, lineHeight: 1.55, color: "#222" }}>
                                    {order.shippingAddress}
                                    {order.shippingApartment ? `, ${order.shippingApartment}` : ""}
                                </div>
                                <div style={{ fontSize: 11, lineHeight: 1.55, color: "#222" }}>
                                    {order.shippingCity}, {order.shippingState}, {order.shippingZip}
                                </div>
                                {order.shippingPhone && (
                                    <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>{order.shippingPhone}</div>
                                )}
                            </td>

                            {/* Waybill + Brand */}
                            <td style={{ width: "40%", padding: "10px 12px", verticalAlign: "top", textAlign: "center" }}>
                                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#555", marginBottom: 6, textTransform: "uppercase" }}>Waybill</div>
                                {waybill ? (
                                    <>
                                        {/* Simple barcode-style visual */}
                                        <div style={{ display: "flex", justifyContent: "center", gap: 1, marginBottom: 6 }}>
                                            {waybill.split("").map((ch, i) => (
                                                <div key={i} style={{
                                                    width: ch.charCodeAt(0) % 2 === 0 ? 2 : 1,
                                                    height: 32,
                                                    background: "#000",
                                                }} />
                                            ))}
                                        </div>
                                        <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>{waybill}</div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 10, color: "#aaa" }}>No waybill</div>
                                )}
                                <div style={{ marginTop: 10, fontWeight: 900, fontSize: 13, letterSpacing: "0.12em" }}>TANUSH</div>
                                <div style={{ fontSize: 8, color: "#888", letterSpacing: "0.15em" }}>JEWELLERY</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Row 2: Payment type + Carrier */}
                <table style={{ borderBottom: "2px solid #000" }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "60%", padding: "8px 12px", borderRight: "2px solid #000", verticalAlign: "middle" }}>
                                {isPrepaid ? (
                                    <div style={{ fontWeight: 800, fontSize: 12, color: "#000" }}>
                                        Prepaid: <span style={{ fontWeight: 400 }}>Do not collect cash</span>
                                    </div>
                                ) : (
                                    <div style={{ fontWeight: 800, fontSize: 12, color: "#000" }}>
                                        COD: <span style={{ fontWeight: 400 }}>Collect ₹{order.total.toLocaleString("en-IN")}</span>
                                    </div>
                                )}
                            </td>
                            <td style={{ width: "40%", padding: "8px 12px", verticalAlign: "middle", textAlign: "center" }}>
                                {carrier && (
                                    <div style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase" }}>{carrier}</div>
                                )}
                                <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>Pickup</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Row 3: Return address */}
                <table style={{ borderBottom: "2px solid #000" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "8px 12px", verticalAlign: "top" }}>
                                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#555", marginBottom: 5, textTransform: "uppercase" }}>If undelivered, return to:</div>
                                <div style={{ fontWeight: 800, fontSize: 12 }}>{sellerName}</div>
                                {returnAddress && (
                                    <div style={{ fontSize: 11, color: "#222", lineHeight: 1.55, marginTop: 2 }}>
                                        {returnAddress}
                                    </div>
                                )}
                                {(returnCity || returnState || returnPin) && (
                                    <div style={{ fontSize: 11, color: "#222", lineHeight: 1.55 }}>
                                        {returnCity}{returnCity && returnState ? ", " : ""}{returnState}{returnPin ? " – " + returnPin : ""}
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Row 4: Order date + Order number */}
                <table style={{ borderBottom: "2px solid #000" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "6px 12px", borderRight: "2px solid #000", width: "50%" }}>
                                <span style={{ fontSize: 9, color: "#555" }}>Order Date: </span>
                                <span style={{ fontSize: 10, fontWeight: 700 }}>{orderDate}</span>
                            </td>
                            <td style={{ padding: "6px 12px", width: "50%" }}>
                                <span style={{ fontSize: 9, color: "#555" }}>Order No: </span>
                                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "Courier New, monospace" }}>{order.orderNumber}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Row 5: Product Details */}
                <div style={{ padding: "8px 12px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#555", marginBottom: 6, textTransform: "uppercase" }}>Product Details</div>

                    <table>
                        <thead>
                            <tr style={{ borderBottom: "1.5px solid #000", background: "#f2f2f2" }}>
                                <th style={{ textAlign: "left", padding: "5px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>SKU</th>
                                <th style={{ textAlign: "center", padding: "5px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", width: 46 }}>SIZE</th>
                                <th style={{ textAlign: "center", padding: "5px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", width: 36 }}>QTY</th>
                                <th style={{ textAlign: "center", padding: "5px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", width: 70 }}>COLOR</th>
                                <th style={{ textAlign: "left", padding: "5px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>ORDER NO.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={item.id} style={{
                                    borderBottom: idx < order.items.length - 1 ? "1px solid #ddd" : "none",
                                    background: idx % 2 === 0 ? "#fff" : "#fafafa",
                                }}>
                                    <td style={{ padding: "6px 6px", fontSize: 10, fontWeight: 700, fontFamily: "Courier New, monospace" }}>
                                        {item.sku || <span style={{ color: "#bbb" }}>—</span>}
                                    </td>
                                    <td style={{ textAlign: "center", padding: "6px 6px", fontSize: 11, fontWeight: 800 }}>
                                        {item.size || <span style={{ color: "#bbb", fontSize: 10 }}>—</span>}
                                    </td>
                                    <td style={{ textAlign: "center", padding: "6px 6px" }}>
                                        <span style={{ display: "inline-block", background: "#111", color: "#fff", fontWeight: 900, fontSize: 12, padding: "2px 8px", borderRadius: 3, minWidth: 24, textAlign: "center" }}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center", padding: "6px 6px", fontSize: 10, fontWeight: 600 }}>
                                        {item.color || <span style={{ color: "#bbb" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "6px 6px", fontSize: 9, fontFamily: "Courier New, monospace", color: "#333" }}>
                                        {order.orderNumber}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ borderTop: "2px solid #000", padding: "6px 12px", background: "#f8f8f8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#666" }}>Printed: {new Date().toLocaleDateString("en-IN")}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>TANUSH JEWELLERY</span>
                </div>
            </div>
        </div>
    );
}
