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
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../../config/firebaseConfig";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const COL = "products";
const PAGE_SIZE = 20;
const IS_DEV = import.meta.env.DEV;

const log = {
  warn: (...a) => IS_DEV && console.warn("[ProductService]", ...a),
  error: (...a) => IS_DEV && console.error("[ProductService]", ...a),
  info: (...a) => IS_DEV && console.info("[ProductService]", ...a),
};

// ─────────────────────────────────────────────────────────────
// IN-MEMORY CACHE
// Two-layer: primary key cache + cross-reference maps
// ─────────────────────────────────────────────────────────────

const cache = new Map();     // cacheKey → value
const slugToId = new Map();  // slug     → id
const idToSlug = new Map();  // id       → slug

const buildCacheKey = (params) => JSON.stringify(params);

// Prime cross-reference maps after any product fetch
const primeRefs = (product) => {
  if (!product?.id) return;
  cache.set(`product_${product.id}`, product);
  if (product.slug) {
    cache.set(`slug_${product.slug}`, product);
    slugToId.set(product.slug, product.id);
    idToSlug.set(product.id, product.slug);
  }
};

// ─────────────────────────────────────────────────────────────
// NORMALIZATION
// Always returns a complete, type-safe product shape
// ─────────────────────────────────────────────────────────────

export const normalize = (id, data) => {
  if (!id || !data) {
    log.warn("normalize() called with empty id or data");
    return null;
  }
  return {
    id: String(id),
    name: data.name ?? "",
    slug: data.slug ?? "",
    brand: data.brand ?? "",                          // 👈 shown on product page
    shortDescription: data.shortDescription ?? "",     // 👈 cards / quick view
    description: data.description ?? "",
    image: data.image ?? data.banner ?? "",
    hoverImage: data.hoverImage ?? "",                  // 👈 product card hover-swap
    videoUrl: data.videoUrl ?? "",                      // 👈 product gallery video
    images: Array.isArray(data.images) ? data.images : [],
    price: Number(data.price ?? data.unitPrice ?? data.salePrice ?? 0),
    originalPrice: Number(data.originalPrice ?? data.mrp ?? data.comparePrice ?? data.price ?? 0),
    stock: Number(data.stock ?? 0),
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    highlights: Array.isArray(data.highlights) ? data.highlights : [], // 👈 spec list on PDP
    categoryId: data.categoryId ?? "",
    collectionTypes: Array.isArray(data.collectionTypes) ? data.collectionTypes : [],
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? false,                // 👈 badges customers see
    isTrending: data.isTrending ?? false,
    isNewArrival: data.isNewArrival ?? false,
    isBestSeller: data.isBestSeller ?? false,
    offers: Array.isArray(data.offers) ? data.offers : [], // 👈 promos shown to customers
    seo: {                                                // 👈 needed for <title>/<meta> on PDP
      metaTitle: data.seo?.metaTitle ?? "",
      metaDescription: data.seo?.metaDescription ?? "",
      metaKeywords: data.seo?.metaKeywords ?? "",
    },
    createdAt: data.createdAt ?? null,
    // 👈 fixed: tags is stored as a comma-separated string on the admin form,
    // not an array — this was silently breaking searchProducts()'s tag match
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string" && data.tags.trim()
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    averageRating: Number(data.averageRating ?? 0),
    totalReviews: Number(data.totalReviews ?? 0),
  };
};

// ─────────────────────────────────────────────────────────────
// PRODUCT SERVICE
// ─────────────────────────────────────────────────────────────

export const productService = {

  // ── PAGINATED PRODUCTS ────────────────────────────────────
  async getProducts({
    lastDoc = null,
    category = "all",
    collectionType = "all",
    status = "active",
    pageSize = PAGE_SIZE,
  } = {}) {
    const params = {
      lastDoc: lastDoc?.id ?? null,
      category,
      collectionType,
      status,
      pageSize,
    };
    const cacheKey = buildCacheKey(params);
    if (cache.has(cacheKey)) return cache.get(cacheKey);

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

    const snap = await getDocs(query(collection(db, COL), ...constraints));

    const products = snap.docs
      .map((d) => {
        const p = normalize(d.id, d.data());
        if (p) primeRefs(p);
        return p;
      })
      .filter(Boolean); // drop any null from bad normalize

    const newLastDoc = snap.docs.length
      ? snap.docs[snap.docs.length - 1]
      : null;

    const result = {
      products,
      lastDoc: newLastDoc,
      hasMore: snap.docs.length === pageSize,
    };

    cache.set(cacheKey, result);
    return result;
  },

  // ── GET ALL PRODUCTS (flat list for search / hook's allProducts) ──
  async getAllProducts() {
    const cacheKey = "all_products";
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const snap = await getDocs(
      query(
        collection(db, COL),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      )
    );

    const products = snap.docs
      .map((d) => {
        const p = normalize(d.id, d.data());
        if (p) primeRefs(p);
        return p;
      })
      .filter(Boolean);

    cache.set(cacheKey, products);
    return products;
  },

  // ── GET PRODUCT BY ID ─────────────────────────────────────
async getProductById(id) {
  if (!id) return null;
  const cacheKey = `product_${id}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const snap = await getDoc(doc(db, COL, String(id)));
  if (!snap.exists()) {
    log.warn(`getProductById: no document found for id="${id}"`);
    return null;
  }

  const product = normalize(snap.id, snap.data());
  if (!product?.isActive) {                 // 👈 added
    log.warn(`getProductById: product "${id}" is inactive`);
    return null;
  }
  primeRefs(product);
  return product;
},

  // ── GET PRODUCTS BY SLUG ──────────────────────────────────
async getProductBySlug(slug) {
  if (!slug) return null;

  // 1️⃣ Direct slug cache hit
  if (cache.has(`slug_${slug}`)) {
    const cached = cache.get(`slug_${slug}`);
    return cached?.isActive ? cached : null;
  }

  // 2️⃣ Cross-ref: slug → id → product cache
  if (slugToId.has(slug)) {
    const id = slugToId.get(slug);
    if (cache.has(`product_${id}`)) {
      const cached = cache.get(`product_${id}`);
      return cached?.isActive ? cached : null;
    }
  }

  // 3️⃣ Firestore query
  const snap = await getDocs(
    query(collection(db, COL), where("slug", "==", slug), limit(1))
  );
  if (snap.empty) {
    log.warn(`getProductBySlug: no document found for slug="${slug}"`);
    return null;
  }

  const product = normalize(snap.docs[0].id, snap.docs[0].data());
  if (!product?.isActive) {
    log.warn(`getProductBySlug: product "${slug}" is inactive`);
    return null;
  }
  primeRefs(product);
  return product;
},

  // ── GET PRODUCTS BY IDs (batched, Firestore "in" max 10) ──
  async getProductsByIds(ids = []) {
    if (!ids.length) return [];

    const unique = [...new Set(ids.map(String))];

    // 1️⃣ Resolve from cache
    const cached = unique
      .map((id) => cache.get(`product_${id}`))
      .filter(Boolean);

    const missingIds = unique.filter((id) => !cache.has(`product_${id}`));
    if (!missingIds.length) return cached;

    // 2️⃣ Chunk into batches of 10 (Firestore "in" limit)
    const chunks = [];
    for (let i = 0; i < missingIds.length; i += 10) {
      chunks.push(missingIds.slice(i, i + 10));
    }

    const snapshots = await Promise.all(
      chunks.map((chunk) =>
        getDocs(
          query(collection(db, COL), where("__name__", "in", chunk))
        )
      )
    );

    const fetched = snapshots
      .flatMap((snap) => snap.docs)
      .map((d) => {
        const p = normalize(d.id, d.data());
        if (p) primeRefs(p);
        return p;
      })
      .filter(Boolean);

    return [...cached, ...fetched];
  },

  // ── GET PRODUCTS BY CATEGORY (full page) ─────────────────
  async getProductsByCategory(categoryId, pageSize = PAGE_SIZE) {
    if (!categoryId) return [];

    const cacheKey = `category_${categoryId}_${pageSize}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const snap = await getDocs(
      query(
        collection(db, COL),
        where("categoryId", "==", categoryId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      )
    );

    const products = snap.docs
      .map((d) => {
        const p = normalize(d.id, d.data());
        if (p) primeRefs(p);
        return p;
      })
      .filter(Boolean);

    cache.set(cacheKey, products);
    return products;
  },

  // ── GET PRODUCTS BY CATEGORY (server-side limited) ───────
  // Used by useProducts.getProductsByCategoryLimited — avoids
  // fetching full page when you only need a few products.
  async getProductsByCategoryLimited(categoryId, maxResults = 5) {
    if (!categoryId) return [];

    const cacheKey = `category_${categoryId}_limited_${maxResults}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const snap = await getDocs(
      query(
        collection(db, COL),
        where("categoryId", "==", categoryId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(maxResults)
      )
    );

    const products = snap.docs
      .map((d) => {
        const p = normalize(d.id, d.data());
        if (p) primeRefs(p);
        return p;
      })
      .filter(Boolean);

    cache.set(cacheKey, products);
    return products;
  },

  // ── GET PRODUCTS BY COLLECTION TYPES ──────────────────────
  async getProductsByCollections(types = [], maxResults = 8) {
    if (!types.length) return [];

    const normalized = [...new Set(types.map((t) => t.toLowerCase()))];
    const cacheKey = `collection_${normalized.join(",")}_${maxResults}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    // Firestore array-contains-any allows max 10 values
    const snap = await getDocs(
      query(
        collection(db, COL),
        where("isActive", "==", true),
        where("collectionTypes", "array-contains-any", normalized.slice(0, 10)),
        limit(maxResults)
      )
    );

    const products = snap.docs
      .map((d) => {
        const p = normalize(d.id, d.data());
        if (p) primeRefs(p);
        return p;
      })
      .filter(Boolean);

    cache.set(cacheKey, products);
    return products;
  },

  // ── CLIENT-SIDE SEARCH ─────────────────────────────────────
  // Pure function — no Firestore call, works on cached allProducts
  searchProducts(term, allProducts = []) {
    if (!term?.trim()) return [];
    const lower = term.trim().toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  },

  // ── ADD REVIEW (EMBEDDED) ──────────────────────────────────
  async addReview(productId, reviewData) {
    if (!productId || !reviewData) throw new Error("Missing data");

    const docRef = doc(db, COL, String(productId));
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("Product not found");

    const data = snap.data();
    const oldTotal = data.totalReviews || 0;
    const oldAvg = data.averageRating || 0;

    const newRating = Number(reviewData.rating);
    const newTotal = oldTotal + 1;
    const newAvg = ((oldAvg * oldTotal) + newRating) / newTotal;

    const newReview = {
      id: Date.now().toString(),
      author: reviewData.author || "Guest",
      rating: newRating,
      text: reviewData.text || "",
      date: new Date().toISOString(),
      isVerified: reviewData.isVerified ?? false,
      userId: reviewData.userId || null,
    };

    await updateDoc(docRef, {
      totalReviews: newTotal,
      averageRating: newAvg,
      reviews: arrayUnion(newReview),
    });

    // Clean up cache
    this.bustCache(productId, data.slug);
    
    return newReview;
  },

  // ── CACHE BUST ─────────────────────────────────────────────
  // Call after any create / update / delete mutation
  bustCache(id, slug) {
    if (id) {
      cache.delete(`product_${id}`);
      const knownSlug = idToSlug.get(String(id));
      if (knownSlug) {
        cache.delete(`slug_${knownSlug}`);
        slugToId.delete(knownSlug);
      }
      idToSlug.delete(String(id));
    }

    if (slug) {
      cache.delete(`slug_${slug}`);
      const knownId = slugToId.get(slug);
      if (knownId) {
        cache.delete(`product_${knownId}`);
        idToSlug.delete(knownId);
      }
      slugToId.delete(slug);
    }

    // Bust aggregate caches that could be stale
    cache.delete("all_products");
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

    log.info(`Cache busted for id="${id}" slug="${slug}"`);
  },

  // ── FULL CACHE CLEAR (e.g., after bulk import) ─────────────
  clearCache() {
    cache.clear();
    slugToId.clear();
    idToSlug.clear();
    log.info("Full cache cleared");
  },

  // ── CACHE STATS (dev/debug only) ──────────────────────────
  getCacheStats() {
    if (!IS_DEV) return null;
    return {
      cacheSize: cache.size,
      slugMapSize: slugToId.size,
      idMapSize: idToSlug.size,
      keys: [...cache.keys()],
    };
  },
};