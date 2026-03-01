"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";

type Step = "information" | "shipping" | "payment";
type PaymentTab = "card" | "upi";
type ShippingMethod = "express" | "courier";

export default function CheckoutPage() {
    const { items, subtotal } = useCart();

    // Step state
    const [step, setStep] = useState<Step>("information");

    // Form state
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [country, setCountry] = useState("India");
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("express");
    const [paymentTab, setPaymentTab] = useState<PaymentTab>("card");
    const [cardNum, setCardNum] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [upiId, setUpiId] = useState("");
    const [promo, setPromo] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);

    const courierFee = shippingMethod === "courier" ? 450 : 0;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + courierFee + tax;

    const steps: Step[] = ["information", "shipping", "payment"];
    const stepIdx = steps.indexOf(step);

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: "#faf9f6", fontFamily: "'Segoe UI', sans-serif" }}
        >
            {/* ── Minimal header ── */}
            <header
                className="w-full sticky top-0 z-50 flex items-center justify-between px-8 py-4"
                style={{ background: "#fff", borderBottom: "1px solid #e8e3db" }}
            >
                <Link href="/">
                    <Image
                        src="/tanush-logo-transparent.png"
                        alt="Tanush"
                        width={160}
                        height={42}
                        style={{ objectFit: "contain" }}
                        priority
                    />
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#4a4a4a" }}>
                    <Link href="/collections" className="hover:text-[#c8a045] transition-colors">Collections</Link>
                    <Link href="/about" className="hover:text-[#c8a045] transition-colors">About</Link>
                    <Link href="/journal" className="hover:text-[#c8a045] transition-colors">Journal</Link>
                </nav>
                <Link href="/cart" aria-label="Cart">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#4a4a4a" strokeWidth={1.8}>
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
                    </svg>
                </Link>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-10">
                {/* ── Step breadcrumb ── */}
                <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-[0.15em]">
                    {steps.map((s, i) => (
                        <span key={s} className="flex items-center gap-2">
                            <span
                                style={{ color: i <= stepIdx ? "#c8a045" : "#bbb", cursor: i < stepIdx ? "pointer" : "default" }}
                                onClick={() => i < stepIdx && setStep(s)}
                            >
                                {s}
                            </span>
                            {i < steps.length - 1 && <span style={{ color: "#ccc" }}>›</span>}
                        </span>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* ══ LEFT: Form ══ */}
                    <div className="flex-1">
                        <h1
                            className="text-4xl mb-8"
                            style={{ fontFamily: "Georgia, serif", color: "#1a0a00", fontStyle: "italic" }}
                        >
                            Checkout
                        </h1>

                        {/* ── Contact Information ── */}
                        <section className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-base font-semibold" style={{ color: "#1a0a00" }}>
                                    Contact Information
                                </h2>
                                <span className="text-xs" style={{ color: "#888" }}>
                                    Already have an account?{" "}
                                    <Link href="/sign-in" className="font-semibold" style={{ color: "#c8a045" }}>
                                        Log in
                                    </Link>
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                <FormField label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 99999 00000" />
                            </div>
                        </section>

                        {/* ── Shipping Address ── */}
                        <section className="mb-8">
                            <h2 className="text-base font-semibold mb-4" style={{ color: "#1a0a00" }}>
                                Shipping Address
                            </h2>

                            <div className="flex flex-col gap-4">
                                <FormField label="Full Name" value={name} onChange={setName} placeholder="Jane Doe" fullWidth />
                                <FormField label="Street Address" value={street} onChange={setStreet} placeholder="123 Main Street, Apt 4B" fullWidth />

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <FormField label="City" value={city} onChange={setCity} placeholder="Mumbai" />
                                    <FormField label="ZIP / PIN Code" value={zip} onChange={setZip} placeholder="400001" />
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>
                                            Country
                                        </label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3 text-sm outline-none appearance-none"
                                            style={{ border: "1px solid #ddd", background: "#fff", color: "#333" }}
                                        >
                                            {["India", "United States", "United Kingdom", "UAE", "Singapore", "Australia"].map((c) => (
                                                <option key={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Shipping Method ── */}
                        <section className="mb-8">
                            <h2 className="text-base font-semibold mb-4" style={{ color: "#1a0a00" }}>
                                Shipping Method
                            </h2>

                            <div className="flex flex-col gap-3">
                                <ShippingOption
                                    id="express"
                                    selected={shippingMethod === "express"}
                                    onSelect={() => setShippingMethod("express")}
                                    title="Complimentary Express"
                                    subtitle="3-5 Business Days · Fully Insured"
                                    price="Free"
                                    priceIsGold
                                />
                                <ShippingOption
                                    id="courier"
                                    selected={shippingMethod === "courier"}
                                    onSelect={() => setShippingMethod("courier")}
                                    title="White-Glove Courier"
                                    subtitle="Next Day Delivery · Hand-Delivered"
                                    price="₹450"
                                />
                            </div>
                        </section>

                        {/* ── Payment ── */}
                        <section className="mb-10">
                            <h2 className="text-base font-semibold mb-4" style={{ color: "#1a0a00" }}>
                                Payment
                            </h2>

                            {/* Tabs */}
                            <div className="flex gap-3 mb-4">
                                <PaymentTabBtn
                                    active={paymentTab === "card"}
                                    onClick={() => setPaymentTab("card")}
                                    icon={
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <rect x="2" y="5" width="20" height="14" rx="2" />
                                            <line x1="2" y1="10" x2="22" y2="10" />
                                        </svg>
                                    }
                                    label="Credit / Debit Card"
                                />
                                <PaymentTabBtn
                                    active={paymentTab === "upi"}
                                    onClick={() => setPaymentTab("upi")}
                                    icon={<span className="text-xs font-black">UPI</span>}
                                    label="UPI"
                                />
                            </div>

                            {paymentTab === "card" ? (
                                <div className="flex flex-col gap-4">
                                    <FormField
                                        label="Card Number"
                                        value={cardNum}
                                        onChange={(v) => setCardNum(v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                                        placeholder="0000 0000 0000 0000"
                                        fullWidth
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Expiry Date" value={expiry} onChange={setExpiry} placeholder="MM / YY" />
                                        <FormField label="Security Code" value={cvv} onChange={setCvv} placeholder="CVV" />
                                    </div>
                                </div>
                            ) : (
                                <FormField
                                    label="UPI ID"
                                    value={upiId}
                                    onChange={setUpiId}
                                    placeholder="yourname@upi"
                                    fullWidth
                                />
                            )}
                        </section>
                    </div>

                    {/* ══ RIGHT: Order Summary ══ */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div
                            className="rounded-xl p-6 sticky top-24"
                            style={{ background: "#fff", border: "1px solid #e8d5b0" }}
                        >
                            <h2
                                className="text-xl mb-5 pb-4"
                                style={{ fontFamily: "Georgia, serif", color: "#1a0a00", borderBottom: "1px solid #f0e6d0" }}
                            >
                                Order Summary
                            </h2>

                            {/* Cart items */}
                            <div className="flex flex-col gap-4 mb-6">
                                {items.length === 0 ? (
                                    <p className="text-sm text-[#aaa] italic">Your bag is empty.</p>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-start">
                                            <div
                                                className="relative rounded-lg overflow-hidden flex-shrink-0"
                                                style={{ width: 60, height: 60, background: "#f5ede0" }}
                                            >
                                                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="60px" />
                                                {/* Qty badge */}
                                                <span
                                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                                                    style={{ background: "#c8a045" }}
                                                >
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold leading-snug truncate" style={{ color: "#1a0a00" }}>
                                                    {item.name}
                                                </p>
                                                <p className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: "#999" }}>
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold flex-shrink-0" style={{ color: "#b84c00" }}>
                                                {item.priceNum * item.quantity >= 1000
                                                    ? `₹${(item.priceNum * item.quantity).toLocaleString("en-IN")}`
                                                    : `₹${item.priceNum * item.quantity}`}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Promo code */}
                            <div className="flex gap-2 mb-5">
                                <input
                                    type="text"
                                    value={promo}
                                    onChange={(e) => setPromo(e.target.value)}
                                    placeholder="Promo Code"
                                    className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ border: "1px solid #ddd", background: "#faf9f6" }}
                                />
                                <button
                                    onClick={() => promo && setPromoApplied(true)}
                                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:opacity-90"
                                    style={{ background: promoApplied ? "#5a8a5a" : "#1a0a00", color: "#fff" }}
                                >
                                    {promoApplied ? "✓" : "Apply"}
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col gap-2.5 mb-5" style={{ borderTop: "1px solid #f0e6d0", paddingTop: "16px" }}>
                                <SummaryLine label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
                                <SummaryLine
                                    label="Shipping"
                                    value={courierFee > 0 ? `₹${courierFee}` : "COMPLIMENTARY"}
                                    valueStyle={{ color: "#c8a045", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.06em" }}
                                />
                                <SummaryLine label="Estimated Taxes" value={`₹${tax.toLocaleString("en-IN")}`} />
                            </div>

                            {/* Total */}
                            <div
                                className="flex justify-between items-center pt-4 mb-6"
                                style={{ borderTop: "1px solid #f0e6d0" }}
                            >
                                <div>
                                    <span className="text-base font-bold" style={{ fontFamily: "Georgia, serif", color: "#1a0a00" }}>
                                        Total
                                    </span>
                                    <span className="text-[10px] ml-2 uppercase tracking-wider" style={{ color: "#aaa" }}>INR</span>
                                </div>
                                <span className="text-xl font-bold" style={{ color: "#b84c00" }}>
                                    ₹{total.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* CTA */}
                            <button
                                className="w-full py-4 rounded-lg text-white font-bold text-sm uppercase tracking-widest mb-4 transition-all hover:opacity-90"
                                style={{ background: "#c8a045", letterSpacing: "0.15em" }}
                            >
                                Complete Purchase
                            </button>

                            {/* Trust badges */}
                            <div className="flex justify-center gap-8">
                                <TrustBadge icon="🔒" label="Secure Checkout" />
                                <TrustBadge icon="✨" label="Eco-Packaging" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Minimal footer ── */}
            <footer
                className="w-full py-5 px-8 flex flex-col sm:flex-row items-center justify-between gap-2"
                style={{ borderTop: "1px solid #e8e3db", background: "#fff" }}
            >
                <p className="text-xs" style={{ color: "#aaa" }}>
                    © {new Date().getFullYear()} Tanush. All rights reserved.
                </p>
                <div className="flex gap-6">
                    <Link href="/privacy" className="text-xs hover:text-[#c8a045] transition-colors" style={{ color: "#aaa" }}>Privacy Policy</Link>
                    <Link href="/terms" className="text-xs hover:text-[#c8a045] transition-colors" style={{ color: "#aaa" }}>Terms of Service</Link>
                    <Link href="/contact" className="text-xs hover:text-[#c8a045] transition-colors" style={{ color: "#aaa" }}>Contact Us</Link>
                </div>
            </footer>
        </div>
    );
}

// ── Helper components ─────────────────────────────────────────────────────────

function FormField({
    label, value, onChange, placeholder, type = "text", fullWidth = false,
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; fullWidth?: boolean;
}) {
    return (
        <div className={fullWidth ? "w-full" : ""}>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#888" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                    border: "1px solid #ddd",
                    background: "#fff",
                    color: "#333",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c8a045")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
        </div>
    );
}

function ShippingOption({
    id, selected, onSelect, title, subtitle, price, priceIsGold = false,
}: {
    id: string; selected: boolean; onSelect: () => void;
    title: string; subtitle: string; price: string; priceIsGold?: boolean;
}) {
    return (
        <button
            onClick={onSelect}
            className="w-full flex items-center justify-between px-4 py-4 rounded-lg text-left transition-all"
            style={{
                border: selected ? "2px solid #c8a045" : "1px solid #e0d5c5",
                background: selected ? "#fffbf2" : "#fff",
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ border: `2px solid ${selected ? "#c8a045" : "#ccc"}` }}
                >
                    {selected && <div className="w-2 h-2 rounded-full" style={{ background: "#c8a045" }} />}
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1a0a00" }}>{title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#999" }}>{subtitle}</p>
                </div>
            </div>
            <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: priceIsGold ? "#c8a045" : "#1a0a00" }}
            >
                {price}
            </span>
        </button>
    );
}

function PaymentTabBtn({
    active, onClick, icon, label,
}: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{
                border: active ? "2px solid #1a0a00" : "1px solid #e0d5c5",
                background: active ? "#1a0a00" : "#fff",
                color: active ? "#fff" : "#555",
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function SummaryLine({
    label, value, valueStyle,
}: {
    label: string; value: string; valueStyle?: React.CSSProperties;
}) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider" style={{ color: "#888" }}>{label}</span>
            <span className="text-sm font-semibold" style={{ color: "#1a0a00", ...valueStyle }}>{value}</span>
        </div>
    );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#888" }}>{label}</span>
        </div>
    );
}
