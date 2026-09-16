import { describe, it, expect } from 'vitest';
import { recommendSchema, joinPicksToPool } from '../src/routes/recommend.js';

describe('recommendSchema', () => {
  it('validates correct request body', () => {
    const valid = {
      budget: 50000,
      priorities: ['Camera', 'Battery'],
      freeText: 'Looking for a reliable phone',
    };
    const result = recommendSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('fails when priorities has more than 3 items', () => {
    const invalid = {
      priorities: ['Camera', 'Battery', 'Gaming', 'Display'],
    };
    const result = recommendSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when budget is negative', () => {
    const invalid = {
      budget: -100,
    };
    const result = recommendSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails when freeText exceeds 500 characters', () => {
    const invalid = {
      freeText: 'a'.repeat(501),
    };
    const result = recommendSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('joinPicksToPool', () => {
  const pool = [
    { id: 10, name: 'Phone Alpha', brand: 'AlphaBrand', price: 25000, specs: {} },
    { id: 20, name: 'Phone Beta', brand: 'BetaBrand', price: 35000, specs: {} },
    { id: 30, name: 'Phone Gamma', brand: 'GammaBrand', price: 45000, specs: {} },
    { id: 40, name: 'Phone Delta', brand: 'DeltaBrand', price: 55000, specs: {} },
  ];

  it('joins AI picks to catalog items and attaches the reasoning', () => {
    const picks = [
      { id: 10, reason: 'Great value for money' },
      { id: 30, reason: 'Superior display quality' },
    ];

    const results = joinPicksToPool(picks, pool);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(10);
    expect(results[0].name).toBe('Phone Alpha');
    expect(results[0].reason).toBe('Great value for money');
    expect(results[1].id).toBe(30);
    expect(results[1].name).toBe('Phone Gamma');
    expect(results[1].reason).toBe('Superior display quality');
  });

  it('drops hallucinatory IDs not present in pool', () => {
    const picks = [
      { id: 9999, reason: 'Imaginary device' },
      { id: 20, reason: 'Real device' },
    ];

    const results = joinPicksToPool(picks, pool);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(20);
    expect(results[0].name).toBe('Phone Beta');
  });

  it('limits result to at most 3 picks', () => {
    const picks = [
      { id: 10, reason: 'Pick 1' },
      { id: 20, reason: 'Pick 2' },
      { id: 30, reason: 'Pick 3' },
      { id: 40, reason: 'Pick 4' },
    ];

    const results = joinPicksToPool(picks, pool);
    expect(results).toHaveLength(3);
    expect(results.map((p) => p.id)).toEqual([10, 20, 30]);
  });

  it('handles empty or malformed picks gracefully', () => {
    expect(joinPicksToPool(null, pool)).toEqual([]);
    expect(joinPicksToPool(undefined, pool)).toEqual([]);
    expect(joinPicksToPool([], pool)).toEqual([]);
  });
});
