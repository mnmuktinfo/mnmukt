import { 
  collection, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc 
} from "firebase/firestore";
import { db } from "../../config/firebase";

export const categoryService = {
  // Create new category
  createCategory: async (categoryData) => {
    try {
      const categoryWithMetadata = {
        ...categoryData,
        price: Number(categoryData.price) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "categories"), categoryWithMetadata);
      return { id: docRef.id, ...categoryWithMetadata };
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  },

  // Get all categories
  // getCategories: async () => {
  //   try {
  //     const querySnapshot = await getDocs(collection(db, "categories"));
  //     return querySnapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     }));
  //   } catch (error) {
  //     throw new Error(`Failed to fetch categories: ${error.message}`);
  //   }
  // },

  // Get single category
  getCategory: async (id) => {
    try {
      const docRef = doc(db, "categories", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Category not found");
      }
    } catch (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const docRef = doc(db, "categories", id);
      await updateDoc(docRef, {
        ...categoryData,
        price: Number(categoryData.price) || 0,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const docRef = doc(db, "categories", id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  },
  // Get all categories for dropdown
  getCategories: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }
};
