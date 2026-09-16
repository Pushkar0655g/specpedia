import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TTLCache } from '../src/ai/cache.js';

describe('TTLCache', () => {
  let cache;

  beforeEach(() => {
    cache = new TTLCache();
    vi.useRealTimers();
  });

  it('stores and retrieves values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    expect(cache.has('key1')).toBe(true);
  });

  it('returns null for nonexistent keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('expires keys after TTL', () => {
    vi.useFakeTimers();
    cache.set('shortKey', 'temporary', 1000);

    expect(cache.get('shortKey')).toBe('temporary');

    vi.advanceTimersByTime(1500);
    expect(cache.get('shortKey')).toBeNull();
    expect(cache.has('shortKey')).toBe(false);
  });

  it('deletes keys properly', () => {
    cache.set('toDelete', 'value');
    expect(cache.delete('toDelete')).toBe(true);
    expect(cache.get('toDelete')).toBeNull();
  });

  it('clears all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });
});
