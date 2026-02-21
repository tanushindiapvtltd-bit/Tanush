import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost";
    children: React.ReactNode;
    className?: string;
}

export default function Button({
    variant = "primary",
    children,
    className = "",
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer";

    const variants = {
        primary:
            "bg-[#C9A84C] text-white hover:bg-[#b8972a] active:scale-95 rounded-full",
        ghost:
            "border border-[#1A1A1A]/30 text-[#1A1A1A] hover:border-[#C9A84C] hover:text-[#C9A84C] rounded-full",
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
