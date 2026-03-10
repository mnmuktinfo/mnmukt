import { db } from "../../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getAllCategories = async () => {
  try {
    const snap = await getDocs(collection(db, "categories"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
};