import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const countries = [
  { region: "South Asia", list: ["United Arab Emirates", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman"] },
  { region: "North America", list: ["United States", "Canada"] },
  { region: "Europe", list: ["United Kingdom", "Germany", "France", "Netherlands", "Switzerland", "Sweden"] },
  { region: "Asia Pacific", list: ["Australia", "New Zealand", "Singapore", "Malaysia"] },
];

const faqs = [
  { q: "How long does international delivery take?", a: "Most international orders arrive within 7–14 business days after dispatch. Delivery times may vary depending on customs processing in your country." },
  { q: "Are customs duties included in the price?", a: "No. Import duties, taxes, and customs clearance fees are the responsibility of the recipient. These vary by country and are not within our control." },
  { q: "Can I track my international order?", a: "Yes. You'll receive a tracking number by email once your order is dispatched. International shipments are tracked end-to-end." },
  { q: "Can I return an international order?", a: "Yes, within 7 days of delivery. The cost of return shipping is borne by the customer for international returns, unless the item is defective." },
  { q: "My country isn't on the list — can you still ship?", a: "We're constantly expanding. Email us at support@tanush.in and we'll check if we can accommodate your location." },
];

export default function InternationalShippingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      <section style={{ background: "#1a1a1a" }}>
        <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>We Ship Worldwide</p>
          <h1 className="text-5xl md:text-6xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            International Shipping
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#888" }}>
            Tanush jewellery now ships to over 20 countries. Wherever you are, Indian craft can find you.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-10 py-16">

        {/* Rates table */}
        <div className="rounded-2xl overflow-hidden mb-12" style={{ background: "#fff", border: "1px solid #ede8df" }}>
          <div className="px-8 py-6" style={{ borderBottom: "1px solid #ede8df" }}>
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>Shipping Rates & Timelines</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "#ede8df" }}>
            {[
              { zone: "GCC Countries", time: "5–8 business days", rate: "₹599", free: "₹8,000+" },
              { zone: "USA & Canada", time: "8–12 business days", rate: "₹999", free: "₹12,000+" },
              { zone: "UK & Europe", time: "7–11 business days", rate: "₹999", free: "₹12,000+" },
              { zone: "Australia & NZ", time: "10–14 business days", rate: "₹1,199", free: "₹15,000+" },
              { zone: "Singapore & Malaysia", time: "6–10 business days", rate: "₹699", free: "₹10,000+" },
            ].map((row) => (
              <div key={row.zone} className="grid grid-cols-2 md:grid-cols-4 px-8 py-4 text-sm gap-2">
                <span className="font-medium" style={{ color: "#1a1a1a" }}>{row.zone}</span>
                <span style={{ color: "#4a4a4a" }}>{row.time}</span>
                <span style={{ color: "#4a4a4a" }}>{row.rate} flat fee</span>
                <span style={{ color: "#C9A84C" }}>Free above {row.free}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="mb-12">
          <h2 className="text-2xl mb-6" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>Countries We Ship To</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {countries.map(({ region, list }) => (
              <div key={region} className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #ede8df" }}>
                <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>{region}</p>
                <div className="flex flex-wrap gap-2">
                  {list.map((c) => (
                    <span key={c} className="text-xs px-3 py-1.5 rounded-full" style={{ background: "#faf9f6", color: "#4a4a4a", border: "1px solid #ede8df" }}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important notes */}
        <div className="rounded-2xl p-7 mb-12" style={{ background: "#fffbf0", border: "1px solid #f0e0a0" }}>
          <div className="flex gap-3">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.5} className="flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1a1a1a" }}>Important for International Orders</p>
              <ul className="space-y-1.5">
                {[
                  "Customs duties and import taxes are not included in our prices and are the buyer's responsibility.",
                  "Some countries may restrict import of gold/silver jewellery — please check your local regulations.",
                  "We declare the actual value of the item on customs forms; we are unable to under-declare.",
                  "Delays due to customs inspections are outside our control.",
                ].map((note, i) => (
                  <li key={i} className="text-xs leading-relaxed" style={{ color: "#4a4a4a" }}>• {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-2xl mb-6" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #ede8df" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1a1a1a" }}>{faq.q}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>{faq.a}</p>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
