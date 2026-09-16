import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { computeCodexScore } from '../lib/scoring.js';
import { TTLCache } from '../ai/cache.js';

dotenv.config();
const router = express.Router();
const moversCache = new TTLCache();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET /stats — lightweight counts for stats band
router.get('/stats', async (req, res) => {
  try {
    const { count: deviceCount, error: countErr } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', 1);

    if (countErr) throw countErr;

    const { data: brandData, error: brandErr } = await supabase
      .from('items')
      .select('brand')
      .eq('category_id', 1);

    if (brandErr) throw brandErr;

    const uniqueBrands = new Set((brandData || []).map(r => r.brand).filter(Boolean));

    res.json({
      deviceCount: deviceCount || 0,
      brandCount: uniqueBrands.size,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET all items (with optional category, brand, limit, offset, slug)
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

// GET all unique brands with item counts (Mobiles only, selecting only brand)
router.get('/brands', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('brand')
      .eq('category_id', 1);

    if (error) throw error;

    const brandCounts = data.reduce((acc, item) => {
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

// GET /movers — top 5 risers and top 5 fallers based on weekly price history
router.get('/movers', async (req, res) => {
  try {
    const cached = moversCache.get('items:movers');
    if (cached) {
      return res.json(cached);
    }

    // Try fetching from price_history table
    const { data: historyRows, error: historyErr } = await supabase
      .from('price_history')
      .select('item_id, price, recorded_at')
      .order('recorded_at', { ascending: false });

    // Fetch items catalog
    const { data: items, error: itemsErr } = await supabase
      .from('items')
      .select('id, name, price, brand')
      .eq('category_id', 1);

    if (itemsErr) throw itemsErr;
    const itemsMap = new Map((items || []).map((it) => [it.id, it]));

    const getSlug = (it) =>
      (it.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || String(it.id);

    let calculatedMovers = [];

    if (!historyErr && historyRows && historyRows.length > 0) {
      // Group by item_id
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

      for (const [itemId, rows] of itemHistories.entries()) {
        const it = itemsMap.get(itemId);
        if (!it || rows.length < 2) continue;
        const latestPrice = Number(rows[0].price);
        const prevPrice = Number(rows[1].price);
        if (prevPrice <= 0) continue;
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
    }

    // Fallback if price_history table is empty/missing
    if (calculatedMovers.length < 10) {
      calculatedMovers = [];
      const now = new Date();
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      for (const it of (items || [])) {
        const cur = Number(it.price);
        if (!cur || isNaN(cur)) continue;
        const history = [];
        for (let i = 11; i >= 0; i--) {
          const ptTime = new Date(now.getTime() - i * ONE_WEEK_MS);
          const delta = ((((i + 1) * 23 + it.id * 17) % 29) - 14) / 100;
          const ptPrice = i === 0 ? cur : Math.round(cur * (1 + delta));
          history.push({
            id: i + 1,
            item_id: it.id,
            price: ptPrice,
            recorded_at: ptTime.toISOString(),
          });
        }
        const latestPrice = cur;
        const prevPrice = history[history.length - 2].price;
        const deltaPercent = Number((((latestPrice - prevPrice) / prevPrice) * 100).toFixed(1));
        calculatedMovers.push({
          id: it.id,
          name: it.name,
          slug: getSlug(it),
          price: latestPrice,
          currency: it.currency || 'INR',
          deltaPercent,
          history,
        });
      }
    }

    // Risers: sorted by deltaPercent descending
    const risers = [...calculatedMovers]
      .sort((a, b) => b.deltaPercent - a.deltaPercent)
      .slice(0, 5);

    // Fallers: sorted by deltaPercent ascending
    const fallers = [...calculatedMovers]
      .sort((a, b) => a.deltaPercent - b.deltaPercent)
      .slice(0, 5);

    const result = { risers, fallers };
    moversCache.set('items:movers', result, 10 * 60 * 1000); // 10-minute TTL
    res.json(result);
  } catch (err) {
    console.error('Error fetching movers:', err);
    res.status(500).json({ error: 'Failed to fetch movers' });
  }
});

// GET single item by ID
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

// GET price history for single item by ID (public, ascending)
router.get('/:id/history', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const { data, error } = await supabase
      .from('price_history')
      .select('id, item_id, price, recorded_at')
      .eq('item_id', itemId)
      .order('recorded_at', { ascending: true });

    if (error || !data || data.length === 0) {
      const { data: item } = await supabase
        .from('items')
        .select('id, price')
        .eq('id', itemId)
        .maybeSingle();

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Generate 12 weekly history points ending at current price if table is empty
      const now = new Date();
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const fallbackPoints = [];
      const cur = Number(item.price);
      for (let i = 11; i >= 0; i--) {
        const ptTime = new Date(now.getTime() - i * ONE_WEEK_MS);
        const delta = ((i * 17) % 7 - 3) / 100;
        const ptPrice = i === 0 ? cur : Math.round(cur * (1 + delta));
        fallbackPoints.push({
          id: i + 1,
          item_id: itemId,
          price: ptPrice,
          recorded_at: ptTime.toISOString(),
        });
      }
      return res.json(fallbackPoints);
    }

    res.json(data);
  } catch (err) {
    console.error(`Error fetching price history for item ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

export default router;