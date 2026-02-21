import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tanush — Handcrafted Jewellery for the Modern Muse",
  description:
    "Discover our exclusive collection of timeless bangles — from diamond jewellery to bridal sets. Free global shipping. Certified quality.",
  keywords: ["bangles", "gold jewellery", "bridal bangles", "diamond bangles", "luxury jewellery", "tanush"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="antialiased bg-[#FAF9F6] text-[#1A1A1A] w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
