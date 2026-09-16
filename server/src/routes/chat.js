import express from 'express';
import { z } from 'zod';
import { callWithFallback, streamWithFallback } from '../ai/groq.js';
import { buildSystemPrompt } from '../ai/prompts.js';

const router = express.Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
  context: z.record(z.string(), z.any()).optional().nullable(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(8, 'History cannot exceed 8 messages')
    .optional(),
});

// Non-streaming chat endpoint (e.g. for Compare verdicts)
router.post('/chat', async (req, res) => {
  const parseResult = chatSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors?.[0]?.message || 'Invalid request body';
    return res.status(400).json({ error: errorMsg });
  }

  try {
    const { message, context, history = [] } = parseResult.data;
    const systemPrompt = buildSystemPrompt(context);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    console.log(`Sending to Groq: "${message}" (history: ${history.length} items)`);
    const reply = await callWithFallback(messages, {
      onMeta: (meta) => {
        res.locals.aiMeta = meta;
      },
    });
    return res.json({ reply });
  } catch (error) {
    console.error('=== GROQ API ERROR ===');
    console.error(error.message);
    if (error.error) console.error(error.error);
    return res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

// Streaming handler supporting SSE
const handleStream = async (req, res) => {
  const parseResult = chatSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors?.[0]?.message || 'Invalid request body';
    return res.status(400).json({ error: errorMsg });
  }

  // Set standard Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let clientAborted = false;
  req.on('close', () => {
    clientAborted = true;
  });

  try {
    const { message, context, history = [] } = parseResult.data;
    const systemPrompt = buildSystemPrompt(context);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    console.log(`Streaming from Groq: "${message}" (history: ${history.length} items)`);
    const { stream, model } = await streamWithFallback(messages);
    res.locals.aiMeta = { model, approxTokens: 0 };
    console.log(`[Stream Active] Delivering tokens from model: ${model}`);

    for await (const chunk of stream) {
      if (clientAborted) {
        console.log('Client closed connection; breaking stream.');
        break;
      }
      const token = chunk.choices[0]?.delta?.content ?? '';
      res.locals.aiMeta.approxTokens += 1;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    if (!clientAborted) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    console.error('=== STREAMING GROQ API ERROR ===');
    console.error(error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to initialize stream' });
    }
    res.write(`data: ${JSON.stringify({ error: 'stream_failed' })}\n\n`);
    res.end();
  }
};

router.post('/stream', handleStream);
router.post('/chat/stream', handleStream);

export default router;