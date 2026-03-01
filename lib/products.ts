// ── Product data shared between Collections page and Product Detail page ────

export interface Product {
    id: number;
    name: string;
    price: string;
    priceNum: number;
    category: string;
    categoryKey: string;
    mainImage: string;
    thumbs: string[];
    description: string;
    specs: { label: string; value: string }[];
}

export const products: Product[] = [
    // ── Bridal ──
    {
        id: 1,
        name: "Gold Tone Handcrafted Bangle Set",
        price: "₹599",
        priceNum: 599,
        category: "Bridal",
        categoryKey: "bridal",
        mainImage: "/collections/bridal/Catalog 1/1.png",
        thumbs: [
            "/collections/bridal/Catalog 1/1.png",
            "/collections/bridal/Catalog 1/1.1 599.png",
            "/collections/bridal/Catalog 1/1.2.png",
            "/collections/bridal/Catalog 1/1.3.png",
        ],
        description:
            "A masterpiece of bridal elegance. This handcrafted gold-tone bangle set features intricate detailing with multicolour stone inlay, designed for the bride who appreciates timeless beauty and understated grace.",
        specs: [
            { label: "Material", value: "Gold Plated Brass" },
            { label: "Pieces", value: "4 Bangles" },
            { label: "Style", value: "Bridal" },
            { label: "Finish", value: "High Polish Gold" },
            { label: "Diameter", value: "6.5 cm" },
        ],
    },
    {
        id: 2,
        name: "Gold Plated 6pc Bangle Set",
        price: "₹999",
        priceNum: 999,
        category: "Bridal",
        categoryKey: "bridal",
        mainImage: "/collections/bridal/catalog 2/2.png",
        thumbs: [
            "/collections/bridal/catalog 2/2.png",
            "/collections/bridal/catalog 2/2.1 999.png",
        ],
        description:
            "An opulent 6-piece gold plated bangle set designed to elevate your bridal ensemble. Each bangle is adorned with rich meenakari work and traditional motifs that celebrate time-honoured Indian craftsmanship.",
        specs: [
            { label: "Material", value: "Gold Plated Brass" },
            { label: "Pieces", value: "6 Bangles" },
            { label: "Style", value: "Bridal" },
            { label: "Finish", value: "Antique Gold" },
            { label: "Diameter", value: "6.5 cm" },
        ],
    },
    {
        id: 3,
        name: "Gold Plated Bridal Bangle Set",
        price: "₹999",
        priceNum: 999,
        category: "Bridal",
        categoryKey: "bridal",
        mainImage: "/collections/bridal/catalog 3/3.png",
        thumbs: [
            "/collections/bridal/catalog 3/3.png",
            "/collections/bridal/catalog 3/3.1 999.png",
            "/collections/bridal/catalog 3/3.2.png",
            "/collections/bridal/catalog 3/3.3.png",
        ],
        description:
            "A luxurious bridal bangle set featuring ornate designs with vibrant stone accents. Perfect for the modern bride seeking a blend of heritage and contemporary style on her most special day.",
        specs: [
            { label: "Material", value: "Gold Plated Brass" },
            { label: "Pieces", value: "6 Bangles" },
            { label: "Style", value: "Bridal" },
            { label: "Finish", value: "High Polish Gold" },
            { label: "Diameter", value: "6.5 cm" },
        ],
    },
    {
        id: 4,
        name: "Classic Gold Plated 4pc Bangle Set",
        price: "₹599",
        priceNum: 599,
        category: "Bridal",
        categoryKey: "bridal",
        mainImage: "/collections/bridal/catalog 4/9.png",
        thumbs: [
            "/collections/bridal/catalog 4/9.png",
            "/collections/bridal/catalog 4/9.1 599.png",
            "/collections/bridal/catalog 4/9.2.png",
        ],
        description:
            "A classic 4-piece gold plated bangle set that exudes regal charm. With beautiful filigree patterns and a warm golden sheen, this set is crafted to complement traditional bridal attire.",
        specs: [
            { label: "Material", value: "Gold Plated Brass" },
            { label: "Pieces", value: "4 Bangles" },
            { label: "Style", value: "Bridal" },
            { label: "Finish", value: "Classic Gold" },
            { label: "Diameter", value: "6.5 cm" },
        ],
    },

    // ── Traditional & Ethnic ──
    {
        id: 5,
        name: "Traditional Ethnic Bangle Set",
        price: "₹449",
        priceNum: 449,
        category: "Traditional & Ethnic",
        categoryKey: "traditional",
        mainImage: "/collections/traditional ethinic/catalog 1/4.png",
        thumbs: [
            "/collections/traditional ethinic/catalog 1/4.png",
            "/collections/traditional ethinic/catalog 1/4.1 449.png",
        ],
        description:
            "A beautiful traditional bangle set rooted in the rich heritage of Indian jewellery. Hand-embellished with kundan-style stone settings, these bangles bring timeless ethnic charm to any outfit.",
        specs: [
            { label: "Material", value: "Brass with Stone Work" },
            { label: "Pieces", value: "2 Bangles" },
            { label: "Style", value: "Traditional" },
            { label: "Finish", value: "Antique Gold" },
            { label: "Diameter", value: "6.4 cm" },
        ],
    },
    {
        id: 6,
        name: "Ethnic Designer Bangle Set",
        price: "₹449",
        priceNum: 449,
        category: "Traditional & Ethnic",
        categoryKey: "traditional",
        mainImage: "/collections/traditional ethinic/catclog 2/5.png",
        thumbs: [
            "/collections/traditional ethinic/catclog 2/5.png",
            "/collections/traditional ethinic/catclog 2/5.1 449.png",
            "/collections/traditional ethinic/catclog 2/5.2.png",
        ],
        description:
            "An exquisite designer bangle set that embodies the art of Indian ethnic jewellery. Featuring intricate silver-tone bead work and a contemporary silhouette that pairs beautifully with sarees and lehengas.",
        specs: [
            { label: "Material", value: "Silver Plated Alloy" },
            { label: "Pieces", value: "Set of 3" },
            { label: "Style", value: "Ethnic Designer" },
            { label: "Finish", value: "Oxidised Silver" },
            { label: "Diameter", value: "6.4 cm" },
        ],
    },
    {
        id: 7,
        name: "Heritage Bangle Collection",
        price: "₹449",
        priceNum: 449,
        category: "Traditional & Ethnic",
        categoryKey: "traditional",
        mainImage: "/collections/traditional ethinic/catclog 3/6.png",
        thumbs: [
            "/collections/traditional ethinic/catclog 3/6.png",
            "/collections/traditional ethinic/catclog 3/6.1 449.png",
        ],
        description:
            "A heritage collection inspired by the royal courts of India. Each bangle carries delicate handwork and glowing finishes that speak of tradition, culture, and timeless elegance.",
        specs: [
            { label: "Material", value: "Gold Plated Brass" },
            { label: "Pieces", value: "2 Bangles" },
            { label: "Style", value: "Heritage" },
            { label: "Finish", value: "Matte Gold" },
            { label: "Diameter", value: "6.4 cm" },
        ],
    },
    {
        id: 8,
        name: "Classic Ethnic Bangle Set",
        price: "₹399",
        priceNum: 399,
        category: "Traditional & Ethnic",
        categoryKey: "traditional",
        mainImage: "/collections/traditional ethinic/catclog 4/8.png",
        thumbs: [
            "/collections/traditional ethinic/catclog 4/8.png",
            "/collections/traditional ethinic/catclog 4/8.1 399.png",
        ],
        description:
            "A classic ethnic bangle set with circular jhumka-style detailing. Lightweight yet statement-making, these bangles add an elegant festive touch to everyday and occasion wear.",
        specs: [
            { label: "Material", value: "Gold Plated Alloy" },
            { label: "Pieces", value: "2 Bangles" },
            { label: "Style", value: "Classic Ethnic" },
            { label: "Finish", value: "High Polish Gold" },
            { label: "Diameter", value: "6.5 cm" },
        ],
    },
    {
        id: 9,
        name: "Festive Ethnic Bangle Set",
        price: "₹399",
        priceNum: 399,
        category: "Traditional & Ethnic",
        categoryKey: "traditional",
        mainImage: "/collections/traditional ethinic/catalog 5/10.png",
        thumbs: [
            "/collections/traditional ethinic/catalog 5/10.png",
            "/collections/traditional ethinic/catalog 5/10.1 399.png",
            "/collections/traditional ethinic/catalog 5/10.2.png",
        ],
        description:
            "Celebrate every festive moment with this beautiful ethnic bangle set. Features a warm gold finish with subtle engraving patterns that catch the light beautifully.",
        specs: [
            { label: "Material", value: "Gold Plated Brass" },
            { label: "Pieces", value: "Set of 3" },
            { label: "Style", value: "Festive" },
            { label: "Finish", value: "Satin Gold" },
            { label: "Diameter", value: "6.4 cm" },
        ],
    },

    // ── Minimal & Daily ──
    {
        id: 10,
        name: "Minimal Gold Bangle Set",
        price: "₹349",
        priceNum: 349,
        category: "Minimal & Daily",
        categoryKey: "minimal",
        mainImage: "/collections/minimal and daily/7.png",
        thumbs: [
            "/collections/minimal and daily/7.png",
            "/collections/minimal and daily/7.1 349.PNG",
            "/collections/minimal and daily/7.2.PNG",
        ],
        description:
            "A refined minimal bangle set for the modern woman. Lightweight, elegant, and perfectly understated — designed to be worn from morning meetings to evening gatherings with effortless grace.",
        specs: [
            { label: "Material", value: "Gold Plated Alloy" },
            { label: "Pieces", value: "Set of 3" },
            { label: "Style", value: "Minimal" },
            { label: "Finish", value: "Brushed Gold" },
            { label: "Diameter", value: "6.2 cm" },
        ],
    },
];

export function getProductById(id: number): Product | undefined {
    return products.find((p) => p.id === id);
}

export function getRelatedProducts(
    currentId: number,
    count = 4
): Product[] {
    const current = getProductById(currentId);
    if (!current) return products.slice(0, count);

    // Prefer same category, then others
    const sameCategory = products.filter(
        (p) => p.categoryKey === current.categoryKey && p.id !== currentId
    );
    const others = products.filter(
        (p) => p.categoryKey !== current.categoryKey
    );
    return [...sameCategory, ...others].slice(0, count);
}
