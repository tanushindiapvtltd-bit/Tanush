import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/data";

export default function CollectionsSection() {
    return (
        <section className="w-full bg-[#FAF9F6] py-16 md:py-20">
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

                {/* 3-card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            href={col.href}
                            className="group relative overflow-hidden rounded-lg aspect-[3/4] block no-underline"
                        >
                            {/* Background image */}
                            <Image
                                src={col.image}
                                alt={col.alt}
                                fill
                                sizes="(max-width: 640px) 100vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Tag + title */}
                            <div className="absolute bottom-0 left-0 p-6 text-white">
                                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C9A84C] mb-1">
                                    {col.tag}
                                </p>
                                <p className="font-cormorant text-[1.5rem] font-medium leading-tight">
                                    {col.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
