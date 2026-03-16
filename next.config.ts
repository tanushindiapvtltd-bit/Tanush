import type { NextConfig } from "next";

// Content Security Policy
// - 'unsafe-inline' for scripts: required by Next.js App Router hydration
// - 'unsafe-eval':              required by Razorpay checkout.js
// - checkout.razorpay.com:      Razorpay payment SDK
// - api.razorpay.com:           Razorpay payment iframe
// - lumberjack.razorpay.com:    Razorpay telemetry (connect-src)
// - res.cloudinary.com:         product/review images
// - lh3.googleusercontent.com:  Google OAuth profile pictures
const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    "font-src 'self'",
    "connect-src 'self' https://lumberjack.razorpay.com https://checkout.razorpay.com",
    "frame-src https://api.razorpay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Stop MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limit referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Force HTTPS on return visits (1 year, include subdomains)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Content Security Policy
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
