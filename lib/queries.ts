import { db } from "./db";
import { collections, products } from "./schema";
import { eq } from "drizzle-orm";

// ─── Collections ───────────────────────────────────────────────────────────

export async function getCollections() {
    return db.select().from(collections);
}

export async function getCollectionBySlug(slug: string) {
    const rows = await db
        .select()
        .from(collections)
        .where(eq(collections.slug, slug))
        .limit(1);
    return rows[0] ?? null;
}

// ─── Products ──────────────────────────────────────────────────────────────

export async function getProductsByCollection(slug: string) {
    return db
        .select()
        .from(products)
        .where(eq(products.collectionSlug, slug));
}
