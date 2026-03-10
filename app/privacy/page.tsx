import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "Information We Collect",
    content: `When you create an account or place an order on tanush.in, we collect information such as your name, email address, shipping address, phone number, and payment details. We may also collect information about how you use our website, including browsing behaviour and device data, through cookies and similar technologies.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your personal information to process and fulfil your orders, send order confirmations and shipping updates, respond to your enquiries, personalise your shopping experience, and send you promotional communications (only with your consent). We do not sell your personal data to third parties.`,
  },
  {
    title: "Sharing of Information",
    content: `We share your information with trusted service providers who assist us in operating our website and conducting our business — including payment processors (Razorpay), logistics partners (Delhivery), and email services (Resend). These parties are contractually obligated to keep your information confidential and use it only to provide their respective services.`,
  },
  {
    title: "Cookies",
    content: `Tanush.in uses cookies to enhance your browsing experience, remember your preferences, and understand how visitors interact with our site. You can control cookie settings through your browser. Disabling cookies may affect some features of our website.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted via SSL. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "Data Retention",
    content: `We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law. You may request deletion of your account and associated data at any time by contacting support@tanush.in.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to access, correct, or delete the personal data we hold about you. You may also object to or restrict certain types of processing, or withdraw consent for marketing communications at any time. To exercise any of these rights, please contact us at support@tanush.in.`,
  },
  {
    title: "Children's Privacy",
    content: `Our website is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your information.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions or concerns about this Privacy Policy, please contact us at:\n\nTanush Fine Jewellery\n64 Sheikh Latif Sunrise Plaza, Sadar Bazar, Mathura, Uttar Pradesh — 283203\nEmail: support@tanush.in\nPhone: 7252866387 (10 AM – 6:30 PM, Mon–Sat)`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      <section style={{ background: "#1a1a1a" }}>
        <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>Legal</p>
          <h1 className="text-5xl md:text-6xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            Privacy Policy
          </h1>
          <p className="text-xs mt-2" style={{ color: "#666" }}>Last updated: March 10, 2026</p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-10 py-16">
        <p className="text-sm leading-relaxed mb-10 p-6 rounded-xl" style={{ color: "#4a4a4a", background: "#fff", border: "1px solid #ede8df" }}>
          At Tanush, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you visit tanush.in or make a purchase from us. By using our website, you consent to the practices described in this policy.
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
