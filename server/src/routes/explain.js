import express from 'express';
import { z } from 'zod';
import { callWithFallback } from '../ai/groq.js';
import { buildExplainPrompt } from '../ai/prompts.js';
import { get, set } from '../ai/cache.js';

const router = express.Router();

const explainSchema = z
  .object({
    key: z.string().min(1).max(40).optional(),
    value: z.string().min(1).max(120).optional(),
    specKey: z.string().min(1).max(40).optional(),
    specValue: z.string().min(1).max(120).optional(),
  })
  .refine((data) => (data.key || data.specKey) && (data.value || data.specValue), {
    message: 'Key and Value are required',
  });

export const handleExplain = async (req, res) => {
  const parseResult = explainSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors?.[0]?.message || 'Invalid request body';
    return res.status(400).json({ error: errorMsg });
  }

  const key = parseResult.data.key || parseResult.data.specKey;
  const value = parseResult.data.value || parseResult.data.specValue;
  const cacheKey = `${key}:${value}`;

  try {
    const cachedExplanation = get(cacheKey);
    if (cachedExplanation) {
      return res.json({
        explanation: cachedExplanation,
        cached: true,
      });
    }

    const prompt = buildExplainPrompt(key, value);
    const messages = [{ role: 'user', content: prompt }];

    const explanation = await callWithFallback(messages, {
      max_tokens: 90,
      temperature: 0.2,
      onMeta: (meta) => {
        res.locals.aiMeta = meta;
      },
    });

    set(cacheKey, explanation);

    return res.json({
      explanation,
      cached: false,
    });
  } catch (error) {
    console.error('Explain error:', error);
    return res.status(500).json({ error: 'Failed to explain specification' });
  }
};

router.post('/', handleExplain);
router.post('/explain', handleExplain);

export default router;
