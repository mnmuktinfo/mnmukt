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

export const productService = {
  // Create new product
  createProduct: async (productData) => {
    try {
     

      const productWithMetadata = {
        ...productData,
        price: Number(productData.price) || 0,
        originalPrice: Number(productData.originalPrice) || 0,
        stock: Number(productData.stock) || 0, // Added stock field
        // createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "products"), productWithMetadata);
      return { id: docRef.id, ...productWithMetadata };
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to create products. Please check your authentication.");
      }
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  // Get all products
  getProducts: async () => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to view products. Please check your authentication.");
      }
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to view this product. Please check your authentication.");
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        ...productData,
        price: Number(productData.price) || 0,
        originalPrice: Number(productData.originalPrice) || 0,
        stock: Number(productData.stock) || 0, // Added stock field
        // updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to update this product. Please check your authentication.");
      }
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to delete this product. Please check your authentication.");
      }
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => product.categoryId === categoryId);
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to view products. Please check your authentication.");
      }
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  },

  // Get products by collection type
  getProductsByCollection: async (collectionType) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => product.collectionType === collectionType);
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to view products. Please check your authentication.");
      }
      throw new Error(`Failed to fetch products by collection: ${error.message}`);
    }
  },

  // Update product stock
  updateProductStock: async (id, newStock) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        stock: Number(newStock) || 0,
        // updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to update product stock. Please check your authentication.");
      }
      throw new Error(`Failed to update product stock: ${error.message}`);
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => (product.stock || 0) <= threshold);
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to view products. Please check your authentication.");
      }
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
    }
  },

  // Get out of stock products
  getOutOfStockProducts: async () => {
    try {
      // const auth = getAuth();
      // const user = auth.currentUser;
      
      // if (!user) {
      //   throw new Error("Authentication required. Please log in.");
      // }

      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => (product.stock || 0) <= 0);
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error("You don't have permission to view products. Please check your authentication.");
      }
      throw new Error(`Failed to fetch out of stock products: ${error.message}`);
    }
  }
};