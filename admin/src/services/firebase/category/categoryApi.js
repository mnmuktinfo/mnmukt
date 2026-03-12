import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  increment,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

const PAGE_SIZE = 50;

/* ---------------- FETCH CATEGORIES ---------------- */
export const fetchCategories = async (lastDoc = null) => {
  try {
    const q = query(
      collection(db, "categories"),
      orderBy("createdAt", "desc"),
      lastDoc ? startAfter(lastDoc) : limit(PAGE_SIZE),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    return {
      data,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === PAGE_SIZE,
      error: null,
    };
  } catch (err) {
    console.error("Error in fetchCategories:", err.message);
    return { data: [], lastDoc: null, hasMore: false, error: err.message };
  }
};

/* ---------------- TOGGLE STATUS ---------------- */
export const toggleCategoryStatus = async (id, current) => {
  try {
    const ref = doc(db, "categories", id);
    await updateDoc(ref, { isActive: !current });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error in toggleCategoryStatus:", err.message);
    return { success: false, error: err.message };
  }
};

/* ---------------- DELETE CATEGORY ---------------- */
export const deleteCategoryById = async (id) => {
  try {
    const ref = doc(db, "categories", id);
    await deleteDoc(ref);
    return { success: true, error: null };
  } catch (err) {
    console.error("Error in deleteCategoryById:", err.message);
    return { success: false, error: err.message };
  }
};

/* ---------------- GET CATEGORY ---------------- */
export const getCategoryById = async (id) => {
  try {
    if (!id) throw new Error("Category ID is required");

    const ref = doc(db, "categories", id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) throw new Error("Category not found");

    return { data: { id: snapshot.id, ...snapshot.data() }, error: null };
  } catch (err) {
    console.error("Error in getCategoryById:", err.message);
    return { data: null, error: err.message };
  }
};

/* ---------------- CREATE CATEGORY ---------------- */
export const createCategoryApi = async (data) => {
  try {
    if (!data || !data.name) throw new Error("Category name is required");

    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      productCount: 0,
    };

    const ref = await addDoc(collection(db, "categories"), payload);
    return { id: ref.id, error: null };
  } catch (err) {
    console.error("Error in createCategoryApi:", err.message);
    return { id: null, error: err.message };
  }
};

/* ---------------- UPDATE CATEGORY ---------------- */
export const updateCategoryApi = async (id, data) => {
  try {
    if (!id) throw new Error("Category ID is required");
    if (!data) throw new Error("No data provided for update");

    const ref = doc(db, "categories", id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error("Category not found");

    const updatePayload = { ...data, updatedAt: serverTimestamp() };

    // Optional increment for productCount
    if (data.incrementProductCount) {
      updatePayload.productCount = increment(data.incrementProductCount);
      delete updatePayload.incrementProductCount;
    }

    await updateDoc(ref, updatePayload);
    return { success: true, error: null };
  } catch (err) {
    console.error("Error in updateCategoryApi:", err.message);
    return { success: false, error: err.message };
  }
};