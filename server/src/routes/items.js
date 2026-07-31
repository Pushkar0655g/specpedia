import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET all items (with optional brand filter)
router.get('/', async (req, res) => {
  try {
    const { brand } = req.query;
    let query = supabase.from('items').select('*');
    
    if (brand) {
      // Exact match for bulletproof filtering
      query = query.eq('brand', brand).eq('category_id', 1); 
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET all unique brands with item counts (Mobiles only)
router.get('/brands', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('brand')
      .eq('category_id', 1); // <-- ADD THIS LINE (Only fetch Mobiles)
      
    if (error) throw error;

    const brandCounts = data.reduce((acc, item) => {
      if (item.brand) {
        acc[item.brand] = (acc[item.brand] || 0) + 1;
      }
      return acc;
    }, {});

    const brands = Object.keys(brandCounts).map(b => ({ name: b, count: brandCounts[b] }));
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single item by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('items').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;