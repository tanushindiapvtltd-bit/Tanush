"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WishlistContextType {
    ids: number[];
    isInWishlist: (productId: number) => boolean;
    toggle: (productId: number) => Promise<void>;
    loading: boolean;
    requiresAuth: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [ids, setIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [requiresAuth, setRequiresAuth] = useState(false);

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (!session?.user) {
            setIds([]);
            return;
        }
        fetch("/api/wishlist")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setIds(data.map((item: { productId: number }) => item.productId));
                }
            })
            .catch(() => {});
    }, [session?.user?.email]);

    const isInWishlist = useCallback(
        (productId: number) => ids.includes(productId),
        [ids]
    );

    const toggle = useCallback(
        async (productId: number) => {
            if (!session?.user) {
                setRequiresAuth(true);
                setTimeout(() => setRequiresAuth(false), 3000);
                router.push(`/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
                return;
            }
            const inList = ids.includes(productId);
            // Optimistic update
            setIds((prev) =>
                inList ? prev.filter((id) => id !== productId) : [...prev, productId]
            );
            setLoading(true);
            try {
                if (inList) {
                    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
                } else {
                    await fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId }),
                    });
                }
            } catch {
                // Revert on error
                setIds((prev) =>
                    inList ? [...prev, productId] : prev.filter((id) => id !== productId)
                );
            } finally {
                setLoading(false);
            }
        },
        [session?.user, ids]
    );

    return (
        <WishlistContext.Provider value={{ ids, isInWishlist, toggle, loading, requiresAuth }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
