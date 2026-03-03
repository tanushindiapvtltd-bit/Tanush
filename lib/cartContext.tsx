"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from "react";

export interface CartItem {
    id: number;
    name: string;
    price: string;
    priceNum: number;
    image: string;
    quantity: number;
    subtitle: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: number) => void;
    updateQty: (id: number, qty: number) => void;
    clearCart: () => void;
    totalCount: number;
    subtotal: number;
    hydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "tanush_cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch {
            // ignore parse errors
        }
        setHydrated(true);
    }, []);

    // Persist to localStorage whenever items change (after hydration)
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // ignore storage errors
        }
    }, [items, hydrated]);

    const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === newItem.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQty = useCallback(
        (id: number, qty: number) => {
            if (qty < 1) {
                removeItem(id);
                return;
            }
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
            );
        },
        [removeItem]
    );

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.priceNum * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQty, clearCart, totalCount, subtotal, hydrated }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
