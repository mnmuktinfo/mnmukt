import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

// ---------------- ADD ITEM ----------------
export const addItemApi = async (collectionName, data) => {
  if (!data || !data.name) throw new Error("Item name is required");

  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = await addDoc(collection(db, collectionName), payload);
    return ref.id;
  } catch (err) {
    console.error("[addItemApi] Error:", err);
    throw err;
  }
};

// ---------------- FETCH ITEMS ----------------
export const fetchItemsApi = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("[fetchItemsApi] Error:", err);
    throw err;
  }
};

// ---------------- UPDATE ITEM ----------------
export const updateItemApi = async (collectionName, id, data) => {
  if (!id) throw new Error("Item ID is required");
  if (!data) throw new Error("No data provided for update");

  const ref = doc(db, collectionName, id);
  try {
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error("Item not found");

    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[updateItemApi] Error:", err);
    throw err;
  }
};

// ---------------- DELETE ITEM ----------------
export const deleteItemApi = async (collectionName, id) => {
  if (!id) throw new Error("Item ID is required");

  const ref = doc(db, collectionName, id);
  try {
    await deleteDoc(ref);
  } catch (err) {
    console.error("[deleteItemApi] Error:", err);
    throw err;
  }
};