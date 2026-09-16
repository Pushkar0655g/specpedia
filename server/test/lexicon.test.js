import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { cache } from '../src/ai/cache.js';
import { GLOSSARY_TERMS } from '../src/ai/glossary.js';

describe('Lexicon & Market Movers Endpoints', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('GET /api/v1/ai/lexicon', () => {
    it('returns all 12 curated glossary entries', async () => {
      const res = await request(app).get('/api/v1/ai/lexicon');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(12);

      const terms = res.body.map((item) => item.term);
      expect(terms).toContain('LTPO');
      expect(terms).toContain('IP68');
      expect(terms).toContain('UFS 4.0');
      expect(terms).toContain('mAh');
      expect(terms).toContain('nits');
      expect(terms).toContain('OIS');
      expect(terms).toContain('AMOLED');
      expect(terms).toContain('SoC');
      expect(terms).toContain('refresh rate');
      expect(terms).toContain('periscope telephoto');
      expect(terms).toContain('vapor chamber');
      expect(terms).toContain('eSIM');
    });

    it('merges live explain-cache snapshots, dedupes, and sorts alphabetically', async () => {
      // Seed cache with an existing term and a new term
      cache.set('AMOLED', 'A duplicate cached definition');
      cache.set('Bluetooth 5.4', 'A short-range wireless communication standard.');

      const res = await request(app).get('/api/v1/ai/lexicon');
      expect(res.status).toBe(200);

      // Should deduplicate AMOLED (only 1 AMOLED in result)
      const amoledEntries = res.body.filter(
        (item) => item.term.toLowerCase() === 'amoled'
      );
      expect(amoledEntries.length).toBe(1);

      // New term should be included
      const btEntry = res.body.find((item) => item.term === 'Bluetooth 5.4');
      expect(btEntry).toBeDefined();

      // Check alphabetical ordering
      for (let i = 0; i < res.body.length - 1; i++) {
        const current = res.body[i].term;
        const next = res.body[i + 1].term;
        expect(
          current.localeCompare(next, undefined, { sensitivity: 'base' })
        ).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('GET /api/v1/items/movers', () => {
    it('returns top 5 risers and top 5 fallers with required attributes', async () => {
      const res = await request(app).get('/api/v1/items/movers');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('risers');
      expect(res.body).toHaveProperty('fallers');

      expect(Array.isArray(res.body.risers)).toBe(true);
      expect(Array.isArray(res.body.fallers)).toBe(true);

      expect(res.body.risers.length).toBeLessThanOrEqual(5);
      expect(res.body.fallers.length).toBeLessThanOrEqual(5);

      if (res.body.risers.length > 0) {
        const riser = res.body.risers[0];
        expect(riser).toHaveProperty('name');
        expect(riser).toHaveProperty('slug');
        expect(riser).toHaveProperty('price');
        expect(riser).toHaveProperty('currency');
        expect(riser).toHaveProperty('deltaPercent');
      }

      if (res.body.fallers.length > 0) {
        const faller = res.body.fallers[0];
        expect(faller).toHaveProperty('name');
        expect(faller).toHaveProperty('slug');
        expect(faller).toHaveProperty('price');
        expect(faller).toHaveProperty('currency');
        expect(faller).toHaveProperty('deltaPercent');
      }
    });
  });
});
