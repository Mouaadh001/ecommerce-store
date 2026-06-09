-- Production migration for product colors/sizes and selected order options.
-- Safe to run more than once in the Supabase SQL Editor.

ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_options JSONB NOT NULL DEFAULT '{}';
