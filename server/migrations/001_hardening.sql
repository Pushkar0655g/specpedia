-- 001_hardening.sql
-- Harden public.items and public.categories tables, add indexes, RLS policies, and supporting tables

-- 1. Add columns to public.items
ALTER TABLE public.items 
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

-- 2. Create indexes on (brand, category_id) and (price)
CREATE INDEX IF NOT EXISTS idx_items_brand_category ON public.items (brand, category_id);
CREATE INDEX IF NOT EXISTS idx_items_price ON public.items (price);

-- 3. Enable Row Level Security (RLS) on items and categories
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Create read-only SELECT policies for anon and authenticated roles
DROP POLICY IF EXISTS "Allow public read on items" ON public.items;
CREATE POLICY "Allow public read on items" 
  ON public.items 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories" 
  ON public.categories 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- 5. Create price_history table
CREATE TABLE IF NOT EXISTS public.price_history (
  id bigserial PRIMARY KEY,
  item_id bigint REFERENCES public.items(id) ON DELETE CASCADE,
  price numeric(10,2),
  recorded_at timestamptz DEFAULT now()
);

-- Enable RLS and read-only policy on price_history
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on price_history" ON public.price_history;
CREATE POLICY "Allow public read on price_history" 
  ON public.price_history 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- 6. Create watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
  user_id uuid,
  item_id bigint REFERENCES public.items(id) ON DELETE CASCADE,
  target_price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

-- Enable RLS on watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
CREATE POLICY "Users can manage own watchlist" 
  ON public.watchlist 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
