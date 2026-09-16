import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import itemsRouter from './routes/items.js';
import chatRouter from './routes/chat.js';
import recommendRouter from './routes/recommend.js';
import explainRouter from './routes/explain.js';
import lexiconRouter from './routes/lexicon.js';
import watchlistRouter from './routes/watchlist.js';
import { httpLogger } from './lib/logger.js';
import { cache } from './ai/cache.js';
import { generateOpenAPIDocument } from './lib/openapi.js';

dotenv.config();

// Validate required environment variables at startup
const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GROQ_API_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

const app = express();
const PORT = process.env.PORT || 5000;

// Structured request logging via pino-http
app.use(httpLogger);

// Security headers
app.use(helmet());

// CORS allowlist configuration
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:4173,http://127.0.0.1:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, mobile apps, server-to-server)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

// Body parser with 100kb payload limit
app.use(express.json({ limit: '100kb' }));

// Rate limiter on /api/ai and /api/v1/ai: 10 req/min per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/ai', aiLimiter);
app.use('/api/v1/ai', aiLimiter);

// Health check endpoint with DB probe and in-memory cache size
app.get('/healthz', async (req, res) => {
  let dbStatus = 'degraded';
  try {
    const dbPromise = supabase.from('categories').select('id').limit(1);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB health check timeout')), 3000)
    );

    const { data, error } = await Promise.race([dbPromise, timeoutPromise]);
    if (!error && data) {
      dbStatus = 'ok';
    }
  } catch (err) {
    dbStatus = 'degraded';
  }

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: dbStatus,
    cacheSize: cache.size,
  });
});

// OpenAPI 3.0 Contract Endpoint
const openApiDocument = generateOpenAPIDocument();
app.get('/api/v1/openapi.json', (req, res) => {
  res.json(openApiDocument);
});
app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

// Root informational endpoint
app.get('/', (req, res) => {
  res.send('SpecPedia Backend is running! 🚀');
});

// API Routes
app.use('/api/v1/items', itemsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/v1/ai/recommend', recommendRouter);
app.use('/api/ai/recommend', recommendRouter);
app.use('/api/v1/ai/explain', explainRouter);
app.use('/api/ai/explain', explainRouter);
app.use('/api/v1/ai/lexicon', lexiconRouter);
app.use('/api/ai/lexicon', lexiconRouter);
app.use('/api/v1/ai', chatRouter);
app.use('/api/ai', chatRouter);
app.use('/api/v1/watchlist', watchlistRouter);
app.use('/api/watchlist', watchlistRouter);

// 404 JSON handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Central error-handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message || 'Internal server error');
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;