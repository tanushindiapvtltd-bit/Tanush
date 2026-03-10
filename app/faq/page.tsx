"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqs = [
  {
    category: "Orders & Payment",
    items: [
      { q: "How do I place an order?", a: "Browse our collections, add items to your cart, and proceed to checkout. You can pay via Razorpay (cards, UPI, net banking, wallets) or choose Cash on Delivery." },
      { q: "Can I modify or cancel my order after placing it?", a: "You can modify or cancel your order within 2 hours of placing it by contacting us at support@tanush.in or calling 7252866387. Once an order is dispatched, it cannot be cancelled." },
      { q: "Is it safe to pay online on tanush.in?", a: "Yes. All payments are processed through Razorpay, which is PCI-DSS compliant and uses industry-standard SSL encryption. We do not store your card details." },
      { q: "Do you offer Cash on Delivery?", a: "Yes, COD is available for domestic orders. Please note that COD orders may take an additional 1 business day to process." },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      { q: "How long will my order take to arrive?", a: "Standard domestic shipping takes 4–7 business days. Metro cities often receive orders in 2–4 days. You'll receive a tracking number once your order is dispatched." },
      { q: "Do you ship internationally?", a: "Yes! We ship to over 20 countries including the USA, UK, UAE, Australia, and Singapore. Visit our International Shipping page for full details and rates." },
      { q: "How do I track my order?", a: "Once dispatched, you'll receive a tracking number via email and SMS. You can track your order on the Delhivery website or in your Tanush account under 'My Orders'." },
      { q: "What if my order is delayed?", a: "Occasionally, logistics delays may occur due to weather, festivals, or high demand. If your order is significantly delayed beyond the estimated timeframe, please contact us and we'll investigate." },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      { q: "What is your return policy?", a: "We offer a 7-day return window from the date of delivery. Items must be unused, in original packaging, and with all tags intact. Customised or engraved pieces are non-returnable." },
      { q: "How do I initiate a return?", a: "Email support@tanush.in with your order number and reason for return, or call 7252866387 (10 AM – 6:30 PM, Mon–Sat). We'll guide you through the return process." },
      { q: "When will I receive my refund?", a: "Once we receive and inspect the returned item, your refund will be processed within 5–7 business days to your original payment method." },
      { q: "Can I exchange an item for a different size?", a: "Yes, subject to stock availability. Contact us within 7 days of delivery to arrange an exchange. Shipping for exchanges is borne by the customer." },
    ],
  },
  {
    category: "Products & Care",
    items: [
      { q: "Are your bangles genuine gold/silver?", a: "Yes. We use only hallmarked gold (22KT and 18KT) and 92.5 sterling silver. Each piece comes with a certificate of authenticity." },
      { q: "How do I find my bangle size?", a: "To find your bangle size, gently press your thumb and little finger together and measure the widest point of your hand in centimetres. Refer to our size guide at checkout for exact conversions." },
      { q: "How do I care for my bangles?", a: "Store your bangles separately in the provided pouch to avoid scratches. Clean gold bangles with a soft cloth. Avoid exposure to perfumes, lotions, and harsh chemicals. Read our full care guide in the Tanush Journal." },
      { q: "Do you offer custom or personalised bangles?", a: "Yes, we accept custom orders for engravings and special designs. Please contact us at support@tanush.in with your requirements. Custom orders typically take 10–15 business days." },
    ],
  },
  {
    category: "Account & Wishlist",
    items: [
      { q: "Do I need an account to shop?", a: "You can browse without an account, but you'll need to sign in to place an order, track purchases, manage your wishlist, and leave reviews." },
      { q: "I forgot my password. What do I do?", a: "Click 'Forgot Password' on the sign-in page. We'll send a reset link to your registered email address." },
      { q: "How does the Wishlist work?", a: "Add items to your Wishlist by clicking the heart icon on any product. Your Wishlist is saved to your account so it's always accessible when you're signed in." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #ede8df" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer transition-colors"
        style={{ background: open ? "#fff" : "#faf9f6" }}
      >
        <span className="text-sm font-medium pr-4" style={{ color: "#1a1a1a" }}>{q}</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={2} className="flex-shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1" style={{ background: "#fff" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      <section style={{ background: "#1a1a1a" }}>
        <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>Help Centre</p>
          <h1 className="text-5xl md:text-6xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            FAQs & Support
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#888" }}>
            Find answers to our most common questions. Can't find what you need? We're just a message away.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-10 py-16">

        <div className="space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-4 h-px" style={{ background: "#C9A84C" }} />
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "#C9A84C" }}>{section.category}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 rounded-2xl p-10 text-center" style={{ background: "#1a1a1a" }}>
          <h3 className="text-3xl mb-3" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6" }}>
            Still need help?
          </h3>
          <p className="text-sm mb-6" style={{ color: "#888" }}>Our support team is available Mon–Sat, 10 AM to 6:30 PM.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:support@tanush.in" className="px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-80" style={{ background: "#C9A84C", color: "#fff" }}>
              Email Us
            </a>
            <a href="tel:7252866387" className="px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-80" style={{ background: "transparent", color: "#faf9f6", border: "1px solid #444" }}>
              Call Us
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
