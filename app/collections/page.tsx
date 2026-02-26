import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// We'll map through these mock products for the grid
const products = [
    {
        id: 1,
        name: "Velvet Kundan Set",
        subtitle: "Gold Plated Brass",
        price: 120.00,
        image: "/Festive/14.png",
        badge: "NEW",
    },
    {
        id: 2,
        name: "Minimal Gold Cuff",
        subtitle: "18k Solid Gold",
        price: 450.00,
        image: "/Minimal-Daily wear/7.png",
        badge: null,
    },
    {
        id: 3,
        name: "Antique Temple Bangle",
        subtitle: "Antique Gold Finish",
        price: 890.00,
        image: "/Traditional-Ethinic/16.png",
        badge: "BEST SELLER",
    },
    {
        id: 4,
        name: "Eternity Diamond Loop",
        subtitle: "Rose Gold & Diamonds",
        price: 2450.00,
        image: "/Bridal and Wedding/1.png",
        badge: null,
    },
    {
        id: 5,
        name: "Geo-Structure Silver",
        subtitle: "Sterling Silver",
        price: 185.00,
        image: "/Oxidised/8.png",
        badge: null,
    },
    {
        id: 6,
        name: "Royal Silk Wraps",
        subtitle: "Silk Thread & Stone",
        price: 75.00,
        image: "/Festive/6.png",
        badge: null,
    }
];

export default function CollectionsPage() {
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#faf9f6]">
            <Navbar />
            <main className="flex-1 w-full">
                {/* Top Banner section */}
                <section className="relative w-full h-[400px] md:h-[500px]">
                    <Image
                        src="/hero-bangle.png"
                        alt="The Royal Heirloom Collection"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />

                    <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24">
                        <div className="max-w-2xl text-white">
                            <span className="text-sm font-semibold tracking-[0.15em] uppercase text-[#c9a84c] mb-4 block">
                                Handcrafted Excellence
                            </span>
                            <h1 className="font-cormorant text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight drop-shadow-lg">
                                The Royal Heirloom<br />Collection
                            </h1>
                            <p className="text-base md:text-lg text-white/90 mb-10 max-w-lg font-light leading-relaxed">
                                Discover timeless elegance with our handcrafted bangles, designed for the modern connoisseur who values tradition woven with contemporary grace.
                            </p>
                            <button className="bg-[#c9a84c] hover:bg-[#b8972a] text-white px-8 py-3.5 text-sm uppercase tracking-widest font-semibold transition-colors flex items-center gap-3 rounded-sm shadow-md">
                                View Collection
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8">
                    {/* Breadcrumb */}
                    <div className="text-xs text-[#6b6b6b] mb-12 uppercase tracking-widest flex items-center gap-2 font-medium">
                        <Link href="/" className="hover:text-[#c9a84c] transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-[#c9a84c] transition-colors">Shop</Link>
                        <span>/</span>
                        <span className="text-[#1a1a1a]">Bangles</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">

                        {/* Left Sidebar (Filters) */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="font-cormorant text-2xl text-[#1a1a1a] font-semibold">Refine</h2>
                                    <button className="text-xs font-semibold text-[#c9a84c] hover:text-[#b8972a] tracking-widest uppercase transition-colors">
                                        Clear All
                                    </button>
                                </div>

                                {/* Accordions */}
                                <div className="border-t border-[#e8e3db] py-6">
                                    <div className="flex items-center justify-between cursor-pointer mb-5">
                                        <span className="text-sm font-semibold text-[#1a1a1a]">Material</span>
                                        <span className="text-[#1a1a1a] text-lg font-light">−</span>
                                    </div>
                                    <div className="space-y-4">
                                        {["Glass", "Brass", "Gold Plated", "Thread"].map((item, idx) => (
                                            <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${item === 'Gold Plated' ? 'bg-[#c9a84c] border-[#c9a84c]' : 'border-[#ccc] bg-white group-hover:border-[#c9a84c]'}`}>
                                                    {item === 'Gold Plated' && (
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={`text-[13px] ${item === 'Gold Plated' ? 'text-[#1a1a1a] font-medium' : 'text-[#4a4a4a]'}`}>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-[#e8e3db] py-5">
                                    <div className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm font-semibold text-[#1a1a1a]">Occasion</span>
                                        <span className="text-[#999] text-xl font-light hover:text-[#1a1a1a] transition-colors">+</span>
                                    </div>
                                </div>

                                <div className="border-t border-[#e8e3db] py-5">
                                    <div className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm font-semibold text-[#1a1a1a]">Style</span>
                                        <span className="text-[#999] text-xl font-light hover:text-[#1a1a1a] transition-colors">+</span>
                                    </div>
                                </div>

                                <div className="border-t border-[#e8e3db] py-6">
                                    <div className="flex items-center justify-between cursor-pointer mb-6">
                                        <span className="text-sm font-semibold text-[#1a1a1a]">Price</span>
                                        <span className="text-[#1a1a1a] text-lg font-light">−</span>
                                    </div>
                                    {/* Slider visual representation */}
                                    <div className="px-1 relative pb-6 w-full">
                                        <div className="h-1 w-full bg-[#e8e3db] rounded-full">
                                            <div className="h-full bg-[#c9a84c] w-1/4 rounded-full relative">
                                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#c9a84c] border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-grab"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 text-xs font-medium text-[#6b6b6b]">
                                            <span>$50</span>
                                            <span>$5,000+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Right Side (Products Grid) */}
                        <div className="flex-1 pb-20">

                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                <p className="text-[13px] text-[#6b6b6b] font-medium">
                                    Showing <span className="font-bold text-[#1a1a1a]">12</span> of <span className="font-bold text-[#1a1a1a]">45</span> products
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[13px] text-[#6b6b6b] font-medium">Sort by:</span>
                                    <button className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a] bg-transparent focus:outline-none">
                                        Best Selling
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#999]">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-14">
                                {products.map((product) => (
                                    <div key={product.id} className="group cursor-pointer flex flex-col">
                                        <div className="relative w-full aspect-[4/5] bg-[#f4ebd0] mb-5 overflow-hidden rounded-sm">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            />
                                            {/* Badge */}
                                            {product.badge && (
                                                <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-white shadow-sm rounded-sm ${product.badge === 'NEW' ? 'bg-[#c9a84c]' : 'bg-[#1a1a1a]'}`}>
                                                    {product.badge}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <h3 className="font-semibold text-[15px] text-[#1a1a1a] group-hover:text-[#c9a84c] transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-[12px] text-[#6b6b6b]">
                                                {product.subtitle}
                                            </p>
                                            <p className="text-[14px] font-bold text-[#1a1a1a] mt-1">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button */}
                            <div className="mt-20 flex justify-center">
                                <button className="px-10 py-3.5 border border-[#e8e3db] bg-white text-[#1a1a1a] text-[13px] font-semibold uppercase tracking-widest hover:border-[#1a1a1a] transition-all rounded-sm shadow-sm hover:shadow-md">
                                    Load More Products
                                </button>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
