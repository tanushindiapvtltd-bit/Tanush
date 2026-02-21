import Link from "next/link";
import Image from "next/image";
import { footerColumns } from "@/lib/data";

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-[#e8e3db]">
            <div className="w-full max-w-7xl mx-auto px-6 pt-14 pb-8">
                {/* Top grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand column */}
                    <div className="flex flex-col gap-4 items-center text-center md:items-start md:text-left">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/tanush-logo.png"
                                alt="Tanush logo"
                                width={140}
                                height={46}
                                className="object-contain"
                            />
                        </div>
                        <p className="text-xs text-[#6b6b6b] leading-relaxed max-w-[200px]">
                            Handcrafted with passion, designed for elegance. We bring you the
                            finest collection of bangles for every moment of your life.
                        </p>
                    </div>

                    {/* Dynamic columns */}
                    {footerColumns.map((col) => (
                        <div key={col.heading} className="flex flex-col items-center text-center md:items-start md:text-left">
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
                <div className="border-t border-[#e8e3db] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p className="text-xs text-[#9e9e9e]">
                        © 2024 Tanush. All rights reserved.
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
