-- 002_data_cleanup.sql
-- Clean up dummy/invalid data, deduplicate, normalize currencies, and populate slugs

-- 1. DELETE the 'Guns' category and its items
DELETE FROM public.items 
WHERE category_id IN (
  SELECT id FROM public.categories WHERE lower(name) = 'guns'
) OR lower(brand) IN ('glock', 'sig sauer', 'beretta', 'smith & wesson', 'remington', 'winchester', 'cz', 'benelli');

DELETE FROM public.categories 
WHERE lower(name) = 'guns';

-- 2. DELETE category-1 items whose specs contain 'N/A' or whose name contains 'Rumored' or 'Buds'
DELETE FROM public.items 
WHERE category_id = 1 
  AND (
    specs::text ILIKE '%N/A%' 
    OR name ILIKE '%Rumored%' 
    OR name ILIKE '%Buds%'
  );

-- 3. Deduplicate items on (lower(name), lower(brand)) keeping the lowest id
DELETE FROM public.items a 
USING public.items b 
WHERE a.id > b.id 
  AND lower(trim(a.name)) = lower(trim(b.name)) 
  AND lower(trim(coalesce(a.brand, ''))) = lower(trim(coalesce(b.brand, '')));

-- 4. Normalize currency: UPDATE items SET price = price * 83, currency = 'INR' WHERE category_id = 1 AND price < 2000
UPDATE public.items 
SET price = price * 83, 
    currency = 'INR' 
WHERE category_id = 1 
  AND price < 2000;

-- Ensure all category 1 items have currency = 'INR'
UPDATE public.items
SET currency = 'INR'
WHERE category_id = 1;

-- 5. Generate slug = lower(regexp_replace(name, '[^a-z0-9]+', '-', 'gi'))
-- Handle '+' as '-plus' first to avoid collisions on plus models (e.g., S25+ vs S25)
UPDATE public.items 
SET slug = trim(both '-' from lower(regexp_replace(replace(name, '+', '-plus'), '[^a-zA-Z0-9]+', '-', 'g')));
