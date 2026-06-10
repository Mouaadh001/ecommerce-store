-- Security hardening: orders must be created through the Next.js API route.
-- The API route validates products, stock, shipping, rate limits, and same-origin requests.
-- The Supabase anon key should not be able to insert arbitrary order rows directly.

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_public_insert" ON orders;
DROP POLICY IF EXISTS "order_items_public_insert" ON order_items;

-- Keep owner/admin reads and admin updates in the existing migrations.
-- Server-side writes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS by design.
