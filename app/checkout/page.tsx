"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/lib/cartContext";

type PaymentTab = "card" | "paypal";

export default function CheckoutPage() {
    const { items, subtotal } = useCart();

    // Form state
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("India");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [phone, setPhone] = useState("");
    const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
    const [paymentTab, setPaymentTab] = useState<PaymentTab>("card");
    const [cardNum, setCardNum] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [nameOnCard, setNameOnCard] = useState("");
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);

    const shipping = shippingMethod === "express" ? 2500 : 0;
    const tax = Math.round(subtotal * 0.03);
    const total = subtotal + shipping + tax;

    const steps = [
        { key: "information", label: "Information" },
        { key: "shipping", label: "Shipping" },
        { key: "payment", label: "Payment" },
    ];

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
            <Navbar />

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    {/* ══ LEFT: Form ══ */}
                    <div className="flex-1">
                        {/* Title */}
                        <h1
                            className="text-3xl md:text-4xl mb-4"
                            style={{
                                fontFamily: "var(--font-cormorant), Georgia, serif",
                                color: "#1a1a1a",
                                fontWeight: 500,
                                fontStyle: "italic",
                            }}
                        >
                            Checkout
                        </h1>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 mb-8 text-xs">
                            {steps.map((s, i) => (
                                <span key={s.key} className="flex items-center gap-2">
                                    <span
                                        className="font-semibold uppercase tracking-[0.1em]"
                                        style={{ color: "#c9a84c" }}
                                    >
                                        {s.label}
                                    </span>
                                    {i < steps.length - 1 && (
                                        <span style={{ color: "#ccc" }}>›</span>
                                    )}
                                </span>
                            ))}
                        </div>

                        {/* ── Contact Information ── */}
                        <section className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2
                                    className="text-sm font-bold uppercase tracking-[0.08em]"
                                    style={{ color: "#1a1a1a" }}
                                >
                                    Contact Information
                                </h2>
                                <span className="text-xs" style={{ color: "#999" }}>
                                    Already have an account?{" "}
                                    <Link href="/sign-in" className="font-semibold" style={{ color: "#c9a84c" }}>
                                        Log in
                                    </Link>
                                </span>
                            </div>
                            <InputField
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="Email with name and others"
                            />
                        </section>

                        {/* ── Shipping Address ── */}
                        <section className="mb-8">
                            <h2
                                className="text-sm font-bold uppercase tracking-[0.08em] mb-4"
                                style={{ color: "#1a1a1a" }}
                            >
                                Shipping Address
                            </h2>

                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="First name" value={firstName} onChange={setFirstName} placeholder="First name" />
                                    <InputField label="Last name" value={lastName} onChange={setLastName} placeholder="Last name" />
                                </div>
                                <InputField label="Address" value={address} onChange={setAddress} placeholder="Address" />
                                <InputField
                                    label="Apartment, suite, etc. (optional)"
                                    value={apartment}
                                    onChange={setApartment}
                                    placeholder="Apartment, suite, etc. (optional)"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="City" value={city} onChange={setCity} placeholder="City" />
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                                            Country/Region
                                        </label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3 text-sm outline-none appearance-none transition-all"
                                            style={{ border: "1px solid #e0d5c5", background: "#fff", color: "#333" }}
                                        >
                                            {["India", "United States", "United Kingdom", "UAE", "Singapore", "Australia"].map((c) => (
                                                <option key={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                                            State
                                        </label>
                                        <select
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3 text-sm outline-none appearance-none transition-all"
                                            style={{ border: "1px solid #e0d5c5", background: "#fff", color: "#333" }}
                                        >
                                            <option value="">Select state</option>
                                            {["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal"].map((s) => (
                                                <option key={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField label="ZIP code" value={zip} onChange={setZip} placeholder="ZIP code" />
                                </div>
                                <InputField label="Phone (optional)" type="tel" value={phone} onChange={setPhone} placeholder="Phone (optional)" />
                            </div>
                        </section>

                        {/* ── Shipping Method ── */}
                        <section className="mb-8">
                            <h2
                                className="text-sm font-bold uppercase tracking-[0.08em] mb-4"
                                style={{ color: "#1a1a1a" }}
                            >
                                Shipping Method
                            </h2>
                            <div className="flex flex-col gap-3">
                                <ShippingOption
                                    selected={shippingMethod === "standard"}
                                    onSelect={() => setShippingMethod("standard")}
                                    title="Standard Shipping (5-7 days)"
                                    price="Free"
                                    priceGold
                                />
                                <ShippingOption
                                    selected={shippingMethod === "express"}
                                    onSelect={() => setShippingMethod("express")}
                                    title="Express Shipping (2-3 days)"
                                    price="₹2,500"
                                />
                            </div>
                        </section>

                        {/* ── Payment ── */}
                        <section className="mb-10">
                            <h2
                                className="text-sm font-bold uppercase tracking-[0.08em] mb-2"
                                style={{ color: "#1a1a1a" }}
                            >
                                Payment
                            </h2>
                            <p className="text-xs mb-4" style={{ color: "#999" }}>
                                All transactions are secure and encrypted.
                            </p>

                            {/* Tabs */}
                            <div className="flex gap-3 mb-5">
                                <PaymentTabBtn
                                    active={paymentTab === "card"}
                                    onClick={() => setPaymentTab("card")}
                                    label="Credit Card"
                                    icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <line x1="2" y1="10" x2="22" y2="10" />
                                        </svg>
                                    }
                                />
                                <PaymentTabBtn
                                    active={paymentTab === "paypal"}
                                    onClick={() => setPaymentTab("paypal")}
                                    label="PayPal"
                                    icon={<span className="text-[11px] font-black">PP</span>}
                                />
                            </div>

                            {paymentTab === "card" ? (
                                <div className="flex flex-col gap-4">
                                    <InputField
                                        label="Card number"
                                        value={cardNum}
                                        onChange={(v) =>
                                            setCardNum(
                                                v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
                                            )
                                        }
                                        placeholder="Card number"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Expiration (MM / YY)" value={expiry} onChange={setExpiry} placeholder="MM / YY" />
                                        <InputField label="Security code" value={cvv} onChange={setCvv} placeholder="Security code" />
                                    </div>
                                    <InputField label="Name on card" value={nameOnCard} onChange={setNameOnCard} placeholder="Name on card" />
                                </div>
                            ) : (
                                <div
                                    className="py-8 text-center rounded-lg"
                                    style={{ border: "1px solid #e0d5c5", background: "#fffbf2" }}
                                >
                                    <p className="text-sm" style={{ color: "#6b6b6b" }}>
                                        You will be redirected to PayPal to complete your purchase.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* CTA — mobile only */}
                        <button
                            className="w-full lg:hidden py-4 rounded-lg text-white font-bold text-sm uppercase tracking-[0.15em] mb-6 transition-all hover:opacity-90 cursor-pointer"
                            style={{ background: "#c9a84c" }}
                        >
                            Complete Purchase
                        </button>
                    </div>

                    {/* ══ RIGHT: Order Summary ══ */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div
                            className="rounded-xl p-6 sticky top-24"
                            style={{ background: "#fff", border: "1px solid #e8e3db" }}
                        >
                            <h2
                                className="text-lg font-bold uppercase tracking-[0.08em] mb-5 pb-4"
                                style={{ color: "#1a1a1a", borderBottom: "1px solid #f0e6d0" }}
                            >
                                Order Summary
                            </h2>

                            {/* Products */}
                            <div className="flex flex-col gap-4 mb-6">
                                {items.length === 0 ? (
                                    <p className="text-sm italic" style={{ color: "#aaa" }}>
                                        Your bag is empty.
                                    </p>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-start">
                                            <div
                                                className="relative rounded-lg overflow-hidden flex-shrink-0"
                                                style={{ width: 56, height: 56, background: "#f5ede0" }}
                                            >
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    sizes="56px"
                                                />
                                                {item.quantity > 1 && (
                                                    <span
                                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                                                        style={{ background: "#c9a84c" }}
                                                    >
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold leading-snug truncate" style={{ color: "#1a1a1a" }}>
                                                    {item.name}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#999" }}>
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold flex-shrink-0" style={{ color: "#c9a84c" }}>
                                                ₹{(item.priceNum * item.quantity).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Discount code */}
                            <div className="flex gap-2 mb-5">
                                <input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Discount code"
                                    className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ border: "1px solid #e0d5c5", background: "#faf9f6" }}
                                />
                                <button
                                    onClick={() => discountCode && setDiscountApplied(true)}
                                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:opacity-90 cursor-pointer"
                                    style={{
                                        background: discountApplied ? "#5a8a5a" : "#1a1a1a",
                                        color: "#fff",
                                    }}
                                >
                                    {discountApplied ? "✓" : "Apply"}
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col gap-2.5 pt-4 mb-5" style={{ borderTop: "1px solid #f0e6d0" }}>
                                <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
                                <SummaryRow
                                    label="Shipping"
                                    value={shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "Free"}
                                    valueColor={shipping === 0 ? "#c9a84c" : undefined}
                                />
                                <SummaryRow label="Taxes" value={`₹${tax.toLocaleString("en-IN")}`} />
                            </div>

                            {/* Total */}
                            <div
                                className="flex justify-between items-center pt-4 mb-6"
                                style={{ borderTop: "1px solid #f0e6d0" }}
                            >
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className="text-base font-bold"
                                        style={{
                                            fontFamily: "var(--font-cormorant), Georgia, serif",
                                            color: "#1a1a1a",
                                        }}
                                    >
                                        TOTAL
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "#aaa" }}>
                                        INR
                                    </span>
                                </div>
                                <span className="text-xl font-bold" style={{ color: "#c9a84c" }}>
                                    ₹{total.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* CTA */}
                            <button
                                className="hidden lg:block w-full py-4 rounded-lg text-white font-bold text-sm uppercase tracking-[0.15em] mb-5 transition-all hover:opacity-90 cursor-pointer"
                                style={{ background: "#c9a84c" }}
                            >
                                Complete Purchase
                            </button>

                            {/* Trust badges */}
                            <div className="flex justify-center gap-8 pt-2">
                                {[
                                    { icon: "🔒", label: "Secure Checkout" },
                                    { icon: "📦", label: "Tracked Shipping" },
                                    { icon: "✨", label: "Eco Packaging" },
                                ].map((b) => (
                                    <div key={b.label} className="flex flex-col items-center gap-1">
                                        <span className="text-lg">{b.icon}</span>
                                        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "#999" }}>
                                            {b.label}
                                        </span>
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

/* ── Helper Components ──────────────────────────────────────────────────── */

function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#888" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{ border: "1px solid #e0d5c5", background: "#fff", color: "#333" }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d5c5")}
            />
        </div>
    );
}

function ShippingOption({
    selected,
    onSelect,
    title,
    price,
    priceGold = false,
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    price: string;
    priceGold?: boolean;
}) {
    return (
        <button
            onClick={onSelect}
            className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-left transition-all cursor-pointer"
            style={{
                border: selected ? "2px solid #c9a84c" : "1px solid #e0d5c5",
                background: selected ? "#fffbf2" : "#fff",
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ border: `2px solid ${selected ? "#c9a84c" : "#ccc"}` }}
                >
                    {selected && <div className="w-2 h-2 rounded-full" style={{ background: "#c9a84c" }} />}
                </div>
                <span className="text-sm" style={{ color: "#1a1a1a" }}>
                    {title}
                </span>
            </div>
            <span
                className="text-sm font-bold"
                style={{ color: priceGold ? "#c9a84c" : "#1a1a1a" }}
            >
                {price}
            </span>
        </button>
    );
}

function PaymentTabBtn({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{
                border: active ? "2px solid #c9a84c" : "1px solid #e0d5c5",
                background: active ? "#fffbf2" : "#fff",
                color: active ? "#c9a84c" : "#555",
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function SummaryRow({
    label,
    value,
    valueColor,
}: {
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#888" }}>
                {label}
            </span>
            <span
                className="text-sm font-semibold"
                style={{ color: valueColor ?? "#1a1a1a" }}
            >
                {value}
            </span>
        </div>
    );
}
