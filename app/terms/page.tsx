import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "Introduction",
    content: `Welcome to Tanush. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully before making any purchase.`,
  },
  {
    title: "Products",
    content: `We specialize in selling fashion accessories including bangles, bracelets, and related jewelry items.
- All products are subject to availability.
- We reserve the right to discontinue any product at any time without notice.
- Product images are for illustration purposes; actual product color/design may vary slightly.`,
  },
  {
    title: "Pricing & Payments",
    content: `- All prices are listed in INR (₹) and may include applicable taxes unless stated otherwise.
- We reserve the right to change prices at any time without prior notice.
- Payments must be made through approved payment methods available on the website.`,
  },
  {
    title: "Orders & Confirmation",
    content: `- Once an order is placed, you will receive an order confirmation via email/SMS.
- We reserve the right to cancel or refuse any order due to product unavailability, payment issues, or suspected fraudulent activity.`,
  },
  {
    title: "Shipping & Delivery",
    content: `- Orders are processed and shipped within 3 working days.
- Delivery timelines may vary depending on location and courier services.
- We are not responsible for delays caused by external logistics partners.`,
  },
  {
    title: "Returns & Exchanges",
    content: `- Returns or exchanges are accepted within 3 days of delivery.
- Products must be unused, in original packaging, and in resalable condition.
- Items that are damaged due to misuse or wear and tear are not eligible.
- Refunds will be processed within 7 working days after product inspection and approval.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website is the property of Tanush and is protected by applicable laws.`,
  },
  {
    title: "User Responsibilities",
    content: `Users agree not to misuse the website and provide accurate information.`,
  },
  {
    title: "Limitation of Liability",
    content: `Tanush shall not be liable for indirect damages or misuse of products.`,
  },
  {
    title: "Privacy Policy",
    content: `Your use of this website is also governed by our Privacy Policy.`,
  },
  {
    title: "Governing Law",
    content: `These Terms shall be governed by the laws of India. Jurisdiction: Firozabad, Uttar Pradesh.`,
  },
  {
    title: "Changes to Terms",
    content: `We reserve the right to update these terms at any time.`,
  },
  {
    title: "Contact Us",
    content: `Email: Tanush.india.pvtltd@gmail.com\nPhone: 9407459668\n\nBy using our website, you agree to these Terms & Conditions.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      <section style={{ background: "#1a1a1a" }}>
        <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>Legal</p>
          <h1 className="text-5xl md:text-6xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            Terms of Service
          </h1>
          <p className="text-xs mt-2" style={{ color: "#666" }}>Last updated: March 10, 2026</p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-10 py-16">
        <p className="text-sm leading-relaxed mb-10 p-6 rounded-xl" style={{ color: "#4a4a4a", background: "#fff", border: "1px solid #ede8df" }}>
          Please read these Terms of Service carefully before using tanush.in. These terms govern your use of our website and the purchase of products from Tanush Fine Jewellery. By using our site, you agree to these terms in full.
        </p>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-xl mb-3 font-semibold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#1a1a1a" }}>
                {i + 1}. {s.title}
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#4a4a4a" }}>{s.content}</p>
              <div className="mt-6 h-px" style={{ background: "#ede8df" }} />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
