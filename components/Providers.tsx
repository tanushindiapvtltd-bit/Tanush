"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cartContext";
import { WishlistProvider } from "@/lib/wishlistContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                <WishlistProvider>{children}</WishlistProvider>
            </CartProvider>
        </SessionProvider>
    );
}
