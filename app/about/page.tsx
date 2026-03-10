import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

const values = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.4}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0c0 0 3 3 3 9s-3 9-3 9m0-18c0 0-3 3-3 9s3 9 3 9M3 12h18" />
      </svg>
    ),
    title: "Rooted in Craft",
    desc: "Every bangle begins as raw metal in the hands of a skilled artisan. Our craftspeople carry generations of knowledge, shaping each piece with patience and pride.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.4}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Made with Intention",
    desc: "We don't mass-produce. Each collection is designed with meaning — from the motifs we choose to the metals we source — every detail carries a story.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.4}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Uncompromising Quality",
    desc: "We use only hallmarked gold, certified silver, and ethically sourced gemstones. Quality is not a promise — it is the foundation of everything we do.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.4}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Community First",
    desc: "Tanush was built in Mathura, and we remain committed to our community — employing local artisans, supporting traditional techniques, and giving back to the city that shaped us.",
  },
];

const milestones = [
  { year: "2008", text: "Tanush is founded in Sadar Bazar, Mathura, with a single workshop and two artisans." },
  { year: "2013", text: "Launch of the first signature bangle collection — Vrindavan Series — inspired by the sacred geometry of temple art." },
  { year: "2017", text: "Expanded to a dedicated studio. Our team grows to 40+ craftspeople." },
  { year: "2020", text: "Launched tanush.in, bringing handcrafted jewellery to customers across India." },
  { year: "2024", text: "Over 50,000 bangles shipped. Continued commitment to craft, quality, and community." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "#1a1a1a" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%), radial-gradient(circle at 80% 50%, #C9A84C 0%, transparent 50%)`,
        }} />
        <div className="relative w-full max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>Our Story</p>
          <h1 className="text-5xl md:text-7xl mb-6 leading-tight" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            Crafted in Mathura,<br />Worn Across India
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, #C9A84C)" }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, #C9A84C)" }} />
          </div>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#999" }}>
            For over fifteen years, Tanush has been a quiet custodian of India's most cherished jewellery tradition — the bangle.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-10 py-20">

        {/* Story section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "#C9A84C" }}>Who We Are</p>
            <h2 className="text-4xl md:text-5xl mb-6 leading-tight" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>
              A Family Business,<br />A Living Tradition
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
              <p>
                Tanush was founded in 2008 by the Singh family in the heart of Sadar Bazar, Mathura — a city that has been synonymous with fine craftsmanship for centuries. What began as a small atelier with a handful of artisans has grown into one of North India's most respected bangle houses.
              </p>
              <p>
                Our name, Tanush, comes from the Sanskrit word for the body — a reminder that jewellery is not merely ornament, but an extension of the self. We believe the bangles you wear carry your energy, your moments, your identity.
              </p>
              <p>
                Every piece we create is a collaboration between the designer's vision and the artisan's hands. We preserve techniques passed down through generations while embracing contemporary aesthetics that speak to the modern Indian woman.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/5]" style={{ background: "#ede8df" }}>
              <div className="w-full h-full flex items-center justify-center">
                <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={0.8} opacity={0.3}>
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
              </div>
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-6 -left-6 rounded-xl px-6 py-4 shadow-xl" style={{ background: "#fff", border: "1px solid #ede8df" }}>
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#C9A84C" }}>15+</p>
              <p className="text-xs mt-0.5" style={{ color: "#888" }}>Years of Craft</p>
            </div>
            <div className="absolute -top-6 -right-6 rounded-xl px-6 py-4 shadow-xl" style={{ background: "#fff", border: "1px solid #ede8df" }}>
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#C9A84C" }}>50K+</p>
              <p className="text-xs mt-0.5" style={{ color: "#888" }}>Bangles Crafted</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "#C9A84C" }}>What We Stand For</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid #ede8df" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "#faf9f6" }}>
                  {v.icon}
                </div>
                <h3 className="text-xl mb-3 font-semibold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#1a1a1a" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "#C9A84C" }}>Our Journey</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>Milestones</h2>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-[72px] top-0 bottom-0 w-px" style={{ background: "#ede8df" }} />
            <div className="space-y-10">
              {milestones.map((m) => (
                <div key={m.year} className="flex gap-8 items-start">
                  <div className="text-right flex-shrink-0 w-14">
                    <span className="text-sm font-bold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#C9A84C" }}>{m.year}</span>
                  </div>
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full border-2 z-10 relative" style={{ background: "#fff", borderColor: "#C9A84C" }} />
                  </div>
                  <p className="text-sm leading-relaxed pt-0.5" style={{ color: "#4a4a4a" }}>{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
