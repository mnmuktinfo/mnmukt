import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../../config/firebase";

const COL = "products";
const PAGE_SIZE = 20;

// ─── In-memory cache ──────────────────────────────────────────────────────────
// Two-layer: primary key cache + cross-reference maps for zero-cost lookups
const cache = new Map();          // key → value
const slugToId = new Map();       // slug  → id  (cross-reference)
const idToSlug = new Map();       // id    → slug (cross-reference)

const buildCacheKey = (params) => JSON.stringify(params);

// ─── Prime cross-reference maps after any product fetch ──────────────────────
const primeRefs = (product) => {
  if (!product) return;
  if (product.slug && product.id) {
    slugToId.set(product.slug, product.id);
    idToSlug.set(product.id, product.slug);
    // Also cache under the other key so either lookup hits cache first
    cache.set(`product_${product.id}`, product);
    cache.set(`slug_${product.slug}`, product);
  }
};

// ─── Normalization ────────────────────────────────────────────────────────────
const normalize = (id, data) => ({
  id: String(id),
  name: data.name ?? "",
  slug: data.slug ?? "",
  description: data.description ?? "",
  banner: data.banner ?? "",
  images: Array.isArray(data.images) ? data.images : [],
  price: Number(data.price ?? 0),
  originalPrice: Number(data.originalPrice ?? data.price ?? 0),
  stock: Number(data.stock ?? 0),
  sizes: Array.isArray(data.sizes) ? data.sizes : [],
  colors: Array.isArray(data.colors) ? data.colors : [],
  categoryId: data.categoryId ?? "",
  collectionTypes: Array.isArray(data.collectionTypes) ? data.collectionTypes : [],
  isActive: data.isActive ?? true,
  createdAt: data.createdAt ?? null,
  tags: Array.isArray(data.tags) ? data.tags : [],
});

// ─── USER PRODUCT SERVICE ─────────────────────────────────────────────────────
export const productService = {

  // ─── PAGINATED PRODUCTS ─────────────────────────────────────────────────────
  async getProducts({
    lastDoc = null,
    category = "all",
    collectionType = "all",
    status = "active",
    pageSize = PAGE_SIZE,
  } = {}) {
    const params = { lastDoc: lastDoc?.id, category, collectionType, status, pageSize };
    const cacheKey = buildCacheKey(params);
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const constraints = [];
    if (category !== "all") constraints.push(where("categoryId", "==", category));
    if (collectionType !== "all") constraints.push(where("collectionTypes", "array-contains", collectionType));
    if (status !== "all") constraints.push(where("isActive", "==", status === "active"));

    constraints.push(orderBy("createdAt", "desc"));
    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(pageSize));

    const q = query(collection(db, COL), ...constraints);
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p); // ← save slug↔id cross-refs on every fetch
      return p;
    });

    const newLastDoc = snapshot.docs.length
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

    const result = {
      products,
      lastDoc: newLastDoc,
      hasMore: snapshot.docs.length === pageSize,
    };

    cache.set(cacheKey, result);
    return result;
  },

  // ─── GET ALL PRODUCTS (flat list for hook's allProducts) ───────────────────
  // Separate from paginated so React Query can cache a flat array.
  async getAllProducts() {
    const cacheKey = "all_products";
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const q = query(
      collection(db, COL),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p);
      return p;
    });

    cache.set(cacheKey, products);
    return products;
  },

  // ─── GET PRODUCT BY ID ──────────────────────────────────────────────────────
  async getProductById(id) {
    if (!id) return null;
    const cacheKey = `product_${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey); // ← hits if primeRefs ran before

    const snapshot = await getDoc(doc(db, COL, String(id)));
    if (!snapshot.exists()) return null;

    const product = normalize(snapshot.id, snapshot.data());
    primeRefs(product); // saves slug cross-ref too
    return product;
  },

  // ─── GET PRODUCTS BY IDs (batched, avoids N individual calls) ──────────────
  // Firestore doesn't support array-of-ids natively, so we chunk into "in" queries (max 10).
  async getProductsByIds(ids = []) {
    if (!ids.length) return [];

    const unique = [...new Set(ids.map(String))];
    const cacheKey = `ids_${unique.sort().join(",")}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    // Split into chunks of 10 (Firestore "in" limit)
    const chunks = [];
    for (let i = 0; i < unique.length; i += 10) {
      chunks.push(unique.slice(i, i + 10));
    }

    const results = await Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, COL), where("__name__", "in", chunk)))
      )
    );

    const products = results
      .flatMap((snap) => snap.docs)
      .map((d) => {
        const p = normalize(d.id, d.data());
        primeRefs(p);
        return p;
      });

    cache.set(cacheKey, products);
    return products;
  },

  // ─── GET PRODUCTS BY CATEGORY ───────────────────────────────────────────────
  async getProductsByCategory(categoryId, pageSize = PAGE_SIZE) {
    if (!categoryId) return [];
    const cacheKey = `category_${categoryId}_${pageSize}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const q = query(
      collection(db, COL),
      where("categoryId", "==", categoryId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    const products = snap.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p);
      return p;
    });

    cache.set(cacheKey, products);
    return products;
  },

  // ─── GET PRODUCTS BY COLLECTION TYPES ──────────────────────────────────────
  async getProductsByCollections(types = [], maxResults = 8) {
    if (!types.length) return [];
    const normalizedTypes = [...new Set(types.map((t) => t.toLowerCase()))];
    const cacheKey = `collection_${normalizedTypes.join(",")}_${maxResults}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const q = query(
      collection(db, COL),
      where("isActive", "==", true),
      where("collectionTypes", "array-contains-any", normalizedTypes.slice(0, 10)),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    const products = snap.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p);
      return p;
    });

    cache.set(cacheKey, products);
    return products;
  },

  // ─── GET PRODUCT BY SLUG ────────────────────────────────────────────────────
  async getProductBySlug(slug) {
    if (!slug) return null;
    const cacheKey = `slug_${slug}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey); // ← hits if primeRefs ran before

    // Try cross-ref shortcut: slug → id → already cached product
    if (slugToId.has(slug)) {
      const id = slugToId.get(slug);
      const idKey = `product_${id}`;
      if (cache.has(idKey)) return cache.get(idKey);
    }

    const q = query(collection(db, COL), where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const product = normalize(snap.docs[0].id, snap.docs[0].data());
    primeRefs(product); // saves id cross-ref too
    return product;
  },

  // ─── SEARCH (client-side, no extra API call) ────────────────────────────────
  searchProducts(term, allProducts = []) {
    if (!term?.trim()) return [];
    const lower = term.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  },

  // ─── CACHE UTILS ────────────────────────────────────────────────────────────
  /** Call after mutations to bust stale entries */
  bustCache(id, slug) {
    if (id) cache.delete(`product_${id}`);
    if (slug) cache.delete(`slug_${slug}`);
    cache.delete("all_products");
    // Bust any paginated/category/collection keys that could contain this product
    for (const key of cache.keys()) {
      if (
        key.startsWith("{") ||          // paginated
        key.startsWith("category_") ||
        key.startsWith("collection_") ||
        key.startsWith("ids_")
      ) {
        cache.delete(key);
      }
    }
  },
};