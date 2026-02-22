import type { NavLink, FooterColumn, TrustItem } from "@/types";

// ─── Navigation ────────────────────────────────────────────────────────────
export const navLinks: NavLink[] = [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/#collections" },
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
];

// ─── Trust Banner ──────────────────────────────────────────────────────────
export const trustItems: TrustItem[] = [
    {
        icon: "shipping",
        title: "Free Global Shipping",
        subtitle: "Insured delivery on all orders",
    },
    {
        icon: "shield",
        title: "Secure Payment",
        subtitle: "Encrypted transactions",
    },
    {
        icon: "star",
        title: "Certified Quality",
        subtitle: "Authenticity guaranteed",
    },
];

// ─── Footer Columns ────────────────────────────────────────────────────────
export const footerColumns: FooterColumn[] = [
    {
        heading: "Shop",
        links: [
            { label: "New Arrivals", href: "/new-arrivals" },
            { label: "Bestsellers", href: "/bestsellers" },
            { label: "Wedding", href: "/collections/bridal-wedding" },
            { label: "Gifts", href: "/gifts" },
        ],
    },
    {
        heading: "Support",
        links: [
            { label: "Contact Us", href: "/contact" },
            { label: "Shipping & Returns", href: "/shipping" },
            { label: "Size Guide", href: "/size-guide" },
            { label: "FAQ", href: "/faq" },
        ],
    },
    {
        heading: "Follow Us",
        links: [
            { label: "IG", href: "https://instagram.com" },
            { label: "FB", href: "https://facebook.com" },
            { label: "PI", href: "https://pinterest.com" },
        ],
    },
];
