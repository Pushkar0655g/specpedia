-- 003_purge_and_history.sql
-- Close data-integrity gap, establish price history and watchlist tables with RLS

-- 1. Ensure required columns exist on public.items
ALTER TABLE public.items 
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

-- 2. DELETE category 'Guns' and its items
DELETE FROM public.items 
WHERE category_id IN (
  SELECT id FROM public.categories WHERE lower(name) = 'guns'
) OR lower(coalesce(brand, '')) IN (
  'glock', 'sig sauer', 'beretta', 'smith & wesson', 'remington', 'winchester', 'cz', 'benelli'
);

DELETE FROM public.categories 
WHERE lower(name) = 'guns';

-- 3. DELETE items whose specs jsonb contains 'N/A' or name ILIKE '%Rumored%' or ILIKE '%Buds%'
DELETE FROM public.items 
WHERE specs::text ILIKE '%N/A%' 
   OR name ILIKE '%Rumored%' 
   OR name ILIKE '%Buds%';

-- 4. Deduplicate items on (lower(name), lower(brand)) keeping MIN(id)
DELETE FROM public.items a 
USING public.items b 
WHERE a.id > b.id 
  AND lower(trim(a.name)) = lower(trim(b.name)) 
  AND lower(trim(coalesce(a.brand, ''))) = lower(trim(coalesce(b.brand, '')));

-- 5. UPDATE items SET status='active' WHERE status IS NULL
UPDATE public.items 
SET status = 'active' 
WHERE status IS NULL;

-- 6. CREATE TABLE IF NOT EXISTS public.price_history
CREATE TABLE IF NOT EXISTS public.price_history (
  id bigserial PRIMARY KEY,
  item_id bigint REFERENCES public.items(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- CREATE INDEX on price_history(item_id, recorded_at)
CREATE INDEX IF NOT EXISTS idx_price_history_item_recorded ON public.price_history(item_id, recorded_at);

-- 7. CREATE TABLE IF NOT EXISTS public.watchlist
CREATE TABLE IF NOT EXISTS public.watchlist (
  user_id uuid NOT NULL,
  item_id bigint NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  target_price numeric(10,2),
  notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

-- 8. ENABLE ROW LEVEL SECURITY on both
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- 9. price_history: SELECT policy for anon and authenticated
DROP POLICY IF EXISTS "Allow read price_history for anon and authenticated" ON public.price_history;
CREATE POLICY "Allow read price_history for anon and authenticated" 
  ON public.price_history 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- 10. watchlist: ALL policies using (auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
CREATE POLICY "Users can manage own watchlist" 
  ON public.watchlist 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
