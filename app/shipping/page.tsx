import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "Order Processing",
    content: [
      "All orders are processed within 1–2 business days of payment confirmation.",
      "Orders placed on Sundays or public holidays will be processed the following business day.",
      "You will receive a confirmation email with your order details immediately after placing your order.",
      "Once your order is dispatched, you'll receive a tracking number via email and SMS.",
    ],
  },
  {
    title: "Domestic Shipping (India)",
    content: [
      "We ship to all PIN codes across India via our logistics partner, Delhivery.",
      "Standard delivery: 4–7 business days (most metro cities receive orders in 2–4 days).",
      "Express delivery: 1–3 business days (available for select PIN codes at checkout).",
      "Free standard shipping on all orders above ₹999.",
      "A flat shipping fee of ₹79 applies to orders below ₹999.",
    ],
  },
  {
    title: "International Shipping",
    content: [
      "We currently ship to select international destinations. Please visit our International Shipping page for the full list of supported countries.",
      "International orders typically arrive within 7–14 business days after dispatch.",
      "Customs duties and import taxes are the responsibility of the recipient and are not included in our prices.",
    ],
  },
  {
    title: "Returns Policy",
    content: [
      "We offer a 7-day return window from the date of delivery for most items.",
      "Items must be unused, unworn, and returned in their original packaging with all tags intact.",
      "Customised, engraved, or made-to-order pieces cannot be returned unless defective.",
      "To initiate a return, contact us at support@tanush.in or call 7252866387 within the return window.",
      "Once we receive and inspect the returned item, a refund will be processed within 5–7 business days to your original payment method.",
    ],
  },
  {
    title: "Exchanges",
    content: [
      "We offer exchanges for size or design within 7 days of delivery, subject to stock availability.",
      "Shipping charges for exchanges are borne by the customer.",
      "Contact our team to arrange an exchange before sending the item back.",
    ],
  },
  {
    title: "Damaged or Incorrect Items",
    content: [
      "If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photographs of the item and packaging.",
      "We will arrange a replacement or full refund at no additional cost to you.",
      "Email: support@tanush.in | Phone: 7252866387 (10 AM – 6:30 PM, Mon–Sat)",
    ],
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      <section style={{ background: "#1a1a1a" }}>
        <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>Policies</p>
          <h1 className="text-5xl md:text-6xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            Shipping & Returns
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#888" }}>
            Everything you need to know about delivery timelines, our return policy, and how we handle exchanges.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-10 py-16">
        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid #ede8df" }}>
              <h2 className="text-2xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl p-8 text-center" style={{ background: "#1a1a1a" }}>
          <p className="text-sm mb-1" style={{ color: "#888" }}>Still have questions?</p>
          <h3 className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6" }}>We're here to help</h3>
          <a href="mailto:support@tanush.in" className="inline-block px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-80" style={{ background: "#C9A84C", color: "#fff" }}>
            Contact Support
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
