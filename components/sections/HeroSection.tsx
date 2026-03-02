import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="w-full bg-[#FAF9F6] overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col-reverse md:flex-row items-center gap-14">
                {/* ── Left: bangle visual ───────────────────────────────────── */}
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className="relative w-full max-w-[320px] aspect-square md:w-[460px] md:h-[460px] md:max-w-none">
                        {/* Soft glowing circle background */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.05) 55%, transparent 75%)",
                            }}
                        />

                        {/* Bangle image */}
                        <div className="absolute inset-8 rounded-full overflow-hidden flex items-center justify-center">
                            <Image
                                src="/hero-bangle.png"
                                alt="Gold diamond bangle — Tanush hero image"
                                fill
                                sizes="(max-width: 768px) 320px, 460px"
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* ── Right: copy ───────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-6 items-center text-center md:items-start md:text-left md:max-w-lg w-full">
                    {/* Eyebrow */}
                    <p
                        className="text-[11px] font-bold tracking-[0.25em] uppercase"
                        style={{ color: "#c9a84c" }}
                    >
                        New Collection 2026
                    </p>

                    {/* Headline */}
                    <h1
                        className="leading-[0.95]"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontSize: "clamp(3.5rem, 8vw, 7rem)",
                            fontWeight: 700,
                            color: "#1a1a1a",
                        }}
                    >
                        Grace in{" "}
                        <span
                            style={{
                                color: "#c9a84c",
                                fontStyle: "italic",
                                fontWeight: 600,
                            }}
                        >
                            Every Circle
                        </span>
                    </h1>

                    {/* Sub-copy */}
                    <p
                        className="max-w-md leading-relaxed"
                        style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontSize: "1.15rem",
                            color: "#6b6b6b",
                            fontStyle: "italic",
                        }}
                    >
                        Experience the brilliance of handcrafted luxury. Discover our
                        exclusive collection of timeless bangles designed for the modern
                        muse.
                    </p>

                    {/* CTAs */}
                    <div className="flex items-center gap-4 flex-wrap mt-2 justify-center md:justify-start">
                        <Link
                            href="/collections"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90 no-underline"
                            style={{ background: "#c9a84c", color: "#fff" }}
                        >
                            Shop Collection
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <Link
                            href="/collections/1"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[12px] font-bold uppercase tracking-[0.16em] transition-all duration-200 hover:bg-[#faf5ea] no-underline"
                            style={{ border: "1.5px solid #c9a84c", color: "#c9a84c", background: "transparent" }}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.8}>
                                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                                <path d="M12 8v4l3 3" strokeLinecap="round" />
                            </svg>
                            Try in 3D
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
