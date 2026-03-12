import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  writeBatch
} from "firebase/firestore";

import { db } from "../../../config/firebase";

const TARUVEDA_COLLECTION = "taruvedaProducts";

export const productService = {

  /* -------------------------------------------------- */
  /* GET PRODUCTS WITH PAGINATION (BEST FOR 10k+ ITEMS) */
  /* -------------------------------------------------- */

  getTaruvedaProducts: async (lastDoc = null, pageSize = 20) => {
    try {

      const productsRef = collection(db, TARUVEDA_COLLECTION);

      let q;

      if (lastDoc) {
        q = query(
          productsRef,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          productsRef,
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);

      const products = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        products,
        lastDoc: lastVisible
      };

    } catch (error) {
      throw new Error(`Failed to fetch Taruveda products: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* GET ACTIVE PRODUCTS (FOR SHOP PAGE) */
  /* -------------------------------------------------- */

  getActiveProducts: async (lastDoc = null, pageSize = 20) => {

    try {

      const productsRef = collection(db, TARUVEDA_COLLECTION);

      let q;

      if (lastDoc) {
        q = query(
          productsRef,
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          productsRef,
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);

      const products = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        products,
        lastDoc: lastVisible
      };

    } catch (error) {
      throw new Error(`Failed to fetch active products: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* GET SINGLE PRODUCT */
  /* -------------------------------------------------- */

  getTaruvedaProductById: async (id) => {

    try {

      const docRef = doc(db, TARUVEDA_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Product not found");
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };

    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* CREATE PRODUCT */
  /* -------------------------------------------------- */

  createTaruvedaProduct: async (productData) => {

    try {

      const docRef = await addDoc(
        collection(db, TARUVEDA_COLLECTION),
        {
          ...productData,
          isActive: true,
          createdAt: serverTimestamp()
        }
      );

      return docRef.id;

    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* UPDATE PRODUCT */
  /* -------------------------------------------------- */

  updateTaruvedaProduct: async (id, updatedData) => {

    try {

      const docRef = doc(db, TARUVEDA_COLLECTION, id);

      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });

      return true;

    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* DELETE PRODUCT */
  /* -------------------------------------------------- */

  deleteTaruvedaProduct: async (id) => {

    try {

      const docRef = doc(db, TARUVEDA_COLLECTION, id);

      await deleteDoc(docRef);

      return true;

    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* BULK UPDATE PRODUCTS (UP TO 500 AT A TIME) */
  /* -------------------------------------------------- */

  bulkUpdateProducts: async (products) => {

    try {

      const batch = writeBatch(db);

      products.forEach((product) => {

        const ref = doc(db, TARUVEDA_COLLECTION, product.id);

        batch.update(ref, {
          ...product.data,
          updatedAt: serverTimestamp()
        });

      });

      await batch.commit();

      return true;

    } catch (error) {
      throw new Error(`Bulk update failed: ${error.message}`);
    }
  }

};