import express from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// All routes in this router require authentication
router.use(requireAuth);

const watchlistUpsertSchema = z.object({
  itemId: z.union([
    z.number().int().positive(),
    z.string().regex(/^\d+$/).transform((val) => parseInt(val, 10)),
  ]),
  targetPrice: z
    .union([
      z.number().positive(),
      z.string().regex(/^\d+(\.\d+)?$/).transform((val) => parseFloat(val)),
    ])
    .optional()
    .nullable(),
});

/**
 * GET /
 * Lists authenticated user's watchlist rows joined with item name, brand, and price
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        user_id,
        item_id,
        target_price,
        notified_at,
        created_at,
        items (
          id,
          name,
          brand,
          price,
          specs
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message && error.message.includes('watchlist')) {
        return res.json([]);
      }
      throw error;
    }

    const formatted = (data || []).map((row) => ({
      userId: row.user_id,
      itemId: row.item_id,
      targetPrice: row.target_price !== null ? Number(row.target_price) : null,
      notifiedAt: row.notified_at,
      createdAt: row.created_at,
      item: row.items || null,
      name: row.items?.name || 'Unknown Device',
      brand: row.items?.brand || '',
      price: row.items?.price ? Number(row.items.price) : 0,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching user watchlist:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

/**
 * POST /
 * Upserts a watchlist row with optional target price
 */
router.post('/', async (req, res) => {
  try {
    const parseResult = watchlistUpsertSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parseResult.error.issues,
      });
    }

    const { itemId, targetPrice } = parseResult.data;

    const { data, error } = await supabase
      .from('watchlist')
      .upsert(
        {
          user_id: req.user.id,
          item_id: itemId,
          target_price: targetPrice !== undefined ? targetPrice : null,
        },
        { onConflict: 'user_id, item_id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase watchlist upsert error:', error);
      return res.status(500).json({ error: 'Failed to save to watchlist' });
    }

    res.status(200).json({
      success: true,
      data: data || { user_id: req.user.id, item_id: itemId, target_price: targetPrice },
    });
  } catch (err) {
    console.error('Watchlist upsert error:', err);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

/**
 * DELETE /:itemId
 * Removes an item from the authenticated user's watchlist
 */
router.delete('/:itemId', async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId' });
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', req.user.id)
      .eq('item_id', itemId);

    if (error) {
      console.error('Supabase watchlist delete error:', error);
      return res.status(500).json({ error: 'Failed to remove from watchlist' });
    }

    res.status(200).json({ success: true, message: 'Removed from watchlist' });
  } catch (err) {
    console.error('Watchlist delete error:', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
