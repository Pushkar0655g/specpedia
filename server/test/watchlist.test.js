import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Watchlist & History API Routes', () => {
  describe('GET /api/v1/watchlist (protected)', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/watchlist');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('POST /api/v1/watchlist (protected)', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/watchlist')
        .send({ itemId: 1, targetPrice: 25000 });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('DELETE /api/v1/watchlist/:itemId (protected)', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).delete('/api/v1/watchlist/1');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('GET /api/v1/items/:id/history (public)', () => {
    it('returns price history array for a valid item ID', async () => {
      // First get any item from catalog
      const itemsRes = await request(app).get('/api/v1/items?limit=1');
      expect(itemsRes.status).toBe(200);

      if (itemsRes.body && itemsRes.body.length > 0) {
        const item = itemsRes.body[0];
        const res = await request(app).get(`/api/v1/items/${item.id}/history`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        if (res.body.length > 0) {
          const pt = res.body[0];
          expect(pt).toHaveProperty('price');
          expect(pt).toHaveProperty('recorded_at');
        }
      }
    });

    it('returns 400 for non-numeric item id', async () => {
      const res = await request(app).get('/api/v1/items/invalid-id/history');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid item ID' });
    });
  });
});
