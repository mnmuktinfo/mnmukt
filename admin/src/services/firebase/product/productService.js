import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
} from "firebase/firestore";

import { db } from "../../../config/firebase";

const PRODUCTS_COLLECTION = "products";
const PAGE_SIZE = 20;

/*
  ─── Firestore Product Document Shape ─────────────────────────────────────────

  {
    name:           string,
    slug:           string,
    description:    string,
    banner:         string,
    images:         string[],
    price:          number,
    originalPrice:  number,
    stock:          number,
    sizes:          string[],
    colors:         { name, image }[],
    material:       string,
    brand:          string,
    categoryId:     string,

    // UPDATED
    collectionTypes: string[],

    isActive:       boolean,
    createdAt:      Timestamp,
    updatedAt:      Timestamp,
  }
*/

// ─── In-memory cache ─────────────────────────────────────────────
const cache = new Map();
const buildCacheKey = (params) => JSON.stringify(params);

export const productService = {

  // ═══════════════════════════════════════
  // CREATE PRODUCT
  // ═══════════════════════════════════════
  async createProduct(productData) {
    try {

      const product = {
        name: productData.name ?? "",
        slug: productData.slug ?? "",
        description: productData.description ?? "",

        banner: productData.banner ?? "",
        images: Array.isArray(productData.images) ? productData.images : [],

        price: Number(productData.price) || 0,
        originalPrice: Number(productData.originalPrice) || 0,
        stock: Number(productData.stock) || 0,

        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        colors: Array.isArray(productData.colors) ? productData.colors : [],

        categoryId: productData.categoryId ?? "",

        // ARRAY SUPPORT
        collectionTypes: Array.isArray(productData.collectionTypes)
          ? productData.collectionTypes
          : [],

        isActive: productData.isActive ?? true,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);

      cache.clear();

      return { id: docRef.id, ...product };

    } catch (error) {
      throw new Error(`Create product failed: ${error.message}`);
    }
  },

  // ═══════════════════════════════════════
  // PAGINATED PRODUCT LIST
  // ═══════════════════════════════════════
  async getProducts({
    lastDoc = null,
    category = "all",
    collectionType = "all",
    status = "all",
    pageSize = PAGE_SIZE,
  } = {}) {

    const params = { lastDoc: lastDoc?.id, category, collectionType, status, pageSize };
    const cacheKey = buildCacheKey(params);

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {

      const constraints = [];

      if (category !== "all")
        constraints.push(where("categoryId", "==", category));

      if (collectionType !== "all")
        constraints.push(where("collectionTypes", "array-contains", collectionType));

      if (status !== "all")
        constraints.push(where("isActive", "==", status === "active"));

      constraints.push(orderBy("createdAt", "desc"));

      if (lastDoc) constraints.push(startAfter(lastDoc));

      constraints.push(limit(pageSize));

      const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      const products = snapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id,
          name: data.name,
          slug: data.slug,
          banner: data.banner,
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          sizes: data.sizes,
          colors: data.colors,
          categoryId: data.categoryId,

          // UPDATED
          collectionTypes: data.collectionTypes,

          isActive: data.isActive,
          createdAt: data.createdAt,
        };
      });

      const newLastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      const result = {
        products,
        lastDoc: newLastDoc,
        hasMore: snapshot.docs.length === pageSize,
      };

      cache.set(cacheKey, result);

      return result;

    } catch (error) {
      throw new Error(`Fetch products failed: ${error.message}`);
    }
  },

  // ═══════════════════════════════════════
  // GET SINGLE PRODUCT
  // ═══════════════════════════════════════
  async getProduct(id) {

    const cacheKey = `product_${id}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {

      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        throw new Error("Product not found");
      }

      const product = { id: snapshot.id, ...snapshot.data() };

      cache.set(cacheKey, product);

      return product;

    } catch (error) {

      if (error.message === "Product not found") throw error;

      throw new Error(`Fetch product failed: ${error.message}`);
    }
  },

  // ═══════════════════════════════════════
  // UPDATE PRODUCT
  // ═══════════════════════════════════════
  async updateProduct(id, productData) {

    const docRef = doc(db, PRODUCTS_COLLECTION, id);

    const updates = {
      ...productData,
      updatedAt: serverTimestamp()
    };

    if ("collectionTypes" in productData) {
      updates.collectionTypes = Array.isArray(productData.collectionTypes)
        ? productData.collectionTypes
        : [];
    }

    if ("images" in productData) {
      updates.images = Array.isArray(productData.images)
        ? productData.images
        : [];
    }

    if ("sizes" in productData) {
      updates.sizes = Array.isArray(productData.sizes)
        ? productData.sizes
        : [];
    }

    if ("colors" in productData) {
      updates.colors = Array.isArray(productData.colors)
        ? productData.colors
        : [];
    }

    await updateDoc(docRef, updates);

    cache.clear();

    return true;
  },

  // ═══════════════════════════════════════
  // DELETE PRODUCT
  // ═══════════════════════════════════════
  async deleteProduct(id) {
    try {

      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));

      cache.clear();

      return true;

    } catch (error) {

      if (error.code === "permission-denied") {
        throw new Error("Permission denied while deleting product.");
      }

      throw new Error(`Delete product failed: ${error.message}`);
    }
  },

  // ═══════════════════════════════════════
  // UPDATE STOCK
  // ═══════════════════════════════════════
  async updateProductStock(id, delta) {
    try {

      const docRef = doc(db, PRODUCTS_COLLECTION, id);

      await updateDoc(docRef, {
        stock: increment(delta),
        updatedAt: serverTimestamp(),
      });

      cache.clear();

      return true;

    } catch (error) {

      throw new Error(`Stock update failed: ${error.message}`);
    }
  },

  // ═══════════════════════════════════════
  // LOW STOCK
  // ═══════════════════════════════════════
  async getLowStockProducts(threshold = 10) {

    const cacheKey = `low_stock_${threshold}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {

      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("stock", "<=", threshold),
        where("stock", ">", 0),
        orderBy("stock", "asc"),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);

      const result = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      cache.set(cacheKey, result);

      return result;

    } catch (error) {

      throw new Error(`Fetch low stock failed: ${error.message}`);
    }
  },

  // ═══════════════════════════════════════
  // OUT OF STOCK
  // ═══════════════════════════════════════
  async getOutOfStockProducts() {

    const cacheKey = "out_of_stock";

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {

      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("stock", "==", 0),
        orderBy("updatedAt", "desc"),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);

      const result = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      cache.set(cacheKey, result);

      return result;

    } catch (error) {

      throw new Error(`Fetch out-of-stock failed: ${error.message}`);
    }
  },
};