import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../config/firebaseDB";

export const getAllTestimonials = async () => {
  const snapshot = await getDocs(collection(db, "testimonials"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
