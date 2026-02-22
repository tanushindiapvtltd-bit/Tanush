import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/queries";

export default async function CollectionsSection() {
    const allCollections = await getCollections();

    return (
        <section id="collections" className="w-full bg-[#FAF9F6] py-16 md:py-20">
            <div className="w-full max-w-7xl mx-auto px-6">
                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="font-cormorant text-[2.4rem] md:text-[3rem] text-[#1A1A1A] leading-tight">
                        Curated Collections
                    </h2>
                    {/* Gold underline rule */}
                    <div className="mx-auto mt-3 mb-4 w-12 h-[2px] bg-[#C9A84C]" />
                    <p className="text-sm text-[#6b6b6b] max-w-md mx-auto leading-relaxed">
                        Explore our diverse range of styles, from everyday elegance to
                        bridal magnificence.
                    </p>
                </div>

                {/* 3 + 2 grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allCollections.map((col, index) => (
                        <Link
                            key={col.id}
                            href={`/collections/${col.slug}`}
                            className={`group relative overflow-hidden rounded-lg aspect-[3/4] block no-underline ${
                                /* Center the last 2 cards on large screens */
                                allCollections.length === 5 && index >= 3
                                    ? "lg:col-span-1 sm:col-span-1"
                                    : ""
                                }`}
                        >
                            {/* Background image */}
                            <Image
                                src={col.image}
                                alt={col.alt}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

                            {/* Tag + title */}
                            <div className="absolute bottom-0 left-0 p-6 text-white">
                                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C9A84C] mb-1">
                                    {col.tag}
                                </p>
                                <p className="font-cormorant text-[1.5rem] font-medium leading-tight">
                                    {col.title}
                                </p>
                            </div>

                            {/* Hover arrow */}
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="white"
                                    strokeWidth={2}
                                >
                                    <path
                                        d="M5 12h14M12 5l7 7-7 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom row centering — push last 2 into a centred wrapper on lg */}
            </div>
        </section>
    );
}
