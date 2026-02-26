import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen w-full bg-white font-inter">
            {/* Left side banner - hidden on mobile, 50% width on large screens */}
            <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden flex-col justify-between">
                {/* Background image covering the pane with a dark overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-bangle.png"
                        alt="Tanush Jewelry"
                        fill
                        className="object-cover object-center opacity-60"
                        priority
                    />
                </div>

                {/* Top Logo - Using the Tanush logo from home page */}
                <div className="relative z-10 pt-16 pl-12 flex items-center gap-3">
                    <Image
                        src="/tanush-logo-transparent.png"
                        alt="Tanush Logo"
                        width={200}
                        height={50}
                        className="object-contain filter brightness-0 invert"
                    />
                </div>

                {/* Middle Text */}
                <div className="relative z-10 px-12 max-w-lg mb-20">
                    <h2 className="font-cormorant italic text-5xl mb-6 text-white leading-tight drop-shadow-md">
                        Exquisite craftsmanship<br />for the modern icon.
                    </h2>
                    <p className="text-sm font-light text-white/90 leading-relaxed tracking-wide">
                        Discover our curated collection of timeless pieces<br />
                        designed to illuminate your unique radiance.
                    </p>
                </div>

                {/* Bottom Copyright */}
                <div className="relative z-10 pb-12 pl-12 text-[11px] text-white/70 tracking-[0.2em] uppercase font-semibold">
                    &copy; 2024 TANUSH JEWELRY ATELIER
                </div>
            </div>

            {/* Right side form */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 md:px-24 xl:px-32 py-12 bg-[#faf9f6]">
                <div className="w-full max-w-md mx-auto">
                    {/* Heading */}
                    <div className="mb-10">
                        <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Create Your Account</h1>
                        <p className="text-[#6b6b6b] text-sm font-light">Join our exclusive world of timeless elegance.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                            >
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Julianna Vielle"
                                className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[15px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="julianna@luxe.com"
                                className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[15px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest"
                                >
                                    Confirm
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 bg-white border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="flex items-start mt-6 mb-8">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    id="newsletter"
                                    type="checkbox"
                                    className="w-4 h-4 text-[#c9a84c] bg-white border-[#e8e3db] rounded focus:ring-[#c9a84c] focus:ring-2 accent-[#c9a84c] cursor-pointer"
                                />
                            </div>
                            <label htmlFor="newsletter" className="ml-3 text-[13px] text-[#4a4a4a]">
                                Join the <span className="font-cormorant italic text-[#c9a84c] font-semibold text-base">Inner Circle</span> for exclusive previews and rewards.
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#dfc067] hover:bg-[#c9a84c] text-white font-semibold py-4 px-4 rounded text-xs tracking-widest uppercase transition-colors"
                        >
                            CREATE ACCOUNT
                        </button>
                    </form>

                    <p className="text-center mt-10 text-[13px] text-[#6b6b6b]">
                        Already part of our heritage?{' '}
                        <Link href="/sign-in" className="font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors">
                            Sign In
                        </Link>
                    </p>

                    {/* Bottom Icons */}
                    <div className="mt-16 flex items-center justify-center gap-10 text-[#a3a3a3]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        <svg width="28" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
