import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const stores = [
  {
    id: 1,
    name: "Tanush — Sadar Bazar Flagship",
    type: "Flagship Store",
    address: "64 Sheikh Latif Sunrise Plaza, Sadar Bazar, Mathura, Uttar Pradesh — 281001",
    phone: "7252866387",
    hours: "Mon – Sat: 10:00 AM – 7:30 PM\nSun: 11:00 AM – 6:00 PM",
    mapUrl: "https://maps.google.com/?q=Sadar+Bazar+Mathura+UP",
  },
];

const StoreIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

export default function StoreLocatorPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#faf9f6" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "#1a1a1a" }}>
        <div className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] mb-5" style={{ color: "#C9A84C" }}>Visit Us</p>
          <h1 className="text-5xl md:text-6xl mb-5" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#faf9f6", fontWeight: 400 }}>
            Find a Tanush Store
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#888" }}>
            Experience our collections in person. Our stores are crafted to reflect the warmth and beauty of our jewellery.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-10 py-16">

        {/* Stores */}
        <div className="space-y-6 mb-16">
          {stores.map((store) => (
            <div key={store.id} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #ede8df" }}>
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Map placeholder */}
                <div className="aspect-[4/3] md:aspect-auto flex flex-col items-center justify-center gap-3 p-6" style={{ background: "#f5f0e8", minHeight: 200 }}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ color: "#C9A84C" }}
                  >
                    Open in Maps →
                  </a>
                </div>

                {/* Info */}
                <div className="md:col-span-2 p-8">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: "#C9A84C22", color: "#C9A84C" }}>
                        {store.type}
                      </span>
                      <h2 className="text-2xl mt-3 leading-snug" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>
                        {store.name}
                      </h2>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#faf9f6" }}>
                      <StoreIcon />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>Address</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>{store.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>Store Hours</p>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#4a4a4a" }}>{store.hours}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#C9A84C" }}>Phone</p>
                      <a href={`tel:${store.phone}`} className="text-sm hover:text-[#C9A84C] transition-colors" style={{ color: "#4a4a4a" }}>
                        {store.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="rounded-2xl p-10 text-center" style={{ background: "#fff", border: "1px solid #ede8df" }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.2} className="mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", color: "#1a1a1a" }}>More Locations Coming Soon</h3>
          <p className="text-sm" style={{ color: "#888" }}>We're expanding across India. Stay tuned for new store openings near you.</p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
