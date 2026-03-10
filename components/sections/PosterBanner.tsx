"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

/* Separate images for desktop (landscape) and mobile (portrait) */
const slides = [
    { desktop: "/banners/desktop/1.png", mobile: "/banners/mobile/1.png", label: "Royal Heritage" },
    { desktop: "/banners/desktop/2.png", mobile: "/banners/mobile/2.png", label: "Bridal Elegance" },
    { desktop: "/banners/desktop/3.png", mobile: "/banners/mobile/3.png", label: "Timeless Beauty" },
    { desktop: "/banners/desktop/4.png", mobile: "/banners/mobile/4.png", label: "Festive Glow" },
];

export default function PosterBanner() {
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goTo = useCallback(
        (index: number) => {
            if (isTransitioning) return;
            setIsTransitioning(true);
            setCurrent(index);
            setTimeout(() => setIsTransitioning(false), 700);
        },
        [isTransitioning]
    );

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + slides.length) % slides.length);
    }, [current, goTo]);

    /* Auto-advance every 4s */
    useEffect(() => {
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section className="relative w-full overflow-hidden">
            {/* Responsive aspect ratio container */}
            <div className="w-full aspect-[3/4] md:aspect-[16/5]">
                {/* Slides */}
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 transition-all duration-700 ease-in-out"
                        style={{
                            opacity: current === i ? 1 : 0,
                            transform: current === i ? "scale(1)" : "scale(1.03)",
                            zIndex: current === i ? 1 : 0,
                        }}
                    >
                        {/* Desktop image */}
                        <Image
                            src={slide.desktop}
                            alt={slide.label}
                            fill
                            className="object-cover hidden md:block"
                            sizes="100vw"
                            priority={i === 0}
                        />
                        {/* Mobile image */}
                        <Image
                            src={slide.mobile}
                            alt={slide.label}
                            fill
                            className="object-cover md:hidden"
                            sizes="100vw"
                            priority={i === 0}
                        />
                        {/* Dark overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)",
                            }}
                        />
                    </div>
                ))}

                {/* Center label */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.35em] mb-3"
                        style={{ color: "#c9a84c" }}
                    >
                        Explore Our Finest
                    </p>
                    <h2
                        className="text-3xl md:text-5xl mb-2"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            color: "#fff",
                            fontWeight: 400,
                            fontStyle: "italic",
                            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                        }}
                    >
                        {slides[current].label}
                    </h2>
                </div>

                {/* Left / Right arrows */}
                <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,168,76,0.4)" }}
                    aria-label="Previous"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth={2}>
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,168,76,0.4)" }}
                    aria-label="Next"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth={2}>
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="transition-all duration-300 rounded-full cursor-pointer"
                            style={{
                                width: current === i ? 24 : 8,
                                height: 8,
                                background: current === i ? "#c9a84c" : "rgba(255,255,255,0.4)",
                            }}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Top & bottom gold accent lines */}
                <div className="absolute top-0 left-0 right-0 z-10 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
                <div className="absolute bottom-0 left-0 right-0 z-10 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
            </div>
        </section>
    );
}
