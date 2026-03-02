import type { NavLink, Collection, FooterColumn, TrustItem } from "@/types";

// ─── Navigation ────────────────────────────────────────────────────────────
export const navLinks: NavLink[] = [
    { label: "Collections", href: "/collections" },
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

// ─── Collections (curated categories) ──────────────────────────────────────
export const collections: Collection[] = [
    {
        id: 1,
        tag: "OCCASION",
        title: "Bridal",
        image: "/collections/bridal/Catalog 1/1.png",
        alt: "Bridal jewellery collection",
        href: "/collections?category=bridal",
    },
    {
        id: 2,
        tag: "CELEBRATION",
        title: "Festive",
        image: "/collections/traditional ethinic/catalog 5/10.png",
        alt: "Festive jewellery collection",
        href: "/collections?category=festive",
    },
    {
        id: 3,
        tag: "STYLE",
        title: "Minimal & Daily",
        image: "/collections/minimal and daily/7.png",
        alt: "Minimal daily wear bangles",
        href: "/collections?category=minimal",
    },
    {
        id: 4,
        tag: "HERITAGE",
        title: "Traditional Ethnic",
        image: "/collections/traditional ethinic/catclog 2/5.png",
        alt: "Traditional ethnic jewellery",
        href: "/collections?category=traditional",
    },
];

// ─── Footer Columns ────────────────────────────────────────────────────────
export const footerColumns: FooterColumn[] = [
    {
        heading: "Shop",
        links: [
            { label: "New Arrivals", href: "/new-arrivals" },
            { label: "Bestsellers", href: "/bestsellers" },
            { label: "Wedding", href: "/collections/bridal" },
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
