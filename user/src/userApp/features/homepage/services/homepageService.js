import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "../../../../config/firebaseDB";

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

  // ─────────────────────────────────────────
  // PRODUCTS BY COLLECTION
  // ─────────────────────────────────────────
  async getProductsByCollection(type, size = 8) {
    const key = `${type.toLowerCase().trim()}-${size}`;
    const now = Date.now();

    // 1. In-memory cache
    if (memoryCache.has(key) && now - memoryCache.get(key).timestamp < CACHE_TTL) {
      return memoryCache.get(key).data;
    }

    // 2. Persistent cache
    const persistentCache = loadPersistentCache();
    if (persistentCache[key] && now - persistentCache[key].timestamp < CACHE_TTL) {
      memoryCache.set(key, persistentCache[key]);
      return persistentCache[key].data;
    }

    // 3. Deduplicate concurrent queries
    if (promiseCache.has(key)) return promiseCache.get(key);

    const promise = (async () => {
      try {

        const qExact = query(
          collection(db, "products"),
          where("isActive", "==", true),
          where("collectionTypes", "array-contains", type.toLowerCase().trim()),
          orderBy("createdAt", "desc"),
          limit(size)
        );

        const snap = await getDocs(qExact);

        let products = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        // fallback if no results
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
              p.collectionTypes.some(
                t => t.toLowerCase().trim() === type.toLowerCase().trim()
              )
            )
            .slice(0, size);
        }

        const cacheEntry = { data: products, timestamp: now };

        memoryCache.set(key, cacheEntry);
        savePersistentCache(key, products);

        return products;

      } catch (err) {
        console.error(`[homepageService] Failed to fetch "${type}":`, err.message);
        return memoryCache.get(key)?.data || [];
      } finally {
        promiseCache.delete(key);
      }
    })();

    promiseCache.set(key, promise);
    return promise;
  },


  // ─────────────────────────────────────────
  // HOMEPAGE CATEGORIES
  // ─────────────────────────────────────────
  async getHomepageCategories(size = 8) {

    const key = "homepage-categories";
    const now = Date.now();

    // 1. memory cache
    if (memoryCache.has(key) && now - memoryCache.get(key).timestamp < CACHE_TTL) {
      return memoryCache.get(key).data;
    }

    // 2. persistent cache
    const persistentCache = loadPersistentCache();
    if (persistentCache[key] && now - persistentCache[key].timestamp < CACHE_TTL) {
      memoryCache.set(key, persistentCache[key]);
      return persistentCache[key].data;
    }

    // 3. deduplicate requests
    if (promiseCache.has(key)) return promiseCache.get(key);

    const promise = (async () => {
      try {

        const snap = await getDocs(collection(db, "categories"));

        const categories = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const cacheEntry = { data: categories, timestamp: now };

        memoryCache.set(key, cacheEntry);
        savePersistentCache(key, categories);

        return categories;

      } catch (error) {
        console.error("Error loading categories:", error);
        return memoryCache.get(key)?.data || [];
      } finally {
        promiseCache.delete(key);
      }
    })();

    promiseCache.set(key, promise);
    return promise;
  },

  // ─────────────────────────────────────────
// HOMEPAGE TESTIMONIALS
// ─────────────────────────────────────────
async getTestimonials(size = 8) {

  const key = `homepage-testimonials-${size}`;
  const now = Date.now();

  // memory cache
  if (memoryCache.has(key) && now - memoryCache.get(key).timestamp < CACHE_TTL) {
    return memoryCache.get(key).data;
  }

  // persistent cache
  const persistentCache = loadPersistentCache();
  if (persistentCache[key] && now - persistentCache[key].timestamp < CACHE_TTL) {
    memoryCache.set(key, persistentCache[key]);
    return persistentCache[key].data;
  }

  // dedupe requests
  if (promiseCache.has(key)) return promiseCache.get(key);

  const promise = (async () => {
    try {

      const q = query(
        collection(db, "testimonials"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(size)
      );

      const snap = await getDocs(q);

      const testimonials = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const cacheEntry = { data: testimonials, timestamp: now };

      memoryCache.set(key, cacheEntry);
      savePersistentCache(key, testimonials);

      return testimonials;

    } catch (error) {
      console.error("Error loading testimonials:", error);
      return memoryCache.get(key)?.data || [];
    } finally {
      promiseCache.delete(key);
    }
  })();

  promiseCache.set(key, promise);
  return promise;
},

// ─────────────────────────────────────────
// HOMEPAGE COLLECTIONS
// ─────────────────────────────────────────
async getCollections(size = 8) {

  const key = `homepage-collections-${size}`;
  const now = Date.now();

  // memory cache
  if (memoryCache.has(key) && now - memoryCache.get(key).timestamp < CACHE_TTL) {
    return memoryCache.get(key).data;
  }

  // persistent cache
  const persistentCache = loadPersistentCache();
  if (persistentCache[key] && now - persistentCache[key].timestamp < CACHE_TTL) {
    memoryCache.set(key, persistentCache[key]);
    return persistentCache[key].data;
  }

  // dedupe requests
  if (promiseCache.has(key)) return promiseCache.get(key);

  const promise = (async () => {
    try {

      const q = query(
        collection(db, "itemsCollection"),
        // where("isActive", "==", true),
        // orderBy("createdAt", "desc"),
        limit(size)
      );

      const snap = await getDocs(q);

      const collections = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const cacheEntry = { data: collections, timestamp: now };

      memoryCache.set(key, cacheEntry);
      savePersistentCache(key, collections);

      return collections;

    } catch (error) {
      console.error("Error loading collections:", error);
      return memoryCache.get(key)?.data || [];
    } finally {
      promiseCache.delete(key);
    }
  })();

  promiseCache.set(key, promise);
  return promise;
},

  // ─────────────────────────────────────────
  // CLEAR CACHE
  // ─────────────────────────────────────────
  clearCache() {
    memoryCache.clear();
    localStorage.removeItem("homepageCache");
  }

};