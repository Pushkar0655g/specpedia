import express from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { callWithFallback } from '../ai/groq.js';

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const recommendSchema = z.object({
  budget: z.number().positive().optional(),
  priorities: z.array(z.string()).max(3).optional(),
  freeText: z.string().max(500).optional(),
});

export const joinPicksToPool = (picks, pool) => {
  const poolMap = new Map(pool.map((item) => [item.id, item]));
  const validPicks = [];

  if (Array.isArray(picks)) {
    for (const pick of picks) {
      const item = poolMap.get(pick.id);
      if (item) {
        validPicks.push({
          ...item,
          reason: pick.reason || '',
        });
      }
    }
  }
  return validPicks.slice(0, 3);
};

export const handleRecommend = async (req, res) => {
  const parseResult = recommendSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors?.[0]?.message || 'Invalid request body';
    return res.status(400).json({ error: errorMsg });
  }

  const { budget, priorities, freeText } = parseResult.data;

  try {
    // Step A: Retrieval
    let query = supabase
      .from('items')
      .select('id, name, brand, price, specs')
      .eq('category_id', 1);

    if (budget) {
      query = query.lte('price', budget * 1.15);
    }

    const { data: pool, error: dbError } = await query.limit(40);
    if (dbError) throw dbError;

    if (!pool || pool.length === 0) {
      return res.json({
        picks: [],
        reasoning: 'No devices matched the requested budget or criteria in the codex.',
      });
    }

    // Step B: AI Completion with response_format json_object
    const poolJson = JSON.stringify(
      pool.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        specs: item.specs,
      }))
    );

    const systemPrompt = `You must choose ONLY from this catalog: ${poolJson}. Return a valid JSON object formatted exactly as {"picks":[{"id":<id>,"reason":"<one sentence>"}],"reasoning":"<two sentences>"}. Exactly 3 picks.`;

    let userMessage = freeText;
    if (!userMessage) {
      const budgetStr = budget ? `₹${budget}` : 'any budget';
      const prioritiesStr =
        priorities && priorities.length > 0 ? priorities.join(', ') : 'balanced performance';
      userMessage = `Find the best 3 devices for budget ${budgetStr} with priorities: ${prioritiesStr}.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const rawResponse = await callWithFallback(messages, {
      response_format: { type: 'json_object' },
      temperature: 0.3,
      onMeta: (meta) => {
        res.locals.aiMeta = meta;
      },
    });

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResponse);
    } catch (parseErr) {
      console.error('Failed to parse AI JSON response:', rawResponse);
      throw new Error('Invalid JSON from AI');
    }

    // Step C: Join picks back to pool rows, drop ids not in pool
    const validPicks = joinPicksToPool(parsedResult.picks, pool);

    return res.json({
      picks: validPicks,
      reasoning: parsedResult.reasoning || '',
    });
  } catch (err) {
    console.error('Recommend error:', err);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

router.post('/', handleRecommend);
router.post('/recommend', handleRecommend);

export default router;
