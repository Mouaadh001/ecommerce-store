-- Production migration for shipping prices and admin RLS policies.
-- Safe to run more than once in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS shipping_prices (
  wilaya_code    TEXT PRIMARY KEY,
  wilaya_name_ar TEXT NOT NULL,
  wilaya_name_fr TEXT NOT NULL,
  home_price     NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (home_price >= 0),
  office_price   NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (office_price >= 0),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

DROP POLICY IF EXISTS "orders_admin_select" ON orders;
CREATE POLICY "orders_admin_select" ON orders FOR SELECT
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

DROP POLICY IF EXISTS "orders_public_insert" ON orders;
CREATE POLICY "orders_public_insert" ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_admin_select" ON order_items;
CREATE POLICY "order_items_admin_select" ON order_items FOR SELECT
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');

DROP POLICY IF EXISTS "order_items_public_insert" ON order_items;
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "shipping_prices_public_read" ON shipping_prices;
CREATE POLICY "shipping_prices_public_read" ON shipping_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "shipping_prices_admin_all" ON shipping_prices;
CREATE POLICY "shipping_prices_admin_all" ON shipping_prices FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');
