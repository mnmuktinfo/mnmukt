/**
 * Unified Product Service
 *
 * Features
 * • Firestore pagination
 * • TTL cache
 * • request deduplication
 * • slug ↔ id cross reference
 * • batch fetch
 * • collection queries
 * • client search
 */

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

import { db } from "../../../config/firebaseDB";

const COL = "products";
const PAGE_SIZE = 20;
const TTL = 5 * 60 * 1000;

/* ─────────────────────────────
   CACHE LAYERS
───────────────────────────── */

const cache = new Map();
const inflight = new Map();

const slugToId = new Map();
const idToSlug = new Map();

/* ─────────────────────────────
   CACHE HELPERS
───────────────────────────── */

const cacheGet = (key) => {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() - entry.ts > TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

const cacheSet = (key, data) => {
  cache.set(key, { data, ts: Date.now() });
};

/* ─────────────────────────────
   REQUEST DEDUP
───────────────────────────── */

const dedup = (key, fn) => {
  if (inflight.has(key)) return inflight.get(key);

  const p = fn().finally(() => inflight.delete(key));

  inflight.set(key, p);

  return p;
};

const buildKey = (params) => JSON.stringify(params);

/* ─────────────────────────────
   NORMALIZE
───────────────────────────── */

const normalize = (id, data = {}) => ({
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
  collectionTypes: Array.isArray(data.collectionTypes)
    ? data.collectionTypes
    : [],

  tags: Array.isArray(data.tags) ? data.tags : [],

  isActive: data.isActive ?? true,

  createdAt: data.createdAt ?? null,
});

/* ─────────────────────────────
   PRIME CROSS REFERENCES
───────────────────────────── */

const primeRefs = (product) => {
  if (!product?.id) return;

  cacheSet(`product_${product.id}`, product);

  if (product.slug) {
    cacheSet(`slug_${product.slug}`, product);

    slugToId.set(product.slug, product.id);
    idToSlug.set(product.id, product.slug);
  }
};

/* ─────────────────────────────
   PRODUCT SERVICE
───────────────────────────── */

export const productService = {

  /* ─────────────────────────
     PAGINATED PRODUCTS
  ───────────────────────── */

  async getProducts({
    lastDoc = null,
    category = "all",
    collectionType = "all",
    status = "active",
    pageSize = PAGE_SIZE,
  } = {}) {

    const key = buildKey({
      lastDoc: lastDoc?.id,
      category,
      collectionType,
      status,
      pageSize,
    });

    const cached = cacheGet(key);

    if (cached) return cached;

    return dedup(key, async () => {

      const constraints = [];

      if (category !== "all")
        constraints.push(where("categoryId", "==", category));

      if (collectionType !== "all")
        constraints.push(
          where("collectionTypes", "array-contains", collectionType)
        );

      if (status !== "all")
        constraints.push(where("isActive", "==", status === "active"));

      constraints.push(orderBy("createdAt", "desc"));

      if (lastDoc) constraints.push(startAfter(lastDoc));

      constraints.push(limit(pageSize));

      const snap = await getDocs(
        query(collection(db, COL), ...constraints)
      );

      const products = snap.docs.map((d) => {
        const p = normalize(d.id, d.data());
        primeRefs(p);
        return p;
      });

      const newLastDoc =
        snap.docs[snap.docs.length - 1] ?? null;

      const result = {
        products,
        lastDoc: newLastDoc,
        hasMore: snap.docs.length === pageSize,
      };

      cacheSet(key, result);

      return result;
    });
  },

  /* ─────────────────────────
     GET ALL PRODUCTS
  ───────────────────────── */

  async getAllProducts() {

    const key = "all_products";

    const cached = cacheGet(key);

    if (cached) return cached;

    const snap = await getDocs(
      query(
        collection(db, COL),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      )
    );

    const products = snap.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p);
      return p;
    });

    cacheSet(key, products);

    return products;
  },

  /* ─────────────────────────
     PRODUCT BY ID
  ───────────────────────── */

  async getProductById(id) {

    if (!id) return null;

    const key = `product_${id}`;

    const cached = cacheGet(key);

    if (cached) return cached;

    return dedup(key, async () => {

      const snap = await getDoc(doc(db, COL, String(id)));

      if (!snap.exists()) return null;

      const p = normalize(snap.id, snap.data());

      primeRefs(p);

      return p;
    });
  },

  /* ─────────────────────────
     PRODUCT BY SLUG
  ───────────────────────── */

  async getProductBySlug(slug) {

    if (!slug) return null;

    const key = `slug_${slug}`;

    const cached = cacheGet(key);

    if (cached) return cached;

    if (slugToId.has(slug)) {
      const cachedProduct = cacheGet(
        `product_${slugToId.get(slug)}`
      );

      if (cachedProduct) return cachedProduct;
    }

    return dedup(key, async () => {

      const snap = await getDocs(
        query(
          collection(db, COL),
          where("slug", "==", slug),
          limit(1)
        )
      );

      if (snap.empty) return null;

      const p = normalize(
        snap.docs[0].id,
        snap.docs[0].data()
      );

      primeRefs(p);

      return p;
    });
  },

  /* ─────────────────────────
     PRODUCTS BY IDS
  ───────────────────────── */

  async getProductsByIds(ids = []) {

    if (!ids.length) return [];

    const unique = [...new Set(ids.map(String))];

    const cachedProducts = unique
      .map((id) => cacheGet(`product_${id}`))
      .filter(Boolean);

    const missing = unique.filter(
      (id) => !cacheGet(`product_${id}`)
    );

    if (!missing.length) return cachedProducts;

    const chunks = [];

    for (let i = 0; i < missing.length; i += 10)
      chunks.push(missing.slice(i, i + 10));

    const snaps = await Promise.all(
      chunks.map((chunk) =>
        getDocs(
          query(
            collection(db, COL),
            where("__name__", "in", chunk)
          )
        )
      )
    );

    const fetched = snaps
      .flatMap((s) => s.docs)
      .map((d) => {
        const p = normalize(d.id, d.data());
        primeRefs(p);
        return p;
      });

    return [...cachedProducts, ...fetched];
  },

  /* ─────────────────────────
     PRODUCTS BY CATEGORY
  ───────────────────────── */

  async getProductsByCategory(categoryId, pageSize = PAGE_SIZE) {

    if (!categoryId) return [];

    const key = `category_${categoryId}_${pageSize}`;

    const cached = cacheGet(key);

    if (cached) return cached;

    const snap = await getDocs(
      query(
        collection(db, COL),
        where("categoryId", "==", categoryId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      )
    );

    const products = snap.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p);
      return p;
    });

    cacheSet(key, products);

    return products;
  },

  /* ─────────────────────────
     COLLECTION PRODUCTS
  ───────────────────────── */

  async getProductsByCollections(types = [], maxResults = 8) {

    if (!types.length) return [];

    const normalized = [...new Set(types.map((t) => t.toLowerCase()))];

    const key = `collection_${normalized.join(",")}_${maxResults}`;

    const cached = cacheGet(key);

    if (cached) return cached;

    const snap = await getDocs(
      query(
        collection(db, COL),
        where("isActive", "==", true),
        where("collectionTypes", "array-contains-any", normalized.slice(0, 10)),
        limit(maxResults)
      )
    );

    const products = snap.docs.map((d) => {
      const p = normalize(d.id, d.data());
      primeRefs(p);
      return p;
    });

    cacheSet(key, products);

    return products;
  },

  /* ─────────────────────────
     CLIENT SEARCH
  ───────────────────────── */

  searchProducts(term, products = []) {

    if (!term?.trim()) return [];

    const q = term.toLowerCase();

    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  },

  /* ─────────────────────────
     CACHE BUST
  ───────────────────────── */

  bustCache(id, slug) {

    if (id) cache.delete(`product_${id}`);

    if (slug) cache.delete(`slug_${slug}`);

    for (const key of cache.keys()) {
      if (
        key.startsWith("{") ||
        key.startsWith("category_") ||
        key.startsWith("collection_")
      ) {
        cache.delete(key);
      }
    }
  },
};