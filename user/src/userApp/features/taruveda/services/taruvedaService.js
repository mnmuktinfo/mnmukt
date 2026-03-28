import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../../config/firebaseDB";
import { TARUVEDA_CATEGORY_VALUES } from "../config/taruvedaCategories";

/* ─────────────────────────────────────────────────────────────────
   Cache Layer
───────────────────────────────────────────────────────────────── */

const memoryCache  = new Map();
const promiseCache = new Map();
const CACHE_TTL    = 1000 * 60 * 10; // 10 min
const STORAGE_KEY  = "taruvedaCache";

const loadPersistentCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePersistentCache = (key, data) => {
  try {
    const cache = loadPersistentCache();
    cache[key]  = { data, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded — skip silently
  }
};

const cachedFetch = async (key, fetcher) => {
  const now = Date.now();

  // 1. Memory cache
  const mem = memoryCache.get(key);
  if (mem && now - mem.timestamp < CACHE_TTL) {
    console.log(`[taruvedaService] ✅ Memory cache hit — "${key}"`);
    return mem.data;
  }

  // 2. Persistent cache
  const persistent = loadPersistentCache();
  if (persistent[key] && now - persistent[key].timestamp < CACHE_TTL) {
    console.log(`[taruvedaService] 💾 LocalStorage cache hit — "${key}"`);
    memoryCache.set(key, persistent[key]);
    return persistent[key].data;
  }

  // 3. Deduplicate concurrent requests
  if (promiseCache.has(key)) {
    console.log(`[taruvedaService] ⏳ In-flight dedup — "${key}"`);
    return promiseCache.get(key);
  }

  console.log(`[taruvedaService] 🔥 Firestore fetch — "${key}"`);

  const promise = (async () => {
    try {
      const data  = await fetcher();
      const entry = { data, timestamp: now };
      memoryCache.set(key, entry);
      savePersistentCache(key, data);
      console.log(`[taruvedaService] ✔ Fetched & cached — "${key}" (${Array.isArray(data) ? data.length + " docs" : "1 doc"})`);
      return data;
    } catch (err) {
      console.error(`[taruvedaService] ❌ "${key}" failed:`, err.message);
      return memoryCache.get(key)?.data ?? [];
    } finally {
      promiseCache.delete(key);
    }
  })();

  promiseCache.set(key, promise);
  return promise;
};

/* ─────────────────────────────────────────────────────────────────
   TaruVeda Service  (fetch only — no order creation)
───────────────────────────────────────────────────────────────── */

export const taruvedaService = {

  /* ── 1. All Products ─────────────────────────────────────────── */
  async getProducts(size = 50) {
    console.log(`[taruvedaService] getProducts(size=${size})`);

    return cachedFetch(`taruveda-products-${size}`, async () => {
      const q    = query(
        collection(db, "taruvedaProducts"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(size)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    });
  },

  /* ── 2. Products by Category ─────────────────────────────────── */
  async getProductsByCategory(category, size = 20) {
    // Validate category against known list
    if (!category || category === "All" || !TARUVEDA_CATEGORY_VALUES.includes(category)) {
      console.log(`[taruvedaService] getProductsByCategory — invalid/All, falling back to getProducts`);
      return this.getProducts(size);
    }

    const key = `taruveda-cat-${category.toLowerCase().trim()}-${size}`;
    console.log(`[taruvedaService] getProductsByCategory(category="${category}", size=${size})`);

    return cachedFetch(key, async () => {
      const q    = query(
        collection(db, "taruvedaProducts"),
        where("isActive",  "==", true),
        where("category",  "==", category),
        orderBy("createdAt", "desc"),
        limit(size)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log(`[taruvedaService] Category "${category}" → ${data.length} products`);
      return data;
    });
  },

  /* ── 3. Single Product by ID ─────────────────────────────────── */
  async getProductById(id) {
    if (!id) {
      console.error("[taruvedaService] getProductById — ID is required");
      throw new Error("Product ID is required");
    }

    console.log(`[taruvedaService] getProductById(id="${id}")`);

    return cachedFetch(`taruveda-product-${id}`, async () => {
      const ref  = doc(db, "taruvedaProducts", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        console.warn(`[taruvedaService] Product "${id}" not found in Firestore`);
        throw new Error(`Product ${id} not found`);
      }
      return { id: snap.id, ...snap.data() };
    });
  },

  /* ── 4. Cache Utilities ──────────────────────────────────────── */
  clearCache(key) {
    if (key) {
      console.log(`[taruvedaService] 🗑 Clearing cache key — "${key}"`);
      memoryCache.delete(key);
      const cache = loadPersistentCache();
      delete cache[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } else {
      console.log("[taruvedaService] 🗑 Clearing ALL cache");
      memoryCache.clear();
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};