import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { computeCodexScore } from '../lib/scoring.js';
import { TTLCache } from '../ai/cache.js';

dotenv.config();
const router = express.Router();

const statsCache = new TTLCache();
const moversCache = new TTLCache();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET /stats — returns { totalDevices, totalBrands, avgPrice, currency: 'INR' } with 5-minute TTL cache
router.get('/stats', async (req, res) => {
  try {
    const cached = statsCache.get('items:stats');
    if (cached) {
      return res.json(cached);
    }

    const { data, error } = await supabase
      .from('items')
      .select('id, brand, price')
      .eq('category_id', 1);

    if (error) throw error;

    const items = data || [];
    const totalDevices = items.length;
    const uniqueBrands = new Set(items.map((r) => r.brand).filter(Boolean));
    const totalBrands = uniqueBrands.size;

    const pricedItems = items.filter((r) => typeof r.price === 'number' && r.price > 0);
    const avgPrice =
      pricedItems.length > 0
        ? Math.round(pricedItems.reduce((acc, r) => acc + r.price, 0) / pricedItems.length)
        : 0;

    const result = {
      totalDevices,
      totalBrands,
      avgPrice,
      currency: 'INR',
      // backward compatibility for client components using deviceCount / brandCount
      deviceCount: totalDevices,
      brandCount: totalBrands,
    };

    statsCache.set('items:stats', result, 5 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET /brands — distinct brands with counts, category_id=1 only
router.get('/brands', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('brand')
      .eq('category_id', 1);

    if (error) throw error;

    const brandCounts = (data || []).reduce((acc, item) => {
      if (item.brand) {
        acc[item.brand] = (acc[item.brand] || 0) + 1;
      }
      return acc;
    }, {});

    const brands = Object.keys(brandCounts).map((b) => ({
      name: b,
      brand: b,
      count: brandCounts[b],
    }));
    res.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET /movers — top 5 risers and top 5 fallers based on weekly price history with 10-minute TTL cache
router.get('/movers', async (req, res) => {
  try {
    const cached = moversCache.get('items:movers');
    if (cached) {
      return res.json(cached);
    }

    // Try reading from public.price_history table
    const { data: historyRows, error: historyErr } = await supabase
      .from('price_history')
      .select('item_id, price, recorded_at')
      .order('recorded_at', { ascending: false });

    // If table doesn't exist or query fails or empty, degrade gracefully
    if (historyErr || !historyRows || historyRows.length === 0) {
      const fallback = { risers: [], fallers: [] };
      moversCache.set('items:movers', fallback, 10 * 60 * 1000);
      return res.json(fallback);
    }

    // Fetch items catalog to join name/slug/price
    const { data: items, error: itemsErr } = await supabase
      .from('items')
      .select('id, name, slug, price, brand')
      .eq('category_id', 1);

    if (itemsErr) throw itemsErr;
    const itemsMap = new Map((items || []).map((it) => [it.id, it]));

    const getSlug = (it) =>
      it.slug ||
      (it.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      String(it.id);

    // Group history by item_id
    const itemHistories = new Map();
    for (const row of historyRows) {
      if (!itemHistories.has(row.item_id)) {
        itemHistories.set(row.item_id, []);
      }
      const list = itemHistories.get(row.item_id);
      if (list.length < 12) {
        list.push(row);
      }
    }

    const calculatedMovers = [];
    for (const [itemId, rows] of itemHistories.entries()) {
      const it = itemsMap.get(itemId);
      if (!it || rows.length < 2) continue;
      const latestPrice = Number(rows[0].price);
      const prevPrice = Number(rows[1].price);
      if (prevPrice <= 0 || isNaN(latestPrice) || isNaN(prevPrice)) continue;
      const deltaPercent = Number((((latestPrice - prevPrice) / prevPrice) * 100).toFixed(1));
      calculatedMovers.push({
        id: it.id,
        name: it.name,
        slug: getSlug(it),
        price: latestPrice,
        currency: it.currency || 'INR',
        deltaPercent,
        history: [...rows].reverse(),
      });
    }

    const risers = [...calculatedMovers]
      .sort((a, b) => b.deltaPercent - a.deltaPercent)
      .slice(0, 5);

    const fallers = [...calculatedMovers]
      .sort((a, b) => a.deltaPercent - b.deltaPercent)
      .slice(0, 5);

    const result = { risers, fallers };
    moversCache.set('items:movers', result, 10 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error('Error fetching movers:', err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET / — all items (with optional category, brand, limit, offset, slug)
router.get('/', async (req, res) => {
  try {
    const { category, brand, slug } = req.query;

    // Slug lookup — return single enriched item
    if (slug) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.json({
        ...data,
        codexScore: computeCodexScore(data),
      });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    let query = supabase.from('items').select('*');

    if (category !== undefined && category !== null && category !== '') {
      const catId = parseInt(category, 10);
      if (!isNaN(catId)) {
        query = query.eq('category_id', catId);
      }
    } else if (brand) {
      // Default to mobiles (category_id = 1) if filtering by brand without explicit category
      query = query.eq('category_id', 1);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    query = query.order('category_id', { ascending: true }).order('id', { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    const enriched = (data || []).map((item) => ({
      ...item,
      codexScore: computeCodexScore(item),
    }));
    res.json(enriched);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET /:id/history — returns price_history rows for that item ordered by recorded_at ASC. 404 if item missing, empty array if no history rows.
router.get('/:id/history', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const { data: item, error: itemErr } = await supabase
      .from('items')
      .select('id')
      .eq('id', itemId)
      .maybeSingle();

    if (itemErr) throw itemErr;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { data: historyRows, error: historyErr } = await supabase
      .from('price_history')
      .select('id, item_id, price, recorded_at')
      .eq('item_id', itemId)
      .order('recorded_at', { ascending: true });

    if (historyErr || !historyRows) {
      return res.json([]);
    }

    res.json(historyRows);
  } catch (err) {
    console.error(`Error fetching price history for item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET /:id — single item by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({
      ...data,
      codexScore: computeCodexScore(data),
    });
  } catch (err) {
    console.error(`Error fetching item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

export default router;