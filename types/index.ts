// ─── Navigation ────────────────────────────────────────────────────────────
export interface NavLink {
    label: string;
    href: string;
}

// ─── Collections ───────────────────────────────────────────────────────────
export interface Collection {
    id: number;
    slug: string;
    tag: string;      // e.g. "MATERIAL" | "OCCASION" | "STYLE"
    title: string;
    image: string;    // path relative to /public
    alt: string;
    description: string;
    href: string;
}

// ─── Products ──────────────────────────────────────────────────────────────
export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;        // path relative to /public
    price: number;        // price in INR
    collectionSlug: string;
}

// ─── Footer ────────────────────────────────────────────────────────────────
export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterColumn {
    heading: string;
    links: FooterLink[];
}

// ─── Trust Banner ──────────────────────────────────────────────────────────
export interface TrustItem {
    icon: string;   // SVG path or emoji placeholder
    title: string;
    subtitle: string;
}
