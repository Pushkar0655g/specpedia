import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Items API Routes (/api/v1/items & /api/items)', () => {
  describe('GET /api/v1/items/stats', () => {
    it('returns 200 with totalDevices > 0 and expected stats shape', async () => {
      const res = await request(app).get('/api/v1/items/stats');
      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body.totalDevices).toBeGreaterThan(0);
      expect(res.body.totalBrands).toBeGreaterThan(0);
      expect(typeof res.body.avgPrice).toBe('number');
      expect(res.body.currency).toBe('INR');
      // Verify backwards compatibility properties for client
      expect(res.body.deviceCount).toBe(res.body.totalDevices);
      expect(res.body.brandCount).toBe(res.body.totalBrands);
    });

    it('works under legacy /api/items/stats route as well', async () => {
      const res = await request(app).get('/api/items/stats');
      expect(res.status).toBe(200);
      expect(res.body.totalDevices).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/items/movers', () => {
    it('returns 200 with the expected movers shape { risers, fallers }', async () => {
      const res = await request(app).get('/api/v1/items/movers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('risers');
      expect(res.body).toHaveProperty('fallers');
      expect(Array.isArray(res.body.risers)).toBe(true);
      expect(Array.isArray(res.body.fallers)).toBe(true);
    });

    it('works under legacy /api/items/movers route as well', async () => {
      const res = await request(app).get('/api/items/movers');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.risers)).toBe(true);
      expect(Array.isArray(res.body.fallers)).toBe(true);
    });
  });

  describe('GET /api/v1/items/brands', () => {
    it('returns 200 with list of distinct brands', async () => {
      const res = await request(app).get('/api/v1/items/brands');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('brand');
      expect(res.body[0]).toHaveProperty('count');
    });
  });

  describe('GET /api/v1/items catalog', () => {
    it('returns 200 with enriched item list and codexScore', async () => {
      const res = await request(app).get('/api/v1/items?limit=5');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('codexScore');
    });

    it('supports lookup by slug', async () => {
      const listRes = await request(app).get('/api/v1/items?limit=1');
      if (listRes.body.length > 0 && listRes.body[0].slug) {
        const slug = listRes.body[0].slug;
        const res = await request(app).get(`/api/v1/items?slug=${slug}`);
        expect(res.status).toBe(200);
        expect(res.body.slug).toBe(slug);
        expect(res.body).toHaveProperty('codexScore');
      }
    });
  });

  describe('GET /api/v1/items/:id and :id/history', () => {
    it('returns 404 for nonexistent item ID', async () => {
      const res = await request(app).get('/api/v1/items/99999999');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Item not found' });
    });

    it('returns 404 for nonexistent item history', async () => {
      const res = await request(app).get('/api/v1/items/99999999/history');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Item not found' });
    });
  });
});
