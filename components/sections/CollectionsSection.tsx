"use client";

import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/data";
import { useRef } from "react";
export default function CollectionsSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 340; // Approx card width
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

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

                {/* Carousel container */}
                <div className="relative group -mx-2 px-2">
                    {/* Left Button */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/40 hover:bg-white text-black/70 hover:text-black p-3 text-lg rounded-full shadow-md hover:shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                        aria-label="Scroll left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                    >
                        {collections.map((col) => (
                            <Link
                                key={col.id}
                                href={col.href}
                                className="group relative overflow-hidden rounded-lg aspect-[3/4] block no-underline min-w-[280px] sm:min-w-[320px] md:min-w-[360px] snap-center flex-shrink-0"
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

                    {/* Right Button */}
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/40 hover:bg-white text-black/70 hover:text-black p-3 text-lg rounded-full shadow-md hover:shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                        aria-label="Scroll right"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
