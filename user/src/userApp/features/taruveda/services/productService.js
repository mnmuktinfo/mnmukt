
 
 

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../config/firebase";

// const PRODUCTS_COLLECTION = "products";
const TARUVEDA_COLLECTION = "taruvedaProducts";

export const productService = {

  /* -------------------------------------------------- */
  /* EXISTING PRODUCTS COLLECTION (unchanged) */
  /* -------------------------------------------------- */

  getProducts: async () => {
    try {
      const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  getProductById: async (id) => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Product not found");
      }

      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  /* -------------------------------------------------- */
  /* TARUVEDA COLLECTION */
  /* -------------------------------------------------- */

  // GET ALL TARUVEDA PRODUCTS
  getTaruvedaProducts: async () => {
    try {
      const snapshot = await getDocs(collection(db, TARUVEDA_COLLECTION));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Taruveda products: ${error.message}`);
    }
  },

  // CREATE TARUVEDA PRODUCT
  createTaruvedaProduct: async (productData) => {
    try {
      const docRef = await addDoc(
        collection(db, TARUVEDA_COLLECTION),
        {
          ...productData,
          isActive: true,
          createdAt: serverTimestamp(),
        }
      );

      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create Taruveda product: ${error.message}`);
    }
  },

  // UPDATE TARUVEDA PRODUCT
  updateTaruvedaProduct: async (id, updatedData) => {
    try {
      const docRef = doc(db, TARUVEDA_COLLECTION, id);
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to update Taruveda product: ${error.message}`);
    }
  },

  // DELETE TARUVEDA PRODUCT
  deleteTaruvedaProduct: async (id) => {
    try {
      const docRef = doc(db, TARUVEDA_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete Taruveda product: ${error.message}`);
    }
  },

};
