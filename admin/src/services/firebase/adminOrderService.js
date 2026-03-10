import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../../config/firebase";

const COLLECTION_NAME = "orders";
const PAGE_SIZE = 15;

/**
 * Fetches orders with pagination.
 * @param {Object} lastDoc - The last document snapshot from the previous fetch (for pagination).
 * @returns {Promise<{orders: Array, lastDoc: Object, hasMore: Boolean}>}
 */
export const fetchOrdersService = async (lastDoc = null) => {
  try {
    const ordersRef = collection(db, COLLECTION_NAME);
    
    // Base Query
    let q = query(
      ordersRef, 
      orderBy("createdAt", "desc"), 
      limit(PAGE_SIZE)
    );

    // If loading more, start after the last document
    if (lastDoc) {
      q = query(
        ordersRef, 
        orderBy("createdAt", "desc"), 
        startAfter(lastDoc), 
        limit(PAGE_SIZE)
      );
    }

    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Standardize data to prevent UI crashes
      customerName: doc.data().customerName || "Guest",
      email: doc.data().email || "",
      totalAmount: doc.data().totalAmount || 0,
      status: doc.data().status || "pending",
      items: doc.data().items || [],
      createdAt: doc.data().createdAt // Keep as Timestamp for formatting later
    }));

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === PAGE_SIZE;

    return { orders, lastDoc: newLastDoc, hasMore };

  } catch (error) {
    console.error("Error in fetchOrdersService:", error);
    throw error;
  }
};

/**
 * Updates the status of a specific order.
 * @param {String} orderId 
 * @param {String} newStatus 
 */
export const updateOrderStatusService = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(orderRef, { 
      status: newStatus,
      updatedAt: new Date() // Good practice to track when it changed
    });
    return true;
  } catch (error) {
    console.error("Error in updateOrderStatusService:", error);
    throw error;
  }
};