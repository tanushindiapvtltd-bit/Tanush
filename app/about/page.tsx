import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
            Crafted in Firozabad,<br />Worn Across India
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

        {/* Welcome Section */}
        <div className="mb-24 p-8 rounded-2xl" style={{ background: "#fff", border: "1px solid #ede8df" }}>
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "#C9A84C" }}>Welcome to Tanush</p>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
            <p>
              At Tanush – a growing name in the world of elegant bangles and bracelets. Founded with a vision to celebrate timeless beauty and modern style, Tanush is a dedicated fashion accessories brand specializing in premium-quality bangles and bracelets. Our headquarters is proudly based in Firozabad, Uttar Pradesh, a city known for its rich heritage in craftsmanship and glass artistry.
            </p>
            <p>
              At Tanush, we aim to blend tradition with contemporary design, offering products that complement every occasion—whether it's daily wear, festive celebrations, or special moments. Each piece is thoughtfully designed to reflect style, durability, and affordability.
            </p>
            <p>
              As a rapidly growing Direct-to-Consumer (D2C) brand, our mission is to build a strong connection with our customers by delivering high-quality products directly to their doorstep. We are committed to innovation, customer satisfaction, and continuous growth in the fashion accessories space.
            </p>
            <p>
              Our vision is to become one of the largest and most trusted bangles and bracelets brands in India by consistently providing trendy designs, reliable quality, and a seamless shopping experience.
            </p>
          </div>
        </div>

        {/* Co-Founders Section */}
        <div className="mt-24 pt-16 border-t" style={{ borderColor: "#ede8df" }}>
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "#C9A84C" }}>Leadership</p>
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>Co-Founders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {["Abhinay Ravi Golus", "Samarth Golus", "Anuska Golus", "Ansh Ravi Golus"].map((founder) => (
              <div key={founder} className="rounded-xl p-6 text-center" style={{ background: "#fff", border: "1px solid #ede8df" }}>
                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{founder}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
