import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../../../../config/firebase";

// ── In-memory cache ──
const memoryCache = new Map();

// ── In-flight promise cache to deduplicate concurrent calls ──
const promiseCache = new Map();

// ── Persistent cache TTL (ms) ──
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// ── Helper: load persistent cache from localStorage ──
const loadPersistentCache = () => {
  try {
    const raw = localStorage.getItem("homepageCache");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// ── Helper: save to persistent cache ──
const savePersistentCache = (key, data) => {
  const cacheData = loadPersistentCache();
  cacheData[key] = { data, timestamp: Date.now() };
  localStorage.setItem("homepageCache", JSON.stringify(cacheData));
};

export const homepageService = {
  async getProductsByCollection(type, size = 8) {
    const key = `${type.toLowerCase().trim()}-${size}`;
    const now = Date.now();

    // ── 1. Return in-memory cache if fresh ──
    if (memoryCache.has(key) && now - memoryCache.get(key).timestamp < CACHE_TTL) {
      return memoryCache.get(key).data;
    }

    // ── 2. Return persistent cache if in-memory empty ──
    const persistentCache = loadPersistentCache();
    if (persistentCache[key] && now - persistentCache[key].timestamp < CACHE_TTL) {
      memoryCache.set(key, persistentCache[key]);
      return persistentCache[key].data;
    }

    // ── 3. Deduplicate concurrent queries ──
    if (promiseCache.has(key)) return promiseCache.get(key);

    const promise = (async () => {
      try {
        // Exact match query
        const qExact = query(
          collection(db, "products"),
          where("isActive", "==", true),
          where("collectionTypes", "array-contains", type.toLowerCase().trim()),
          orderBy("createdAt", "desc"),
          limit(size)
        );

        const snap = await getDocs(qExact);
        let products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fallback client-side filtering if no results
        if (!products.length) {
          const qFallback = query(
            collection(db, "products"),
            where("isActive", "==", true),
            orderBy("createdAt", "desc"),
            limit(20)
          );
          const snapFallback = await getDocs(qFallback);

          products = snapFallback.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p =>
              Array.isArray(p.collectionTypes) &&
              p.collectionTypes.some(t => t.toLowerCase().trim() === type.toLowerCase().trim())
            )
            .slice(0, size);
        }

        // Save to caches
        const cacheEntry = { data: products, timestamp: now };
        memoryCache.set(key, cacheEntry);
        savePersistentCache(key, products);

        return products;
      } catch (err) {
        console.error(`[homepageService] Failed to fetch "${type}":`, err.message);
        return memoryCache.get(key)?.data || []; // return stale cache if exists
      } finally {
        promiseCache.delete(key); // cleanup in-flight
      }
    })();

    promiseCache.set(key, promise);
    return promise;
  },

  clearCache() {
    memoryCache.clear();
    localStorage.removeItem("homepageCache");
  }
};