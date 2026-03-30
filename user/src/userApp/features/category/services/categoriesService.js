/**
 * categoriesService.js
 *
 * Firestore + React Query service for Categories (Admin Schema)
 * Fully supports:
 *   • fetchCategories (paginated)
 *   • getCategoryById
 *   • createCategory
 *   • updateCategory
 *   • toggleStatus
 *   • deleteCategory
 * Includes: normalization, error handling, React Query hooks
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../../../../config/firebaseDB";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ────────────────────────────────
   COLLECTION & CONFIG
──────────────────────────────── */
const COL = "categories";
const PAGE_SIZE = 50;

/* ────────────────────────────────
   NORMALIZE  (Admin schema)
   Matches the fields returned by the admin service (2nd file)
──────────────────────────────── */
const normalize = (id, data = {}) => ({
  id:           String(id),
  name:         data.name          ?? "",
  slug:         data.slug          ?? "",
  description:  data.description   ?? "",
  image:        data.image         ?? data.banner ?? "",
  icon:         data.icon          ?? "",
  color:        data.color         ?? "#da127d",
  isActive:     data.isActive      ?? true,
  sortOrder:    data.sortOrder     ?? 0,
  productCount: data.productCount  ?? 0,
  createdAt:    data.createdAt     ?? null,
  updatedAt:    data.updatedAt     ?? null,
});

/* ────────────────────────────────
   REACT QUERY KEYS
──────────────────────────────── */
export const CATEGORY_KEYS = {
  all:       ()     => ["categories", "all"],
  paginated: (page = 0) => ["categories", "page", page],
  byId:      (id)   => ["categories", "id", id],
};

/* ────────────────────────────────
   CURSOR HELPERS
   Firestore QueryDocumentSnapshot cannot be cloned by IndexedDB's
   structured-clone algorithm, so we never store the raw snapshot in
   React Query cache. Instead we persist only the plain scalar values
   needed to rebuild a Firestore cursor via startAfter(id, createdAt).
──────────────────────────────── */

/**
 * Extract a serializable cursor from the last Firestore doc snapshot.
 * Returns a plain object { id, createdAt } or null.
 */
const serializeCursor = (snapshot) => {
  if (!snapshot) return null;
  const d = snapshot.data();
  return {
    id:        snapshot.id,
    // Firestore Timestamps have a toMillis() method; fall back to null
    createdAt: d?.createdAt?.toMillis?.() ?? null,
  };
};

/**
 * Rebuild a Firestore doc ref from a plain cursor so startAfter() works.
 * We fetch the real snapshot on-demand — it won't be cached by RQ.
 */
const resolveCursor = async (cursor) => {
  if (!cursor?.id) return null;
  const snap = await getDoc(doc(db, COL, cursor.id));
  return snap.exists() ? snap : null;
};

/* ────────────────────────────────
   FETCH CATEGORIES
   Returns: { data, lastCursor, hasMore, error }
   lastCursor is a plain { id, createdAt } object — safe for IDB.
──────────────────────────────── */
export const fetchCategories = async (lastCursor = null) => {
  try {
    const constraints = [orderBy("createdAt", "desc")];

    if (lastCursor) {
      const cursorSnap = await resolveCursor(lastCursor);
      if (cursorSnap) constraints.push(startAfter(cursorSnap));
    }

    constraints.push(limit(PAGE_SIZE));

    const snap = await getDocs(query(collection(db, COL), ...constraints));
    const data = snap.docs.map((d) => normalize(d.id, d.data()));

    return {
      data,
      lastCursor: serializeCursor(snap.docs[snap.docs.length - 1] ?? null),
      hasMore:    snap.docs.length === PAGE_SIZE,
      error:      null,
    };
  } catch (err) {
    console.error("Error in fetchCategories:", err.message);
    return { data: [], lastCursor: null, hasMore: false, error: err.message };
  }
};

/* ────────────────────────────────
   GET CATEGORY BY ID
   Returns: { data, error }
──────────────────────────────── */
export const getCategoryById = async (id) => {
  try {
    if (!id) throw new Error("Category ID is required");

    const snap = await getDoc(doc(db, COL, String(id)));
    if (!snap.exists()) throw new Error("Category not found");

    return { data: normalize(snap.id, snap.data()), error: null };
  } catch (err) {
    console.error("Error in getCategoryById:", err.message);
    return { data: null, error: err.message };
  }
};

/* ────────────────────────────────
   CREATE CATEGORY
   Returns: { id, error }
──────────────────────────────── */
export const createCategoryApi = async (data) => {
  try {
    if (!data?.name) throw new Error("Category name is required");

    const payload = {
      ...data,
      isActive:     true,
      productCount: 0,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    };

    const ref = await addDoc(collection(db, COL), payload);
    return { id: ref.id, error: null };
  } catch (err) {
    console.error("Error in createCategoryApi:", err.message);
    return { id: null, error: err.message };
  }
};

/* ────────────────────────────────
   UPDATE CATEGORY
   Returns: { success, error }
──────────────────────────────── */
export const updateCategoryApi = async (id, data) => {
  try {
    if (!id)   throw new Error("Category ID is required");
    if (!data) throw new Error("No data provided for update");

    const ref  = doc(db, COL, String(id));
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Category not found");

    const payload = { ...data, updatedAt: serverTimestamp() };

    if (payload.incrementProductCount != null) {
      payload.productCount = increment(payload.incrementProductCount);
      delete payload.incrementProductCount;
    }

    await updateDoc(ref, payload);
    return { success: true, error: null };
  } catch (err) {
    console.error("Error in updateCategoryApi:", err.message);
    return { success: false, error: err.message };
  }
};

/* ────────────────────────────────
   TOGGLE STATUS
   Returns: { success, error }
──────────────────────────────── */
export const toggleCategoryStatus = async (id, current) => {
  try {
    if (!id) throw new Error("Category ID is required");

    await updateDoc(doc(db, COL, String(id)), {
      isActive:  !current,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error in toggleCategoryStatus:", err.message);
    return { success: false, error: err.message };
  }
};

/* ────────────────────────────────
   DELETE CATEGORY
   Returns: { success, error }
──────────────────────────────── */
export const deleteCategoryById = async (id) => {
  try {
    if (!id) throw new Error("Category ID is required");
    await deleteDoc(doc(db, COL, String(id)));
    return { success: true, error: null };
  } catch (err) {
    console.error("Error in deleteCategoryById:", err.message);
    return { success: false, error: err.message };
  }
};

/* ────────────────────────────────
   REACT QUERY HOOKS
   mutationFn wrappers throw on error so React Query
   can surface them via isError / error as expected.
──────────────────────────────── */

/** Fetch all categories (first page) */
export const useCategories = () => {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey:           CATEGORY_KEYS.all(),
    queryFn:            async () => {
      const res = await fetchCategories();
      if (res.error) throw new Error(res.error);
      return res;
    },
    staleTime:          15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:              2,
  });

  const prefetchById = (id) => {
    if (!id) return;
    qc.prefetchQuery({
      queryKey: CATEGORY_KEYS.byId(id),
      queryFn:  async () => {
        const res = await getCategoryById(id);
        if (res.error) throw new Error(res.error);
        return res.data;
      },
      staleTime: 15 * 60 * 1000,
    });
  };

  return {
    categories: q.data?.data ?? [],
    lastDoc:    q.data?.lastDoc ?? null,
    hasMore:    q.data?.hasMore ?? false,
    isLoading:  q.isLoading,
    isError:    q.isError,
    error:      q.error,
    refetch:    q.refetch,
    prefetchById,
  };
};

/** Fetch single category by ID */
export const useCategoryById = (id) =>
  useQuery({
    queryKey:           CATEGORY_KEYS.byId(id),
    queryFn:            async () => {
      const res = await getCategoryById(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    enabled:            !!id,
    staleTime:          15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry:              2,
  });

/** Create a new category */
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await createCategoryApi(data);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all() }),
  });
};

/** Update an existing category — call as mutate({ id, data }) */
export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateCategoryApi(id, data);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.byId(id) });
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all() });
    },
  });
};

/** Toggle active status — call as mutate({ id, current }) */
export const useToggleCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, current }) => {
      const res = await toggleCategoryStatus(id, current);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.byId(id) });
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all() });
    },
  });
};

/** Delete a category — call as mutate(id) */
export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await deleteCategoryById(id);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all() }),
  });
};

/* ────────────────────────────────
   EXPORT FIRESTORE APIs (direct usage)
──────────────────────────────── */
export const categoryService = {
  fetchCategories,
  getCategoryById,
  createCategoryApi,
  updateCategoryApi,
  toggleCategoryStatus,
  deleteCategoryById,
};