import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { collections, products } from "./schema";

async function seed() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log("🌱 Seeding collections…");

    // ── Collections ──────────────────────────────────────────────────────────
    await db.delete(products);   // clear children first
    await db.delete(collections);

    await db.insert(collections).values([
        {
            slug: "bridal-wedding",
            tag: "OCCASION",
            title: "Bridal & Wedding",
            image: "/collections/bridal-wedding.png",
            alt: "Stunning bridal bangles and wedding jewelry set",
            description:
                "Make your special day unforgettable with our exquisite bridal collection — handcrafted with love and timeless tradition.",
        },
        {
            slug: "festive",
            tag: "OCCASION",
            title: "Festive Collection",
            image: "/collections/festive.png",
            alt: "Vibrant festive bangles with colorful stones",
            description:
                "Celebrate every festival in style with dazzling bangles designed to complement your finest outfits.",
        },
        {
            slug: "minimal-daily",
            tag: "STYLE",
            title: "Minimal & Daily Wear",
            image: "/collections/minimal-daily.png",
            alt: "Sleek minimal bangles for everyday elegance",
            description:
                "Effortless elegance for everyday moments — lightweight, chic, and designed for the modern woman.",
        },
        {
            slug: "oxidised",
            tag: "MATERIAL",
            title: "Oxidised Collection",
            image: "/collections/oxidised.png",
            alt: "Artisanal oxidised silver bangles and tribal jewelry",
            description:
                "Embrace the raw beauty of handcrafted oxidised silver — bohemian, bold, and utterly captivating.",
        },
        {
            slug: "traditional-ethnic",
            tag: "STYLE",
            title: "Traditional & Ethnic",
            image: "/collections/traditional-ethnic.png",
            alt: "Traditional gold bangles with intricate temple designs",
            description:
                "Heritage meets artistry — classic temple designs and ethnic motifs that honour India's rich jewellery legacy.",
        },
    ]);

    console.log("✅ Collections seeded");

    // ── Products ─────────────────────────────────────────────────────────────
    console.log("🌱 Seeding products…");

    await db.insert(products).values([
        // ── Bridal & Wedding (5 products) ──────────────────────────────────────
        {
            name: "Royal Kundan Bridal Bangle Set",
            description:
                "A regal set of kundan-studded bangles with intricate gold filigree — the perfect statement for your wedding day.",
            image: "/Bridal and Wedding/1.png",
            price: 24999,
            collectionSlug: "bridal-wedding",
        },
        {
            name: "Meenakari Bridal Chooda",
            description:
                "Traditional red and green meenakari bangles with delicate hand-painted floral patterns, ideal for the bridal ceremony.",
            image: "/Bridal and Wedding/3.png",
            price: 18999,
            collectionSlug: "bridal-wedding",
        },
        {
            name: "Diamond Studded Wedding Kada",
            description:
                "A luxurious broad kada encrusted with brilliant-cut diamonds, designed to be the centrepiece of your bridal look.",
            image: "/Bridal and Wedding/10.png",
            price: 64999,
            collectionSlug: "bridal-wedding",
        },
        {
            name: "Polki Heritage Bangle Pair",
            description:
                "Uncut polki diamonds set in 22K gold with a vintage jadau finish — an heirloom in the making.",
            image: "/Bridal and Wedding/13.png",
            price: 42999,
            collectionSlug: "bridal-wedding",
        },
        {
            name: "Pearl & Gold Bridal Bangles",
            description:
                "Delicate seed pearls woven into a gold lattice create a bangle set that exudes bridal grace and sophistication.",
            image: "/Bridal and Wedding/15.png",
            price: 32999,
            collectionSlug: "bridal-wedding",
        },

        // ── Festive (6 products) ───────────────────────────────────────────────
        {
            name: "Ruby & Emerald Festive Kada",
            description:
                "A show-stopping broad kada with alternating rubies and emeralds set in ornate gold — perfect for Diwali celebrations.",
            image: "/Festive/4.png",
            price: 29999,
            collectionSlug: "festive",
        },
        {
            name: "Navratna Nine-Stone Bangle",
            description:
                "Features all nine auspicious gemstones in a sleek gold band — bringing prosperity and colour to every festival.",
            image: "/Festive/6.png",
            price: 19999,
            collectionSlug: "festive",
        },
        {
            name: "Temple Gold Festive Set",
            description:
                "Inspired by South Indian temple art, these bangles feature goddess motifs and intricate detailing for auspicious occasions.",
            image: "/Festive/14.png",
            price: 27999,
            collectionSlug: "festive",
        },
        {
            name: "Floral Jhumka Bangle Pair",
            description:
                "Unique bangles with dangling jhumka charms and floral engravings — a festive conversation starter.",
            image: "/Festive/19.png",
            price: 15999,
            collectionSlug: "festive",
        },
        {
            name: "Coloured Enamel Celebration Set",
            description:
                "A vibrant stack of enamel-coated bangles in festive hues — turquoise, coral, and gold blend together beautifully.",
            image: "/Festive/22.png",
            price: 12999,
            collectionSlug: "festive",
        },
        {
            name: "Antique Gold Kangana",
            description:
                "A single statement kangana with a matte antique finish and hand-engraved paisley motifs, ideal for every puja and gathering.",
            image: "/Festive/23.png",
            price: 21999,
            collectionSlug: "festive",
        },

        // ── Minimal & Daily Wear (5 products) ──────────────────────────────────
        {
            name: "Rose Gold Sleek Bangle",
            description:
                "A slender rose-gold band with a brushed satin finish — understated luxury for office or brunch.",
            image: "/Minimal-Daily wear/7.png",
            price: 4999,
            collectionSlug: "minimal-daily",
        },
        {
            name: "Twisted Wire Open Cuff",
            description:
                "Two intertwined gold wires form an adjustable cuff that pairs effortlessly with any outfit.",
            image: "/Minimal-Daily wear/12.png",
            price: 3999,
            collectionSlug: "minimal-daily",
        },
        {
            name: "Diamond Accent Thin Bangle",
            description:
                "A whisper-thin gold bangle with a single row of pavé diamonds — discreet sparkle for everyday wear.",
            image: "/Minimal-Daily wear/17.png",
            price: 8999,
            collectionSlug: "minimal-daily",
        },
        {
            name: "Stackable Matte Gold Trio",
            description:
                "Three matte-finish bangles of varying widths designed to be stacked or worn solo for a modern minimal look.",
            image: "/Minimal-Daily wear/18.png",
            price: 6999,
            collectionSlug: "minimal-daily",
        },
        {
            name: "Chain Link Daily Bracelet",
            description:
                "A delicate chain-link bracelet in yellow gold with a secure clasp — your go-to accessory for daily elegance.",
            image: "/Minimal-Daily wear/20.png",
            price: 5499,
            collectionSlug: "minimal-daily",
        },

        // ── Oxidised (2 products) ──────────────────────────────────────────────
        {
            name: "Tribal Oxidised Cuff Bangle",
            description:
                "A bold, wide cuff with geometric tribal patterns in oxidised silver — artisanal craftsmanship with a bohemian edge.",
            image: "/Oxidised/8.png",
            price: 2499,
            collectionSlug: "oxidised",
        },
        {
            name: "Oxidised Ghungroo Bangle Set",
            description:
                "Playful ghungroo (bell) charms dangle from these oxidised bangles, creating a joyful jingle with every movement.",
            image: "/Oxidised/11.png",
            price: 1999,
            collectionSlug: "oxidised",
        },

        // ── Traditional & Ethnic (5 products) ──────────────────────────────────
        {
            name: "Lakshmi Temple Gold Kada",
            description:
                "A broad kada featuring the Goddess Lakshmi motif in 22K gold — a timeless symbol of wealth and prosperity.",
            image: "/Traditional-Ethinic/2.png",
            price: 34999,
            collectionSlug: "traditional-ethnic",
        },
        {
            name: "Rajasthani Gota Bangle Pair",
            description:
                "Inspired by Rajasthani craftsmanship, these bangles feature gold thread weaving and colourful stone inlay.",
            image: "/Traditional-Ethinic/5.png",
            price: 14999,
            collectionSlug: "traditional-ethnic",
        },
        {
            name: "Peacock Motif Ethnic Bangle",
            description:
                "An exquisite bangle adorned with peacock engravings and enamel — celebrating India's national bird in gold.",
            image: "/Traditional-Ethinic/9.png",
            price: 22999,
            collectionSlug: "traditional-ethnic",
        },
        {
            name: "Filigree Jali Work Bangles",
            description:
                "Delicate jali (lattice) filigree work in pure gold creates a lightweight yet ornate ethnic bangle set.",
            image: "/Traditional-Ethinic/16.png",
            price: 19999,
            collectionSlug: "traditional-ethnic",
        },
        {
            name: "South Indian Vanki Bangle",
            description:
                "A traditional vanki-style armlet reimagined as a bangle — featuring serpentine curves and temple motifs.",
            image: "/Traditional-Ethinic/21.png",
            price: 26999,
            collectionSlug: "traditional-ethnic",
        },
    ]);

    console.log("✅ Products seeded");
    console.log("🎉 Done!");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
