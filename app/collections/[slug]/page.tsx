import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCollectionBySlug, getProductsByCollection } from "@/lib/queries";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
    const { slug } = await params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
        notFound();
    }

    const products = await getProductsByCollection(slug);

    return (
        <div className="flex flex-col min-h-screen w-full">
            <Navbar />
            <main className="flex-1 w-full">
                {/* ── Hero Banner ─────────────────────────────────────────────── */}
                <section className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
                    <Image
                        src={collection.image}
                        alt={collection.alt}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
                        <Link
                            href="/#collections"
                            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold tracking-[0.15em] uppercase mb-4 transition-colors no-underline"
                        >
                            <svg
                                width="14"
                                height="14"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    d="M19 12H5M12 19l-7-7 7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            All Collections
                        </Link>
                        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C9A84C] mb-2">
                            {collection.tag}
                        </p>
                        <h1 className="font-cormorant text-[2.5rem] md:text-[3.5rem] text-white leading-[1.1]">
                            {collection.title}
                        </h1>
                        <p className="text-sm text-white/70 max-w-lg mt-3 leading-relaxed">
                            {collection.description}
                        </p>
                    </div>
                </section>

                {/* ── Product Grid ────────────────────────────────────────────── */}
                <section className="w-full bg-[#FAF9F6] py-14 md:py-20">
                    <div className="w-full max-w-7xl mx-auto px-6">
                        {/* Count */}
                        <p className="text-xs text-[#6b6b6b] tracking-[0.12em] uppercase mb-8">
                            {products.length} {products.length === 1 ? "piece" : "pieces"}
                        </p>

                        {products.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="font-cormorant text-2xl text-[#6b6b6b]">
                                    Coming soon — stay tuned.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {products.map((product) => (
                                    <div key={product.id} className="group">
                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f0ede7]">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="mt-4 space-y-1.5">
                                            <h3 className="font-cormorant text-lg md:text-xl font-semibold text-[#1A1A1A] leading-tight">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-[#6b6b6b] leading-relaxed line-clamp-2">
                                                {product.description}
                                            </p>
                                            <p className="text-sm font-semibold text-[#1A1A1A] mt-1">
                                                ₹{product.price.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
