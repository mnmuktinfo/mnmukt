import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp 
} from "firebase/firestore";
import { db } from "../../config/firebase";

export const dashboardService = {
  // Get total users count
  getUsersCount: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.size;
    } catch (error) {
      throw new Error(`Failed to fetch users count: ${error.message}`);
    }
  },

  // Get total categories count
  getCategoriesCount: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      return querySnapshot.size;
    } catch (error) {
      throw new Error(`Failed to fetch categories count: ${error.message}`);
    }
  },

  // Get total products count
  getProductsCount: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      return querySnapshot.size;
    } catch (error) {
      throw new Error(`Failed to fetch products count: ${error.message}`);
    }
  },

  // Get total orders count
  getOrdersCount: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      return querySnapshot.size;
    } catch (error) {
      throw new Error(`Failed to fetch orders count: ${error.message}`);
    }
  },

  // Get recent products
  getRecentProducts: async (limitCount = 5) => {
    try {
      const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch recent products: ${error.message}`);
    }
  },

  // Get popular products (by views or orders)
  getPopularProducts: async (limitCount = 5) => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by some metric (you can replace this with actual popularity metric)
      return products
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limitCount);
    } catch (error) {
      throw new Error(`Failed to fetch popular products: ${error.message}`);
    }
  },

  // Get sales analytics (last 30 days)
  getSalesData: async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        collection(db, "orders"),
        where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo)),
        orderBy("createdAt", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch sales data: ${error.message}`);
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    try {
      const q = query(
        collection(db, "products"),
        where("stock", "<=", threshold)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
    }
  }
};