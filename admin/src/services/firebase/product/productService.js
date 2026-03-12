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

  Aligned with ProductCreatePage — removed: sku, tags, collections[]
  collectionType now stores a collection document ID from COLLECTIONS constant.

  {
    name:           string,
    slug:           string,          // auto-generated from name on save
    description:    string,
    banner:         string,          // Cloudinary URL — main display image
    images:         string[],        // Cloudinary URLs — gallery photos
    price:          number,          // selling price (PKR)
    originalPrice:  number,          // before discount (PKR)
    stock:          number,
    sizes:          string[],        // mix of preset ("XS","M") + custom ("38","Free Size")
    colors:         { name, image }[], // name = color name, image = Cloudinary URL
    material:       string,
    brand:          string,
    categoryId:     string,          // CATEGORIES[n].id
    collectionType: string,          // COLLECTIONS[n].id  ← NOT a hardcoded label
    isActive:       boolean,
    createdAt:      Timestamp,
    updatedAt:      Timestamp,
  }
*/

// ─── In-memory cache (reduces duplicate Firestore reads) ──────────────────────
const cache = new Map();
const buildCacheKey = (params) => JSON.stringify(params);


export const productService = {

  // ═══════════════════════════════════════
  //  CREATE PRODUCT
  // ═══════════════════════════════════════
  async createProduct(productData) {
    try {
      const product = {
        // ── text fields ──────────────────────
        name:        productData.name        ?? "",
        slug:        productData.slug        ?? "",  // auto-generated in the form before calling this
        description: productData.description ?? "",
        banner:      productData.banner      ?? "",
        material:    productData.material    ?? "",
        brand:       productData.brand       ?? "",

        // ── arrays ───────────────────────────
        images: Array.isArray(productData.images) ? productData.images : [],
        sizes:  Array.isArray(productData.sizes)  ? productData.sizes  : [],  // strings — preset or custom
        colors: Array.isArray(productData.colors) ? productData.colors : [],  // [{ name, image }]

        // ── numbers ──────────────────────────
        price:         Number(productData.price)         || 0,
        originalPrice: Number(productData.originalPrice) || 0,
        stock:         Number(productData.stock)         || 0,

        // ── categorisation ───────────────────
        categoryId:     productData.categoryId     ?? "",
        collectionType: productData.collectionType ?? "",  // stores COLLECTIONS[n].id

        // ── flags / timestamps ────────────────
        isActive:  productData.isActive ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);

      cache.clear();

      return { id: docRef.id, ...product };

    } catch (error) {
      if (error.code === "permission-denied") {
        throw new Error("Permission denied while creating product.");
      }
      throw new Error(`Create product failed: ${error.message}`);
    }
  },


  // ═══════════════════════════════════════
  //  PAGINATED PRODUCT LIST
  //  Optimised for 100k+ products
  // ═══════════════════════════════════════
  async getProducts({
    lastDoc        = null,
    category       = "all",
    collectionType = "all",
    status         = "all",
    pageSize       = PAGE_SIZE,
  } = {}) {

    const params   = { lastDoc: lastDoc?.id, category, collectionType, status, pageSize };
    const cacheKey = buildCacheKey(params);

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      const constraints = [];

      if (category       !== "all") constraints.push(where("categoryId",     "==", category));
      if (collectionType !== "all") constraints.push(where("collectionType", "==", collectionType));
      if (status         !== "all") constraints.push(where("isActive",       "==", status === "active"));

      constraints.push(orderBy("createdAt", "desc"));

      // startAfter MUST come before limit
      if (lastDoc) constraints.push(startAfter(lastDoc));

      constraints.push(limit(pageSize));

      const q        = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      // lightweight projection — only what list/card views need
      const products = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id:             d.id,
          name:           data.name,
          slug:           data.slug,
          banner:         data.banner,
          price:          data.price,
          originalPrice:  data.originalPrice,
          stock:          data.stock,
          sizes:          data.sizes,
          colors:         data.colors,
          categoryId:     data.categoryId,
          collectionType: data.collectionType,
          isActive:       data.isActive,
          createdAt:      data.createdAt,
        };
      });

      const newLastDoc = snapshot.docs.length > 0
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
  //  GET SINGLE PRODUCT (full document)
  // ═══════════════════════════════════════
  async getProduct(id) {
    const cacheKey = `product_${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      const docRef   = doc(db, PRODUCTS_COLLECTION, id);
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
  //  UPDATE PRODUCT
  // ═══════════════════════════════════════
  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);

      // Only update fields that are explicitly provided —
      // prevents accidentally wiping fields not in the form.
      const updates = { ...productData, updatedAt: serverTimestamp() };

      // Numeric fields — coerce safely only when provided
      if ("price"         in productData) updates.price         = Number(productData.price)         || 0;
      if ("originalPrice" in productData) updates.originalPrice = Number(productData.originalPrice) || 0;
      if ("stock"         in productData) updates.stock         = Number(productData.stock)         || 0;

      // Array fields — ensure correct type when provided
      if ("images" in productData) updates.images = Array.isArray(productData.images) ? productData.images : [];
      if ("sizes"  in productData) updates.sizes  = Array.isArray(productData.sizes)  ? productData.sizes  : [];
      if ("colors" in productData) updates.colors = Array.isArray(productData.colors) ? productData.colors : [];

      // collectionType stores a collection ID — pass through as-is
      // categoryId passes through as-is from updates spread above

      // Strip fields that no longer exist in our data model
      // so they don't accidentally get written if leftover in old productData
      delete updates.sku;
      delete updates.tags;
      delete updates.collections;

      await updateDoc(docRef, updates);

      cache.clear();
      return true;

    } catch (error) {
      if (error.code === "permission-denied") {
        throw new Error("Permission denied while updating product.");
      }
      throw new Error(`Update product failed: ${error.message}`);
    }
  },


  // ═══════════════════════════════════════
  //  DELETE PRODUCT
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
  //  UPDATE STOCK (atomic)
  //  Pass positive delta to add, negative to deduct.
  //  e.g. updateProductStock(id, -1) after an order
  // ═══════════════════════════════════════
  async updateProductStock(id, delta) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);

      await updateDoc(docRef, {
        stock:     increment(delta),  // atomic — no read needed, no race condition
        updatedAt: serverTimestamp(),
      });

      cache.clear();
      return true;

    } catch (error) {
      throw new Error(`Stock update failed: ${error.message}`);
    }
  },


  // ═══════════════════════════════════════
  //  LOW STOCK  (0 < stock <= threshold)
  // ═══════════════════════════════════════
  async getLowStockProducts(threshold = 10) {
    const cacheKey = `low_stock_${threshold}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("stock", "<=", threshold),
        where("stock", ">",  0),        // exclude out-of-stock (separate query)
        orderBy("stock", "asc"),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const result   = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      throw new Error(`Fetch low stock failed: ${error.message}`);
    }
  },


  // ═══════════════════════════════════════
  //  OUT OF STOCK  (stock === 0)
  // ═══════════════════════════════════════
  async getOutOfStockProducts() {
    const cacheKey = "out_of_stock";
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("stock", "==", 0),        // == 0, not <= 0 (stock never goes negative)
        orderBy("updatedAt", "desc"),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const result   = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      throw new Error(`Fetch out-of-stock failed: ${error.message}`);
    }
  },
};