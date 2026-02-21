import { trustItems } from "@/lib/data";

// ── Icon map ─────────────────────────────────────────────────────────────────
function TrustIcon({ type }: { type: string }) {
    if (type === "shipping") {
        return (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.6}>
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="5.5" cy="18.5" r="1.5" />
                <circle cx="18.5" cy="18.5" r="1.5" />
            </svg>
        );
    }
    if (type === "shield") {
        return (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.6}>
                <path d="M12 2L4 6v6c0 4.418 3.582 8 8 10 4.418-2 8-5.582 8-10V6l-8-4z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    // star
    return (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.6}>
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function TrustBanner() {
    return (
        <section className="w-full bg-white border-y border-[#e8e3db]">
            <div className="w-full max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e8e3db]">
                    {trustItems.map((item) => (
                        <div
                            key={item.title}
                            className="flex items-center gap-4 px-6 py-4 justify-center sm:justify-start sm:first:pl-0 sm:last:pr-0"
                        >
                            <div className="flex-shrink-0">
                                <TrustIcon type={item.icon} />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[#1A1A1A] tracking-wide">
                                    {item.title}
                                </p>
                                <p className="text-xs text-[#9e9e9e] mt-0.5">{item.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
