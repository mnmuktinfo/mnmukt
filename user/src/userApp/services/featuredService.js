import { db } from "../../config/firebaseDB";
import { collection, getDocs } from "firebase/firestore";

export const getFeaturedCollections = async () => {
  try {
    const snap = await getDocs(collection(db, "featuredCollections"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching featured collections:", error);
    return [];
  }
};
