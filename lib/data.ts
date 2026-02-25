import type { NavLink, Collection, FooterColumn, TrustItem } from "@/types";

// ─── Navigation ────────────────────────────────────────────────────────────
export const navLinks: NavLink[] = [
    { label: "Shop", href: "/shop" },
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

// ─── Collections ───────────────────────────────────────────────────────────
export const collections: Collection[] = [
    {
        id: 1,
        tag: "MATERIAL",
        title: "Diamond Collection",
        image: "/collections/diamond.jpg",
        alt: "A hand wearing a delicate diamond bangle",
        href: "/collections/diamond",
    },
    {
        id: 2,
        tag: "OCCASION",
        title: "Wedding & Bridal",
        image: "/collections/bridal.jpg",
        alt: "A bride in red saree wearing gold jewellery",
        href: "/collections/bridal",
    },
    {
        id: 3,
        tag: "STYLE",
        title: "Everyday Luxury",
        image: "/collections/everyday.jpg",
        alt: "Premium gift box with golden bangles",
        href: "/collections/everyday",
    },
    {
        id: 4,
        tag: "OCCASION",
        title: "Festive",
        image: "/Festive/6.png",
        alt: "Festive Jewellery",
        href: "/collections/festive",
    },
    {
        id: 5,
        tag: "OCCASION",
        title: "Party",
        image: "/Oxidised/8.png",
        alt: "Party Jewellery",
        href: "/collections/party",
    },
    {
        id: 6,
        tag: "STYLE",
        title: "Office Wear",
        image: "/Minimal-Daily wear/7.png",
        alt: "Minimal Daily Wear",
        href: "/collections/office-wear",
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
