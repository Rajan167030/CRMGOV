// ═══════════════════════════════════════════════════════════════
//  IN-MEMORY CACHE — Lightweight TTL cache for map stats
//
//  No external dependencies. Stores entries as { data, expiresAt }.
//  Supports per-key TTL, manual invalidation, and namespace-based
//  bulk invalidation (e.g. clear all "map-stats:*" keys at once).
// ═══════════════════════════════════════════════════════════════

class MemoryCache {
  constructor() {
    /** @type {Map<string, { data: any, expiresAt: number }>} */
    this._store = new Map();
  }

  /**
   * Get a cached value. Returns `undefined` if missing or expired.
   * @param {string} key
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      // Expired — clean up lazily
      this._store.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Store a value with a TTL (in seconds).
   * @param {string} key
   * @param {any} data
   * @param {number} ttlSeconds — time-to-live in seconds (default: 300 = 5 min)
   */
  set(key, data, ttlSeconds = 300) {
    this._store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a specific key.
   * @param {string} key
   */
  del(key) {
    this._store.delete(key);
  }

  /**
   * Invalidate all keys that start with the given prefix.
   * Useful for clearing all timeframe variants of map-stats at once.
   * @param {string} prefix
   */
  invalidateByPrefix(prefix) {
    let cleared = 0;
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      console.log(`[cache] Invalidated ${cleared} key(s) with prefix "${prefix}"`);
    }
  }

  /**
   * Clear the entire cache.
   */
  flush() {
    this._store.clear();
    console.log("[cache] Flushed all entries");
  }

  /**
   * Get current cache size (including possibly expired entries).
   */
  get size() {
    return this._store.size;
  }
}

// ── Singleton instance ──────────────────────────────────────────
const cache = new MemoryCache();

export default cache;

// Named export for the cache key prefix used by map-stats
export const MAP_STATS_PREFIX = "map-stats:";
