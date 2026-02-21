// ─── Navigation ────────────────────────────────────────────────────────────
export interface NavLink {
    label: string;
    href: string;
}

// ─── Collections ───────────────────────────────────────────────────────────
export interface Collection {
    id: number;
    tag: string;      // e.g. "MATERIAL" | "OCCASION" | "STYLE"
    title: string;
    image: string;    // path relative to /public
    alt: string;
    href: string;
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
