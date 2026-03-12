import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";

const COLLECTION = "testimonials";

export const testimonialService = {
  getAll: async () => {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  create: async (data) => {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  update: async (id, data) => {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  delete: async (id) => {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};