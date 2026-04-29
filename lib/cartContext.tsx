"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
    id: number;
    name: string;
    price: string;
    priceNum: number;
    image: string;
    quantity: number;
    subtitle: string;
    size?: string;
    color?: string;
    sku?: string;
    gstRate?: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: number, size?: string, color?: string) => void;
    updateQty: (id: number, qty: number, size?: string, color?: string) => void;
    clearCart: () => void;
    clearUserData: () => void;
    totalCount: number;
    subtotal: number;
    hydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Storage key scheme ────────────────────────────────────────────────────────
// Guest (unauthenticated):  tanush_cart_guest
// Authenticated user:       tanush_cart_u_<userId>
// Legacy (migrated away):   tanush_cart
const GUEST_KEY = "tanush_cart_guest";
const LEGACY_KEY = "tanush_cart";
const userKey = (userId: string) => `tanush_cart_u_${userId}`;

// ── Secure localStorage helpers ───────────────────────────────────────────────

function readCart(key: string): CartItem[] {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Validate shape and bounds of every item to guard against tampered storage
        return parsed.filter(
            (item): item is CartItem =>
                item !== null &&
                typeof item === "object" &&
                typeof (item as CartItem).id === "number" &&
                Number.isFinite((item as CartItem).id) &&
                typeof (item as CartItem).name === "string" &&
                (item as CartItem).name.length > 0 &&
                (item as CartItem).name.length <= 256 &&
                typeof (item as CartItem).price === "string" &&
                typeof (item as CartItem).priceNum === "number" &&
                Number.isFinite((item as CartItem).priceNum) &&
                (item as CartItem).priceNum >= 0 &&
                typeof (item as CartItem).quantity === "number" &&
                Number.isInteger((item as CartItem).quantity) &&
                (item as CartItem).quantity > 0 &&
                (item as CartItem).quantity <= 99 &&
                typeof (item as CartItem).image === "string" &&
                typeof (item as CartItem).subtitle === "string" &&
                ((item as CartItem).size === undefined || typeof (item as CartItem).size === "string") &&
                ((item as CartItem).color === undefined || typeof (item as CartItem).color === "string") &&
                ((item as CartItem).sku === undefined || typeof (item as CartItem).sku === "string") &&
                ((item as CartItem).gstRate === undefined || typeof (item as CartItem).gstRate === "number")
        );
    } catch {
        return [];
    }
}

function writeCart(key: string, items: CartItem[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch {
        // Ignore quota / security errors
    }
}

function removeKey(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore
    }
}

// Merge guest items into the user's existing cart (no duplicates, cap at 99)
function variantMatch(a: CartItem, b: CartItem) {
    return a.id === b.id && a.size === b.size && a.color === b.color;
}

function mergeCarts(base: CartItem[], incoming: CartItem[]): CartItem[] {
    if (incoming.length === 0) return base;
    const result = [...base];
    for (const guest of incoming) {
        const existing = result.find((i) => variantMatch(i, guest));
        if (existing) {
            existing.quantity = Math.min(existing.quantity + guest.quantity, 99);
        } else {
            result.push({ ...guest });
        }
    }
    return result;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);
    // undefined = session not yet resolved; null = guest; string = userId
    const prevUserIdRef = useRef<string | null | undefined>(undefined);

    // ── Session-aware hydration & cart switching ──────────────────────────────
    useEffect(() => {
        if (status === "loading") return; // wait for auth to resolve

        const userId = session?.user?.id ?? null;
        const prevUserId = prevUserIdRef.current;

        if (prevUserId === undefined) {
            // ── First resolution: hydrate the correct cart ──────────────────
            if (userId) {
                // Authenticated on first load
                const userItems = readCart(userKey(userId));
                const guestItems = readCart(GUEST_KEY);
                // Migrate legacy guest cart if present
                const legacyItems = readCart(LEGACY_KEY);
                const merged = mergeCarts(
                    mergeCarts(userItems, guestItems),
                    legacyItems
                );
                if (guestItems.length > 0) removeKey(GUEST_KEY);
                if (legacyItems.length > 0) removeKey(LEGACY_KEY);
                writeCart(userKey(userId), merged);
                setItems(merged);
            } else {
                // Guest on first load — migrate legacy key if present
                const guestItems = readCart(GUEST_KEY);
                const legacyItems = readCart(LEGACY_KEY);
                const merged = mergeCarts(guestItems, legacyItems);
                if (legacyItems.length > 0) {
                    removeKey(LEGACY_KEY);
                    writeCart(GUEST_KEY, merged);
                }
                setItems(merged);
            }
            prevUserIdRef.current = userId;
            setHydrated(true);
            return;
        }

        // ── Subsequent session transitions ────────────────────────────────────
        if (prevUserId === userId) return; // no actual change

        if (userId) {
            // User just logged in: load their cart + absorb guest cart
            const userItems = readCart(userKey(userId));
            const guestItems = readCart(GUEST_KEY);
            const merged = mergeCarts(userItems, guestItems);
            if (guestItems.length > 0) removeKey(GUEST_KEY);
            writeCart(userKey(userId), merged);
            setItems(merged);
        } else {
            // User just logged out: clear memory, start fresh guest session
            setItems([]);
        }
        prevUserIdRef.current = userId;
    }, [status, session?.user?.id]);

    // ── Persist to localStorage on every change (after hydration) ────────────
    useEffect(() => {
        if (!hydrated) return;
        const userId = session?.user?.id ?? null;
        const key = userId ? userKey(userId) : GUEST_KEY;
        writeCart(key, items);
    }, [items, hydrated, session?.user?.id]);

    // ── Cart mutations ────────────────────────────────────────────────────────

    const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => variantMatch(i, { ...newItem, quantity: 0 }));
            if (existing) {
                return prev.map((i) =>
                    variantMatch(i, { ...newItem, quantity: 0 })
                        ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
                        : i
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: number, size?: string, color?: string) => {
        setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size && i.color === color)));
    }, []);

    const updateQty = useCallback(
        (id: number, qty: number, size?: string, color?: string) => {
            if (qty < 1) { removeItem(id, size, color); return; }
            setItems((prev) =>
                prev.map((i) => (i.id === id && i.size === size && i.color === color ? { ...i, quantity: Math.min(qty, 99) } : i))
            );
        },
        [removeItem]
    );

    // After checkout: clear cart items + their storage entry
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // On sign-out: wipe all user-related storage and clear memory
    const clearUserData = useCallback(() => {
        const userId = session?.user?.id;
        if (userId) removeKey(userKey(userId));
        removeKey(GUEST_KEY);
        removeKey(LEGACY_KEY);
        setItems([]);
    }, [session?.user?.id]);

    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.priceNum * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items, addItem, removeItem, updateQty,
                clearCart, clearUserData,
                totalCount, subtotal, hydrated,
            }}
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
