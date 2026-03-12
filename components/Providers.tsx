"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cartContext";
import { WishlistProvider } from "@/lib/wishlistContext";
import { ToastProvider } from "@/lib/toastContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                <WishlistProvider>
                    <ToastProvider>{children}</ToastProvider>
                </WishlistProvider>
            </CartProvider>
        </SessionProvider>
    );
}
