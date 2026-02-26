import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen w-full bg-white font-inter">
            {/* Left side banner - hidden on mobile, 50% width on large screens */}
            <div className="hidden lg:flex w-1/2 relative bg-[#f4ebd0] overflow-hidden">
                {/* Background image covering the pane */}
                <Image
                    src="/hero-bangle.png"
                    alt="Signature Collection Jewelry"
                    fill
                    className="object-cover object-center"
                    priority
                />
                {/* Overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Text bottom left */}
                <div className="absolute bottom-16 left-12 z-10 text-white">
                    <h2 className="font-cormorant italic text-5xl mb-3 tracking-wide drop-shadow-lg text-[#FAF9F6]">
                        Timeless Elegance
                    </h2>
                    <p className="text-xs tracking-[0.2em] font-medium uppercase text-white/90">
                        The Signature Collection
                    </p>
                </div>
            </div>

            {/* Right side form */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 md:px-24 xl:px-32 py-12">
                <div className="w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/feather-logo.png"
                            alt="Tanush Logo"
                            width={64}
                            height={64}
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-10">
                        <h1 className="font-cormorant text-4xl text-[#1a1a1a] mb-3">Welcome Back</h1>
                        <p className="text-[#6b6b6b] text-sm">Enter your credentials to access your exclusive jewelry vault.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-[#1a1a1a] mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="alexander@prestige.com"
                                className="w-full px-4 py-3.5 bg-[#faf9f6]/50 border border-[#e8e3db] rounded text-sm text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200"
                                defaultValue="alexander@prestige.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold text-[#1a1a1a]"
                                >
                                    Password
                                </label>
                                <Link
                                    href="#"
                                    className="text-xs font-semibold text-[#c9a84c] hover:text-[#b0923e] tracking-wide transition-colors uppercase"
                                >
                                    FORGOT PASSWORD?
                                </Link>
                            </div>
                            <div className="relative leading-none">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••••"
                                    className="w-full px-4 py-3.5 bg-[#faf9f6]/50 border border-[#e8e3db] rounded text-[16px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition duration-200 tracking-widest"
                                    defaultValue="password123"
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1a1a1a] transition-colors pb-0.5">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#c9a84c] hover:bg-[#b8972a] text-white font-semibold py-3.5 px-4 rounded text-sm tracking-widest uppercase transition-colors mt-2"
                        >
                            SIGN IN
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 flex items-center justify-center space-x-4">
                        <div className="h-px w-full bg-[#e8e3db]"></div>
                        <span className="text-xs text-[#999] font-medium tracking-widest uppercase whitespace-nowrap">
                            OR CONTINUE WITH
                        </span>
                        <div className="h-px w-full bg-[#e8e3db]"></div>
                    </div>

                    {/* Social Sign-in */}
                    <div className="mt-8 flex justify-center">
                        <button type="button" className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-[#e8e3db] rounded hover:bg-[#faf9f6]/50 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-semibold text-[#1a1a1a]">Google</span>
                        </button>
                    </div>

                    <p className="text-center mt-10 text-sm text-[#6b6b6b]">
                        Don't have an account?{' '}
                        <Link href="/sign-up" className="font-semibold text-[#c9a84c] hover:text-[#b8972a] transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
