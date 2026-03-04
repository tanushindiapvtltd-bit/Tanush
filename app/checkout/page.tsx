"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/lib/cartContext";
import PincodeChecker from "@/components/PincodeChecker";

type PaymentMethod = "COD" | "RAZORPAY";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => { open(): void };
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    prefill: { name: string; email: string; contact: string };
    theme: { color: string };
    modal: { ondismiss: () => void };
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(typeof window.Razorpay === "function");
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function CheckoutPage() {
    const { data: session } = useSession();
    const { items, subtotal, clearCart, hydrated } = useCart();
    const router = useRouter();

    // Form state — initialized empty, pre-filled when session loads
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [city, setCity] = useState("");
    const [country] = useState("India");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [phone, setPhone] = useState("");
    const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentCancelled, setPaymentCancelled] = useState(false);

    // Pre-fill form fields when session loads (handles async auth)
    useEffect(() => {
        if (session?.user) {
            if (!email && session.user.email) setEmail(session.user.email);
            if (!firstName && session.user.name) {
                const parts = session.user.name.split(" ");
                setFirstName(parts[0] ?? "");
                setLastName(parts.slice(1).join(" ") ?? "");
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.email]);

    // Redirect if cart is empty after localStorage hydration
    useEffect(() => {
        if (hydrated && items.length === 0) {
            router.replace("/collections");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated, items.length]);

    const shipping = shippingMethod === "express" ? 2500 : 0;
    const tax = Math.round(subtotal * 0.03);
    const total = subtotal + shipping + tax;

    const getFormData = () => ({
        shippingName: `${firstName} ${lastName}`.trim(),
        shippingEmail: email,
        shippingPhone: phone || null,
        shippingAddress: address,
        shippingApartment: apartment || null,
        shippingCity: city,
        shippingState: state,
        shippingZip: zip,
        shippingCountry: country,
        shippingMethod,
        subtotal,
        shippingCost: shipping,
        tax,
        total,
        items: items.map((i) => ({
            productId: i.id,
            productName: i.name,
            productImage: i.image,
            price: i.priceNum,
            quantity: i.quantity,
        })),
    });

    const validateForm = () => {
        if (!firstName || !lastName || !email || !address || !city || !state || !zip) {
            setError("Please fill in all required fields.");
            return false;
        }
        if (items.length === 0) {
            setError("Your cart is empty.");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return false;
        }
        if (!/^\d{6}$/.test(zip)) {
            setError("PIN code must be exactly 6 digits.");
            return false;
        }
        if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
            setError("Please enter a valid 10-digit Indian mobile number.");
            return false;
        }
        return true;
    };

    const handleCOD = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...getFormData(), paymentMethod: "COD" }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Failed to place order"); return; }
            clearCart();
            router.push(`/orders/${data.id}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpay = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");
        setPaymentCancelled(false);

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            setError("Payment gateway is not configured. Please contact support.");
            setLoading(false);
            return;
        }

        try {
            // Load Razorpay SDK
            const loaded = await loadRazorpayScript();
            if (!loaded || !window.Razorpay) { setError("Failed to load payment gateway. Please disable any ad blockers and try again."); return; }

            // Create Razorpay order on server — send items so server recalculates total
            const rpRes = await fetch("/api/payment/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
                    shippingMethod,
                }),
            });
            const rpData = await rpRes.json();
            if (!rpRes.ok) { setError(rpData.error ?? "Payment gateway error"); return; }

            // Track whether the payment success handler has fired
            let paymentHandled = false;

            // Open Razorpay modal — DB order is only created AFTER payment succeeds
            const options: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: rpData.amount,
                currency: rpData.currency,
                name: "Tanush",
                description: "Jewellery Purchase",
                order_id: rpData.orderId,
                handler: async (response) => {
                    paymentHandled = true;
                    setLoading(true);
                    try {
                        // Payment captured — now create the DB order
                        const orderRes = await fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...getFormData(),
                                paymentMethod: "RAZORPAY",
                                razorpayOrderId: response.razorpay_order_id,
                            }),
                        });
                        const orderData = await orderRes.json();
                        if (!orderRes.ok) {
                            setError(`Payment received but order saving failed. Please contact support with your payment ID: ${response.razorpay_payment_id}`);
                            setLoading(false);
                            return;
                        }

                        // Verify payment signature server-side
                        const verifyRes = await fetch("/api/payment/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                orderId: orderData.id,
                            }),
                        });
                        if (verifyRes.ok) {
                            clearCart();
                            router.push(`/orders/${orderData.id}`);
                        } else {
                            setLoading(false);
                            setError("Payment verification failed. Please contact support with payment ID: " + response.razorpay_payment_id);
                        }
                    } catch {
                        setLoading(false);
                        setError(`Payment received but order saving failed. Please contact support with payment ID: ${response.razorpay_payment_id}`);
                    }
                },
                prefill: {
                    name: `${firstName} ${lastName}`.trim(),
                    email,
                    contact: phone,
                },
                theme: { color: "#c9a84c" },
                modal: {
                    ondismiss: () => {
                        // Only show cancelled if payment handler never fired
                        if (!paymentHandled) {
                            setPaymentCancelled(true);
                            setLoading(false);
                        }
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("[Razorpay] Error:", err);
            setError("Failed to open payment gateway. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentMethod === "COD") {
            handleCOD();
        } else {
            handleRazorpay();
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    {/* ══ LEFT: Form ══ */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl mb-8"
                            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#1a1a1a", fontWeight: 500, fontStyle: "italic" }}>
                            Checkout
                        </h1>

                        <form onSubmit={handleSubmit}>
                            {/* Contact */}
                            <section className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={{ color: "#1a1a1a" }}>Contact Information</h2>
                                    {!session && (
                                        <span className="text-xs" style={{ color: "#999" }}>
                                            <Link href="/sign-in" className="font-semibold" style={{ color: "#c9a84c" }}>Log in</Link> for faster checkout
                                        </span>
                                    )}
                                </div>
                                <InputField label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
                            </section>

                            {/* Shipping Address */}
                            <section className="mb-8">
                                <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-4" style={{ color: "#1a1a1a" }}>Shipping Address</h2>
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="First name" value={firstName} onChange={setFirstName} placeholder="First name" required />
                                        <InputField label="Last name" value={lastName} onChange={setLastName} placeholder="Last name" required />
                                    </div>
                                    <InputField label="Address" value={address} onChange={setAddress} placeholder="Street address" required />
                                    <InputField label="Apartment, suite, etc. (optional)" value={apartment} onChange={setApartment} placeholder="Apartment, suite, etc." />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="City" value={city} onChange={setCity} placeholder="City" required />
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>State *</label>
                                            <select value={state} onChange={(e) => setState(e.target.value)} required
                                                className="w-full rounded-lg px-4 py-3 text-sm outline-none appearance-none"
                                                style={{ border: "1px solid #e0d5c5", background: "#fff", color: state ? "#333" : "#aaa" }}>
                                                <option value="">Select state</option>
                                                {["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"].map((s) => (
                                                    <option key={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="PIN code" value={zip} onChange={setZip} placeholder="PIN code" required />
                                        <InputField label="Phone (optional)" type="tel" value={phone} onChange={setPhone} placeholder="Phone number" />
                                    </div>
                                </div>
                            </section>

                            {/* Shipping Method */}
                            <section className="mb-8">
                                <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-4" style={{ color: "#1a1a1a" }}>Shipping Method</h2>
                                <div className="flex flex-col gap-3">
                                    <ShippingOption selected={shippingMethod === "standard"} onSelect={() => setShippingMethod("standard")}
                                        title="Standard Shipping (5-7 days)" price="Free" priceGold />
                                    <ShippingOption selected={shippingMethod === "express"} onSelect={() => setShippingMethod("express")}
                                        title="Express Shipping (2-3 days)" price="₹2,500" />
                                </div>
                            </section>

                            {/* Payment */}
                            <section className="mb-10">
                                <h2 className="text-sm font-bold uppercase tracking-[0.08em] mb-2" style={{ color: "#1a1a1a" }}>Payment Method</h2>
                                <p className="text-xs mb-4" style={{ color: "#999" }}>All transactions are secure and encrypted.</p>

                                <div className="flex gap-3 mb-5">
                                    <PaymentTabBtn
                                        active={paymentMethod === "RAZORPAY"}
                                        onClick={() => setPaymentMethod("RAZORPAY")}
                                        label="Pay Online (Razorpay)"
                                        icon={<span className="text-[11px] font-black" style={{ color: "#1a73e8" }}>⚡</span>}
                                    />
                                    <PaymentTabBtn
                                        active={paymentMethod === "COD"}
                                        onClick={() => setPaymentMethod("COD")}
                                        label="Cash on Delivery"
                                        icon={<span className="text-sm">💵</span>}
                                    />
                                </div>

                                {paymentMethod === "RAZORPAY" && (
                                    <div className="rounded-lg p-4" style={{ border: "1px solid #e0d5c5", background: "#fffbf2" }}>
                                        <p className="text-sm" style={{ color: "#555" }}>
                                            You will be redirected to Razorpay secure checkout. Pay via UPI, card, net banking, or wallets.
                                        </p>
                                        <div className="flex gap-2 mt-3 text-xs" style={{ color: "#888" }}>
                                            <span>🔒 Secure</span>
                                            <span>·</span>
                                            <span>💳 Cards</span>
                                            <span>·</span>
                                            <span>📱 UPI</span>
                                            <span>·</span>
                                            <span>🏦 Net Banking</span>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "COD" && (
                                    <div className="rounded-lg p-4" style={{ border: "1px solid #e0d5c5", background: "#f9fdf9" }}>
                                        <p className="text-sm" style={{ color: "#555" }}>
                                            Pay with cash when your order is delivered. Additional ₹50 COD fee may apply.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {paymentCancelled && (
                                <div className="mb-4 p-4 rounded-lg" style={{ background: "#fff8e6", border: "1px solid #f5c842" }}>
                                    <p className="text-sm font-semibold mb-1" style={{ color: "#a06000" }}>Payment was not completed</p>
                                    <p className="text-xs" style={{ color: "#7a5200" }}>
                                        No order has been placed. You can try again whenever you&apos;re ready.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setPaymentCancelled(false); handleRazorpay(); }}
                                        className="mt-3 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg text-white transition-all hover:opacity-90 cursor-pointer"
                                        style={{ background: "#c9a84c" }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: "#fce4ec", color: "#b71c1c", border: "1px solid #f48fb1" }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className="w-full lg:hidden py-4 rounded-lg text-white font-bold text-sm uppercase tracking-[0.15em] mb-6 transition-all hover:opacity-90 cursor-pointer disabled:opacity-50"
                                style={{ background: "#c9a84c" }}
                            >
                                {loading ? "Processing..." : paymentMethod === "COD" ? "Place Order" : "Pay Now"}
                            </button>
                        </form>
                    </div>

                    {/* ══ RIGHT: Order Summary ══ */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="rounded-xl p-6 sticky top-24" style={{ background: "#fff", border: "1px solid #e8e3db" }}>
                            <h2 className="text-lg font-bold uppercase tracking-[0.08em] mb-5 pb-4" style={{ color: "#1a1a1a", borderBottom: "1px solid #f0e6d0" }}>
                                Order Summary
                            </h2>

                            {/* Products */}
                            <div className="flex flex-col gap-4 mb-6">
                                {items.length === 0 ? (
                                    <p className="text-sm italic" style={{ color: "#aaa" }}>
                                        Your bag is empty.{" "}
                                        <Link href="/collections" className="font-semibold" style={{ color: "#c9a84c" }}>Shop now</Link>
                                    </p>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-start">
                                            <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 56, height: 56, background: "#f5ede0" }}>
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="56px" />
                                                {item.quantity > 1 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: "#c9a84c" }}>
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold leading-snug truncate" style={{ color: "#1a1a1a" }}>{item.name}</p>
                                                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#999" }}>{item.subtitle}</p>
                                            </div>
                                            <p className="text-sm font-bold flex-shrink-0" style={{ color: "#c9a84c" }}>
                                                ₹{(item.priceNum * item.quantity).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Discount */}
                            <div className="flex gap-2 mb-5">
                                <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Discount code"
                                    className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ border: "1px solid #e0d5c5", background: "#faf9f6" }} />
                                <button
                                    type="button"
                                    onClick={() => discountCode && setDiscountApplied(true)}
                                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:opacity-90 cursor-pointer"
                                    style={{ background: discountApplied ? "#5a8a5a" : "#1a1a1a", color: "#fff" }}>
                                    {discountApplied ? "✓" : "Apply"}
                                </button>
                            </div>

                            {/* Delivery EDD check */}
                            <div className="mb-4">
                                <PincodeChecker compact />
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col gap-2.5 pt-4 mb-5" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
                                <SummaryRow label="Shipping" value={shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "Free"} valueColor={shipping === 0 ? "#c9a84c" : undefined} />
                                <SummaryRow label="Taxes (3%)" value={`₹${tax.toLocaleString("en-IN")}`} />
                            </div>

                            <div className="flex justify-between items-center pt-4 mb-6" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-base font-bold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#1a1a1a" }}>TOTAL</span>
                                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "#aaa" }}>INR</span>
                                </div>
                                <span className="text-xl font-bold" style={{ color: "#c9a84c" }}>₹{total.toLocaleString("en-IN")}</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit as unknown as React.MouseEventHandler}
                                disabled={loading || items.length === 0}
                                className="hidden lg:block w-full py-4 rounded-lg text-white font-bold text-sm uppercase tracking-[0.15em] mb-5 transition-all hover:opacity-90 cursor-pointer disabled:opacity-50"
                                style={{ background: "#c9a84c" }}
                            >
                                {loading ? "Processing..." : paymentMethod === "COD" ? "Place Order" : "Pay Now"}
                            </button>

                            <div className="flex justify-center gap-8 pt-2">
                                {[{ icon: "🔒", label: "Secure Checkout" }, { icon: "📦", label: "Tracked Shipping" }, { icon: "✨", label: "Eco Packaging" }].map((b) => (
                                    <div key={b.label} className="flex flex-col items-center gap-1">
                                        <span className="text-lg">{b.icon}</span>
                                        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "#999" }}>{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ── Helper Components ─────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = "text", required = false }:
    { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
    return (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                {label}{required && " *"}
            </label>
            <input
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder} required={required}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{ border: "1px solid #e0d5c5", background: "#fff", color: "#333" }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d5c5")}
            />
        </div>
    );
}

function ShippingOption({ selected, onSelect, title, price, priceGold = false }:
    { selected: boolean; onSelect: () => void; title: string; price: string; priceGold?: boolean }) {
    return (
        <button type="button" onClick={onSelect}
            className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-left transition-all cursor-pointer"
            style={{ border: selected ? "2px solid #c9a84c" : "1px solid #e0d5c5", background: selected ? "#fffbf2" : "#fff" }}>
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${selected ? "#c9a84c" : "#ccc"}` }}>
                    {selected && <div className="w-2 h-2 rounded-full" style={{ background: "#c9a84c" }} />}
                </div>
                <span className="text-sm" style={{ color: "#1a1a1a" }}>{title}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: priceGold ? "#c9a84c" : "#1a1a1a" }}>{price}</span>
        </button>
    );
}

function PaymentTabBtn({ active, onClick, icon, label }:
    { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button type="button" onClick={onClick}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{ border: active ? "2px solid #c9a84c" : "1px solid #e0d5c5", background: active ? "#fffbf2" : "#fff", color: active ? "#c9a84c" : "#555" }}>
            {icon}{label}
        </button>
    );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#888" }}>{label}</span>
            <span className="text-sm font-semibold" style={{ color: valueColor ?? "#1a1a1a" }}>{value}</span>
        </div>
    );
}
