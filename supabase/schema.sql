-- ============================================================
-- Luminary Store — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL DEFAULT '',
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= 0),
  images           TEXT[] DEFAULT '{}',
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured         BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  phone      TEXT,
  address    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  total            NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  shipping_address JSONB NOT NULL DEFAULT '{}',
  customer_email   TEXT,
  customer_name    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id         UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity           INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_purchase  NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- ============================================================
-- SHIPPING PRICES
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_prices (
  wilaya_code    TEXT PRIMARY KEY,
  wilaya_name_ar TEXT NOT NULL,
  wilaya_name_fr TEXT NOT NULL,
  home_price     NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (home_price >= 0),
  office_price   NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (office_price >= 0),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Categories: public read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all" ON categories FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

-- Products: public read
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

-- Profiles: owner can read/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_owner_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_owner_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_owner_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: owner can read their own; anyone can insert (guest checkout)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_owner_select" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_select" ON orders FOR SELECT
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

-- Order Items: readable if the parent order belongs to the user
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_owner_select" ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_admin_select" ON order_items FOR SELECT
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

-- Shipping Prices: public read; admin writes
ALTER TABLE shipping_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipping_prices_public_read" ON shipping_prices FOR SELECT USING (true);
CREATE POLICY "shipping_prices_admin_all" ON shipping_prices FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

-- ============================================================
-- SEED DATA — Sample Categories
-- ============================================================
INSERT INTO categories (name, slug, description) VALUES
  ('Electronics',     'electronics',     'Cutting-edge gadgets and technology'),
  ('Clothing',        'clothing',        'Premium apparel for every occasion'),
  ('Home & Living',   'home-living',     'Elevate your living space'),
  ('Beauty',          'beauty',          'Skincare, cosmetics, and wellness'),
  ('Sports',          'sports',          'Performance gear and activewear'),
  ('Books',           'books',           'Knowledge and stories for every mind')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — Sample Products
-- ============================================================
INSERT INTO products (name, slug, description, price, compare_at_price, images, category_id, stock, featured) 
SELECT
  'Wireless Noise-Cancelling Headphones',
  'wireless-noise-cancelling-headphones',
  'Premium over-ear headphones with 30-hour battery life, adaptive noise cancellation, and studio-quality sound.',
  199.99, 279.99,
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
  id, 50, true
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, images, category_id, stock, featured)
SELECT
  'Minimalist Leather Watch',
  'minimalist-leather-watch',
  'Swiss movement, genuine leather band, sapphire crystal glass. Timeless elegance for the modern professional.',
  349.00, 450.00,
  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
  id, 30, true
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, images, category_id, stock, featured)
SELECT
  'Premium Cotton T-Shirt',
  'premium-cotton-t-shirt',
  '100% organic cotton, pre-shrunk, and ring-spun for ultimate softness. Available in 12 colours.',
  49.00,
  ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
  id, 150, false
FROM categories WHERE slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, images, category_id, stock, featured)
SELECT
  'Ceramic Pour-Over Coffee Set',
  'ceramic-pour-over-coffee-set',
  'Hand-crafted ceramic dripper, carafe and two mugs. Brews the perfect cup every time.',
  89.00, 120.00,
  ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'],
  id, 45, true
FROM categories WHERE slug = 'home-living'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, images, category_id, stock, featured)
SELECT
  'Natural Face Serum',
  'natural-face-serum',
  'Vitamin C, hyaluronic acid, and retinol blend. 30ml. Dermatologist tested and cruelty-free.',
  68.00,
  ARRAY['https://images.unsplash.com/photo-1570194065650-d99fb4b38c61?w=800'],
  id, 80, false
FROM categories WHERE slug = 'beauty'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, images, category_id, stock, featured)
SELECT
  'Yoga Mat Pro',
  'yoga-mat-pro',
  'Non-slip, eco-friendly TPE material. 6mm thickness for joint support. Includes carrying strap.',
  79.00, 99.00,
  ARRAY['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'],
  id, 60, false
FROM categories WHERE slug = 'sports'
ON CONFLICT (slug) DO NOTHING;
