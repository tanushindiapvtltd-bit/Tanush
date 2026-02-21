import Link from "next/link";
import { footerColumns } from "@/lib/data";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-[#e8e3db]">
            <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
                {/* Top grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand column */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <svg width="20" height="16" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M1 17L3.5 7L8 12L11 2L14 12L18.5 7L21 17H1Z"
                                    fill="#C9A84C"
                                    stroke="#C9A84C"
                                    strokeWidth="1.2"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="font-cormorant font-semibold text-[1.1rem] text-[#1A1A1A] tracking-wide">
                                Luxe Bangles
                            </span>
                        </div>
                        <p className="text-xs text-[#6b6b6b] leading-relaxed max-w-[200px]">
                            Handcrafted with passion, designed for elegance. We bring you the
                            finest collection of bangles for every moment of your life.
                        </p>
                    </div>

                    {/* Dynamic columns */}
                    {footerColumns.map((col) => (
                        <div key={col.heading}>
                            <h4 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1A1A1A] mb-4">
                                {col.heading}
                            </h4>
                            <ul className="flex flex-col gap-2.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[#6b6b6b] hover:text-[#C9A84C] transition-colors duration-200 no-underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#e8e3db] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-[#9e9e9e]">
                        © 2024 Luxe Bangles. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link href="/privacy" className="text-xs text-[#9e9e9e] hover:text-[#C9A84C] transition-colors no-underline">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-xs text-[#9e9e9e] hover:text-[#C9A84C] transition-colors no-underline">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
