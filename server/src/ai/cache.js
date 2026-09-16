const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class TTLCache {
  constructor() {
    this.map = new Map();
  }

  set(key, value, ttlMs = SEVEN_DAYS_MS) {
    const expiresAt = Date.now() + ttlMs;
    this.map.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.map.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.map.delete(key);
  }

  get size() {
    return this.map.size;
  }

  clear() {
    this.map.clear();
  }

  snapshot() {
    const now = Date.now();
    const results = [];
    for (const [key, item] of this.map.entries()) {
      if (now > item.expiresAt) {
        this.map.delete(key);
      } else {
        results.push({ key, value: item.value });
      }
    }
    return results;
  }
}

export const cache = new TTLCache();
export const get = (key) => cache.get(key);
export const set = (key, value, ttlMs = SEVEN_DAYS_MS) => cache.set(key, value, ttlMs);
export const snapshot = () => cache.snapshot();
export default cache;
