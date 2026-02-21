import Image from "next/image";
import Button from "@/components/ui/Button";

export default function HeroSection() {
    return (
        <section className="w-full bg-[#FAF9F6] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center gap-12">
                {/* ── Left: bangle visual ───────────────────────────────────── */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px]">
                        {/* Soft glowing circle background */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 55%, transparent 75%)",
                            }}
                        />

                        {/* Bangle image */}
                        <div className="absolute inset-8 rounded-full overflow-hidden flex items-center justify-center">
                            <Image
                                src="/hero-bangle.png"
                                alt="Gold diamond bangle — Luxe Bangles hero image"
                                fill
                                sizes="(max-width: 768px) 300px, 420px"
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>

                        {/* Drag to rotate label */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] text-[#9e9e9e] tracking-widest uppercase whitespace-nowrap">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                                <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Drag to rotate
                        </div>
                    </div>
                </div>

                {/* ── Right: copy ───────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col gap-5 max-w-md">
                    {/* Eyebrow */}
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">
                        New Collection 2024
                    </p>

                    {/* Headline */}
                    <h1 className="font-cormorant text-[3rem] md:text-[4rem] leading-[1.05] text-[#1A1A1A]">
                        Grace in{" "}
                        <em className="text-[#C9A84C] not-italic font-light">Every Circle</em>
                    </h1>

                    {/* Sub-copy */}
                    <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-sm">
                        Experience the brilliance of handcrafted luxury. Discover our
                        exclusive collection of timeless bangles designed for the modern
                        muse.
                    </p>

                    {/* CTAs */}
                    <div className="flex items-center gap-4 flex-wrap mt-2">
                        <Button variant="primary" className="gap-2">
                            Shop Collection
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Button>
                        <Button variant="ghost" className="gap-2">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                                <path d="M12 8v4l3 3" strokeLinecap="round" />
                            </svg>
                            Try in 3D
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
