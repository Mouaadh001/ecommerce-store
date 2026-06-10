-- ============================================================
-- Stop-Desk Prices Table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS stop_desk_prices (
  wilaya_code      TEXT NOT NULL,
  commune_key      TEXT NOT NULL,
  commune_name_ar  TEXT NOT NULL DEFAULT '',
  commune_name_fr  TEXT NOT NULL DEFAULT '',
  price            NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wilaya_code, commune_key)
);

-- Index for fast lookups by wilaya
CREATE INDEX IF NOT EXISTS idx_stop_desk_prices_wilaya
  ON stop_desk_prices(wilaya_code);

-- Row-Level Security
ALTER TABLE stop_desk_prices ENABLE ROW LEVEL SECURITY;

-- Public can read prices (needed at checkout time)
CREATE POLICY "stop_desk_prices_public_read"
  ON stop_desk_prices FOR SELECT USING (true);

-- Only admin can write
CREATE POLICY "stop_desk_prices_admin_all"
  ON stop_desk_prices FOR ALL
  USING ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com')
  WITH CHECK ((auth.jwt()->>'email') = 'mikacheabdou@gmail.com');
