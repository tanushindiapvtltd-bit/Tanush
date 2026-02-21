"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setSubmitted(true);
    }

    return (
        <section className="w-full bg-white py-16 md:py-20">
            <div className="max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-5">
                {/* Envelope icon */}
                <div className="w-10 h-10 rounded-full border border-[#C9A84C] flex items-center justify-center">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#C9A84C" strokeWidth={1.6}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinejoin="round" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                </div>

                <h2 className="font-cormorant text-[2.4rem] md:text-[3rem] text-[#1A1A1A] leading-tight">
                    Join the Inner Circle
                </h2>
                <p className="text-sm text-[#6b6b6b] max-w-sm leading-relaxed">
                    Subscribe to receive updates, access to exclusive deals, and more.
                </p>

                {submitted ? (
                    <p className="text-sm font-medium text-[#C9A84C] mt-2">
                        ✨ Thank you! You&apos;re on the list.
                    </p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col sm:flex-row gap-3 mt-2"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            required
                            className="flex-1 px-5 py-3 text-sm border border-[#e8e3db] rounded-full outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 text-[#1A1A1A] placeholder:text-[#bbb] transition-all"
                        />
                        <Button variant="primary" type="submit">
                            Subscribe
                        </Button>
                    </form>
                )}
            </div>
        </section>
    );
}
