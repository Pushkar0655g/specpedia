import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import {
  ItemSchema,
  BrandCountSchema,
  ErrorResponseSchema,
} from '../src/lib/openapi.js';
import { z } from 'zod';

describe('OpenAPI Contract & Health Checks', () => {
  describe('GET /healthz', () => {
    it('reports status ok, uptime, db ok or degraded, and in-memory cache size', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.uptime).toBe('number');
      expect(['ok', 'degraded']).toContain(res.body.db);
      expect(typeof res.body.cacheSize).toBe('number');
    });
  });

  describe('GET /api/v1/openapi.json', () => {
    it('returns a valid OpenAPI 3.0 document with expected paths and components', async () => {
      const res = await request(app).get('/api/v1/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.0');
      expect(res.body.info.title).toBe('Spec Codex API');
      expect(res.body.paths).toBeDefined();

      // Check key paths
      expect(res.body.paths['/api/v1/items']).toBeDefined();
      expect(res.body.paths['/api/v1/items/brands']).toBeDefined();
      expect(res.body.paths['/api/v1/items/{id}']).toBeDefined();
      expect(res.body.paths['/api/v1/ai/chat']).toBeDefined();
      expect(res.body.paths['/api/v1/watchlist']).toBeDefined();

      // Check key components
      expect(res.body.components?.schemas?.Item).toBeDefined();
      expect(res.body.components?.schemas?.CodexScore).toBeDefined();
    });
  });

  describe('Live API Contract Conformance', () => {
    let sampleItemId = null;

    it('GET /api/v1/items conforms to registered ItemSchema array with CodexScore', async () => {
      const res = await request(app).get('/api/v1/items?limit=5');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      sampleItemId = res.body[0].id;

      // Validate each item against the registered ItemSchema
      const parseResult = z.array(ItemSchema).safeParse(res.body);
      expect(parseResult.success).toBe(true);

      // Verify CodexScore structure
      const firstItem = res.body[0];
      expect(firstItem.codexScore).toBeDefined();
      expect(typeof firstItem.codexScore.score).toBe('number');
      expect(Array.isArray(firstItem.codexScore.breakdown)).toBe(true);
    });

    it('GET /api/v1/items/brands conforms to registered BrandCountSchema array', async () => {
      const res = await request(app).get('/api/v1/items/brands');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const parseResult = z.array(BrandCountSchema).safeParse(res.body);
      expect(parseResult.success).toBe(true);
      if (res.body.length > 0) {
        expect(typeof res.body[0].brand).toBe('string');
        expect(typeof res.body[0].count).toBe('number');
      }
    });

    it('GET /api/v1/items/:id conforms to registered ItemSchema', async () => {
      if (!sampleItemId) {
        const listRes = await request(app).get('/api/v1/items?limit=1');
        sampleItemId = listRes.body[0]?.id;
      }
      expect(sampleItemId).toBeDefined();

      const res = await request(app).get(`/api/v1/items/${sampleItemId}`);
      expect(res.status).toBe(200);

      const parseResult = ItemSchema.safeParse(res.body);
      expect(parseResult.success).toBe(true);
      expect(res.body.id).toBe(sampleItemId);
    });

    it('POST /api/v1/ai/chat returns 400 and conforms to ErrorResponseSchema on invalid body', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .send({ invalidField: true });

      expect(res.status).toBe(400);
      const parseResult = ErrorResponseSchema.safeParse(res.body);
      expect(parseResult.success).toBe(true);
      expect(typeof res.body.error).toBe('string');
    });
  });
});
