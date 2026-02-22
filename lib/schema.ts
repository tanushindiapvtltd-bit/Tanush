import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";

// ─── Collections ───────────────────────────────────────────────────────────
export const collections = pgTable("collections", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    tag: varchar("tag", { length: 50 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    image: text("image").notNull(),               // path relative to /public
    alt: text("alt").notNull(),
    description: text("description").notNull(),
});

// ─── Products ──────────────────────────────────────────────────────────────
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),               // path relative to /public
    price: integer("price").notNull(),            // price in INR (paise or whole)
    collectionSlug: varchar("collection_slug", { length: 100 })
        .notNull()
        .references(() => collections.slug),
});
