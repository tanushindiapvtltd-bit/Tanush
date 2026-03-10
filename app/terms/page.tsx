import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using tanush.in, you confirm that you are at least 18 years of age (or have the consent of a parent or guardian) and agree to be bound by these Terms of Service, our Privacy Policy, and any applicable laws and regulations. If you do not agree to these terms, please do not use our website.`,
  },
  {
    title: "Products and Pricing",
    content: `All products listed on tanush.in are subject to availability. Prices are displayed in Indian Rupees (₹) and include applicable GST. We reserve the right to modify prices at any time without prior notice. In the event of a pricing error, we reserve the right to cancel the affected order and issue a full refund.`,
  },
  {
    title: "Orders and Contract",
    content: `Placing an order on tanush.in constitutes an offer to purchase. A legally binding contract is formed only when we send you a shipping confirmation email. We reserve the right to refuse or cancel orders at our discretion — for example, in cases of suspected fraud, inaccurate product information, or stock unavailability.`,
  },
  {
    title: "Payment",
    content: `We accept payments via Razorpay (credit/debit cards, UPI, net banking, and wallets) and Cash on Delivery for eligible orders. All online payments are processed securely. Tanush does not store your payment card details.`,
  },
  {
    title: "Shipping and Delivery",
    content: `Please refer to our Shipping & Returns page for detailed information on delivery timelines, costs, and regions. Delivery timeframes are estimates and not guarantees. Tanush is not responsible for delays caused by third-party logistics providers, customs, or events beyond our control.`,
  },
  {
    title: "Returns and Refunds",
    content: `Our returns and refund policy is detailed on our Shipping & Returns page and forms part of these Terms of Service. By placing an order, you agree to the terms set out in that policy.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on tanush.in — including text, images, logos, product designs, and graphics — is the intellectual property of Tanush and is protected under applicable copyright and trademark law. You may not reproduce, distribute, or use any content from this site without our prior written consent.`,
  },
  {
    title: "User Accounts",
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately at support@tanush.in if you suspect any unauthorised use of your account. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "Product Reviews",
    content: `By submitting a review on tanush.in, you grant us a non-exclusive, royalty-free licence to use, publish, and display your review on our website and marketing materials. Reviews must be genuine and based on your personal experience. We reserve the right to remove reviews that contain offensive content or violate our guidelines.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, Tanush shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability for any claim arising out of or related to a purchase shall not exceed the amount paid for the relevant product.`,
  },
  {
    title: "Governing Law",
    content: `These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Mathura, Uttar Pradesh, India.`,
  },
  {
    title: "Changes to These Terms",
    content: `We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated date. Continued use of our website following any changes constitutes your acceptance of the revised terms.`,
  },
  {
    title: "Contact",
    content: `For questions regarding these Terms of Service, please contact us at:\n\nTanush Fine Jewellery\n64 Sheikh Latif Sunrise Plaza, Sadar Bazar, Mathura, Uttar Pradesh — 283203\nEmail: support@tanush.in\nPhone: 7252866387`,
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
