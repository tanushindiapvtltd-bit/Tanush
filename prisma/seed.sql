-- Run this SQL in your Neon DB to seed product catalog
-- Execute via Neon SQL Editor or psql

-- Create enum types (if using raw SQL, Prisma handles this via db push)
-- After running `prisma db push`, run this seed:

INSERT INTO products (id, name, price, price_num, category, category_key, main_image, thumbs, description, specs, in_stock, created_at, updated_at)
VALUES
(1, 'Gold Tone Handcrafted Bangle Set', '₹599', 599, 'Bridal', 'bridal',
 '/collections/bridal/Catalog 1/1.png',
 '["/collections/bridal/Catalog 1/1.png","/collections/bridal/Catalog 1/1.1 599.png","/collections/bridal/Catalog 1/1.2.png","/collections/bridal/Catalog 1/1.3.png"]',
 'A masterpiece of bridal elegance. This handcrafted gold-tone bangle set features intricate detailing with multicolour stone inlay, designed for the bride who appreciates timeless beauty and understated grace.',
 '[{"label":"Material","value":"Gold Plated Brass"},{"label":"Pieces","value":"4 Bangles"},{"label":"Style","value":"Bridal"},{"label":"Finish","value":"High Polish Gold"},{"label":"Diameter","value":"6.5 cm"}]',
 true, NOW(), NOW()),

(2, 'Gold Plated 6pc Bangle Set', '₹999', 999, 'Bridal', 'bridal',
 '/collections/bridal/catalog 2/2.png',
 '["/collections/bridal/catalog 2/2.png","/collections/bridal/catalog 2/2.1 999.png"]',
 'An opulent 6-piece gold plated bangle set designed to elevate your bridal ensemble. Each bangle is adorned with rich meenakari work and traditional motifs that celebrate time-honoured Indian craftsmanship.',
 '[{"label":"Material","value":"Gold Plated Brass"},{"label":"Pieces","value":"6 Bangles"},{"label":"Style","value":"Bridal"},{"label":"Finish","value":"Antique Gold"},{"label":"Diameter","value":"6.5 cm"}]',
 true, NOW(), NOW()),

(3, 'Gold Plated Bridal Bangle Set', '₹999', 999, 'Bridal', 'bridal',
 '/collections/bridal/catalog 3/3.png',
 '["/collections/bridal/catalog 3/3.png","/collections/bridal/catalog 3/3.1 999.png","/collections/bridal/catalog 3/3.2.png","/collections/bridal/catalog 3/3.3.png"]',
 'A luxurious bridal bangle set featuring ornate designs with vibrant stone accents. Perfect for the modern bride seeking a blend of heritage and contemporary style on her most special day.',
 '[{"label":"Material","value":"Gold Plated Brass"},{"label":"Pieces","value":"6 Bangles"},{"label":"Style","value":"Bridal"},{"label":"Finish","value":"High Polish Gold"},{"label":"Diameter","value":"6.5 cm"}]',
 true, NOW(), NOW()),

(4, 'Classic Gold Plated 4pc Bangle Set', '₹599', 599, 'Bridal', 'bridal',
 '/collections/bridal/catalog 4/9.png',
 '["/collections/bridal/catalog 4/9.png","/collections/bridal/catalog 4/9.1 599.png","/collections/bridal/catalog 4/9.2.png"]',
 'A classic 4-piece gold plated bangle set that exudes regal charm. With beautiful filigree patterns and a warm golden sheen, this set is crafted to complement traditional bridal attire.',
 '[{"label":"Material","value":"Gold Plated Brass"},{"label":"Pieces","value":"4 Bangles"},{"label":"Style","value":"Bridal"},{"label":"Finish","value":"Classic Gold"},{"label":"Diameter","value":"6.5 cm"}]',
 true, NOW(), NOW()),

(5, 'Traditional Ethnic Bangle Set', '₹449', 449, 'Traditional & Ethnic', 'traditional',
 '/collections/traditional ethinic/catalog 1/4.png',
 '["/collections/traditional ethinic/catalog 1/4.png","/collections/traditional ethinic/catalog 1/4.1 449.png"]',
 'A beautiful traditional bangle set rooted in the rich heritage of Indian jewellery. Hand-embellished with kundan-style stone settings, these bangles bring timeless ethnic charm to any outfit.',
 '[{"label":"Material","value":"Brass with Stone Work"},{"label":"Pieces","value":"2 Bangles"},{"label":"Style","value":"Traditional"},{"label":"Finish","value":"Antique Gold"},{"label":"Diameter","value":"6.4 cm"}]',
 true, NOW(), NOW()),

(6, 'Ethnic Designer Bangle Set', '₹449', 449, 'Traditional & Ethnic', 'traditional',
 '/collections/traditional ethinic/catclog 2/5.png',
 '["/collections/traditional ethinic/catclog 2/5.png","/collections/traditional ethinic/catclog 2/5.1 449.png","/collections/traditional ethinic/catclog 2/5.2.png"]',
 'An exquisite designer bangle set that embodies the art of Indian ethnic jewellery. Featuring intricate silver-tone bead work and a contemporary silhouette that pairs beautifully with sarees and lehengas.',
 '[{"label":"Material","value":"Silver Plated Alloy"},{"label":"Pieces","value":"Set of 3"},{"label":"Style","value":"Ethnic Designer"},{"label":"Finish","value":"Oxidised Silver"},{"label":"Diameter","value":"6.4 cm"}]',
 true, NOW(), NOW()),

(7, 'Heritage Bangle Collection', '₹449', 449, 'Traditional & Ethnic', 'traditional',
 '/collections/traditional ethinic/catclog 3/6.png',
 '["/collections/traditional ethinic/catclog 3/6.png","/collections/traditional ethinic/catclog 3/6.1 449.png"]',
 'A heritage collection inspired by the royal courts of India. Each bangle carries delicate handwork and glowing finishes that speak of tradition, culture, and timeless elegance.',
 '[{"label":"Material","value":"Gold Plated Brass"},{"label":"Pieces","value":"2 Bangles"},{"label":"Style","value":"Heritage"},{"label":"Finish","value":"Matte Gold"},{"label":"Diameter","value":"6.4 cm"}]',
 true, NOW(), NOW()),

(8, 'Classic Ethnic Bangle Set', '₹399', 399, 'Traditional & Ethnic', 'traditional',
 '/collections/traditional ethinic/catclog 4/8.png',
 '["/collections/traditional ethinic/catclog 4/8.png","/collections/traditional ethinic/catclog 4/8.1 399.png"]',
 'A classic ethnic bangle set with circular jhumka-style detailing. Lightweight yet statement-making, these bangles add an elegant festive touch to everyday and occasion wear.',
 '[{"label":"Material","value":"Gold Plated Alloy"},{"label":"Pieces","value":"2 Bangles"},{"label":"Style","value":"Classic Ethnic"},{"label":"Finish","value":"High Polish Gold"},{"label":"Diameter","value":"6.5 cm"}]',
 true, NOW(), NOW()),

(9, 'Festive Ethnic Bangle Set', '₹399', 399, 'Traditional & Ethnic', 'traditional',
 '/collections/traditional ethinic/catalog 5/10.png',
 '["/collections/traditional ethinic/catalog 5/10.png","/collections/traditional ethinic/catalog 5/10.1 399.png","/collections/traditional ethinic/catalog 5/10.2.png"]',
 'Celebrate every festive moment with this beautiful ethnic bangle set. Features a warm gold finish with subtle engraving patterns that catch the light beautifully.',
 '[{"label":"Material","value":"Gold Plated Brass"},{"label":"Pieces","value":"Set of 3"},{"label":"Style","value":"Festive"},{"label":"Finish","value":"Satin Gold"},{"label":"Diameter","value":"6.4 cm"}]',
 true, NOW(), NOW()),

(10, 'Minimal Gold Bangle Set', '₹349', 349, 'Minimal & Daily', 'minimal',
 '/collections/minimal and daily/7.png',
 '["/collections/minimal and daily/7.png","/collections/minimal and daily/7.1 349.PNG","/collections/minimal and daily/7.2.PNG"]',
 'A refined minimal bangle set for the modern woman. Lightweight, elegant, and perfectly understated — designed to be worn from morning meetings to evening gatherings with effortless grace.',
 '[{"label":"Material","value":"Gold Plated Alloy"},{"label":"Pieces","value":"Set of 3"},{"label":"Style","value":"Minimal"},{"label":"Finish","value":"Brushed Gold"},{"label":"Diameter","value":"6.2 cm"}]',
 true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Reset the sequence so next product gets id=11
SELECT setval(pg_get_serial_sequence('products', 'id'), 10, true);

-- To make a user admin, run:
-- UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
