"use client";

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";

type ToastType = "cart" | "wishlist-add" | "wishlist-remove" | "success" | "error" | "review";

interface ToastData {
    type: ToastType;
    message: string;
    subMessage?: string;
}

interface ToastContextValue {
    showToast: (data: ToastData) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
    return useContext(ToastContext);
}

const ICONS: Record<ToastType, React.ReactNode> = {
    cart: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
        </svg>
    ),
    "wishlist-add": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
    ),
    "wishlist-remove": (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    review: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1.2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
};

const ICON_BG: Record<ToastType, string> = {
    cart: "rgba(201,168,76,0.15)",
    "wishlist-add": "rgba(231,76,60,0.12)",
    "wishlist-remove": "rgba(201,168,76,0.12)",
    success: "rgba(76,175,80,0.12)",
    review: "rgba(201,168,76,0.15)",
    error: "rgba(231,76,60,0.12)",
};

const ICON_COLOR: Record<ToastType, string> = {
    cart: "#C9A84C",
    "wishlist-add": "#e74c3c",
    "wishlist-remove": "#C9A84C",
    success: "#4caf50",
    review: "#C9A84C",
    error: "#e74c3c",
};

function ToastUI({ data, visible }: { data: ToastData; visible: boolean }) {
    return (
        <div
            className="fixed bottom-6 left-1/2 z-[9999] pointer-events-none"
            style={{
                transition: "opacity 0.3s ease, transform 0.3s ease",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(18px)",
            }}
        >
            <div
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
                style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    minWidth: "230px",
                    maxWidth: data.type === "error" ? "360px" : "320px",
                    whiteSpace: data.type === "error" ? "normal" : "nowrap",
                }}
            >
                {/* Icon */}
                <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: ICON_BG[data.type], color: ICON_COLOR[data.type] }}
                >
                    {ICONS[data.type]}
                </div>

                {/* Text */}
                <div className="flex flex-col min-w-0">
                    <span className={`text-white text-[13px] font-semibold leading-snug ${data.type === "error" ? "whitespace-normal" : "truncate"}`}>{data.message}</span>
                    {data.subMessage && (
                        <span className="text-[11px] leading-snug truncate" style={{ color: "#C9A84C" }}>
                            {data.subMessage}
                        </span>
                    )}
                </div>

                {/* Tick for success types, X for errors */}
                <div className="ml-auto flex-shrink-0 pl-1">
                    {data.type === "error" ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastData>({ type: "cart", message: "" });
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((data: ToastData) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(data);
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), 2600);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastUI data={toast} visible={visible} />
        </ToastContext.Provider>
    );
}
