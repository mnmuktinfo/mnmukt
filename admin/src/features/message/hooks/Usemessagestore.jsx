/**
 * useMessageStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MODULE-LEVEL SINGLETON CACHE — identical pattern to useCustomerStore.
 *
 * Why singleton?
 *  - Navigate away → come back → inbox is INSTANT, zero Firestore reads
 *  - Archive / Delete patches all cached pages simultaneously
 *  - Mark-as-read patches in-place without any re-fetch
 *  - "Load more" accumulates into a growing flat list (no pagination index
 *    needed for an inbox — scroll-to-load is the natural UX)
 *
 * Firebase reads budget:
 *  - First load: 15 reads
 *  - Each "Load More": 15 reads
 *  - Refresh (explicit): clears cache, costs 15 reads
 *  - Every other interaction: 0 reads
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useReducer, useCallback, useRef } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

// ─── SINGLETON STORE ─────────────────────────────────────────────────────────
const store = {
  /** Flat list of all fetched messages (load-more appends here) */
  messages: [],

  /** Firestore cursor for the next load-more call */
  lastCursor: null,

  /** Whether more messages exist in Firestore */
  hasMore: true,

  /** True once at least one fetch has completed */
  initialized: false,

  /** In-flight guard */
  fetching: false,

  /** Subscriber callbacks */
  subscribers: new Set(),

  notify() {
    this.subscribers.forEach((fn) => fn());
  },

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  },

  /** Patch a single message in the flat list */
  patchMessage(id, patch) {
    const idx = this.messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.messages = [...this.messages];
      this.messages[idx] = { ...this.messages[idx], ...patch };
    }
    this.notify();
  },

  /** Remove a message from the flat list */
  removeMessage(id) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this.notify();
  },

  clearAll() {
    this.messages = [];
    this.lastCursor = null;
    this.hasMore = true;
    this.initialized = false;
    this.fetching = false;
    this.notify();
  },
};

// ─── FIREBASE FETCHER ────────────────────────────────────────────────────────
async function fetchFromFirebase(isLoadMore = false) {
  if (store.fetching) return;
  if (!store.hasMore && isLoadMore) return;

  store.fetching = true;

  try {
    let q = query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    );

    if (isLoadMore && store.lastCursor) {
      q = query(
        collection(db, "contactMessages"),
        orderBy("createdAt", "desc"),
        startAfter(store.lastCursor),
        limit(PAGE_SIZE),
      );
    }

    const snap = await getDocs(q);
    const newDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    store.messages = isLoadMore ? [...store.messages, ...newDocs] : newDocs;
    store.lastCursor = snap.docs[snap.docs.length - 1] ?? null;
    store.hasMore = snap.docs.length === PAGE_SIZE;
    store.initialized = true;
  } catch (err) {
    console.error("[MessageStore] Fetch error:", err);
    throw err;
  } finally {
    store.fetching = false;
    store.notify();
  }
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "LOAD_MORE":
      return { ...state, loadingMore: true };
    case "DONE":
      return { ...state, loading: false, loadingMore: false, error: null };
    case "ERROR":
      return {
        ...state,
        loading: false,
        loadingMore: false,
        error: action.msg,
      };
    case "ACTION_START":
      return { ...state, actionLoading: true };
    case "ACTION_END":
      return { ...state, actionLoading: false };
    default:
      return state;
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useMessageStore() {
  const [state, dispatch] = useReducer(reducer, {
    loading: !store.initialized,
    loadingMore: false,
    error: null,
    actionLoading: false,
  });

  const [, forceRender] = useReducer((x) => x + 1, 0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const unsub = store.subscribe(() => {
      if (isMounted.current) forceRender();
    });
    return () => {
      isMounted.current = false;
      unsub();
    };
  }, []);

  // ── Initial load (skip if already cached) ────────────────────────────────
  useEffect(() => {
    if (store.initialized) return;
    dispatch({ type: "LOADING" });
    fetchFromFirebase(false)
      .then(() => {
        if (isMounted.current) dispatch({ type: "DONE" });
      })
      .catch((err) => {
        if (isMounted.current)
          dispatch({ type: "ERROR", msg: "Failed to load messages." });
      });
  }, []);

  // ── Load more (scroll / button) ──────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!store.hasMore || store.fetching) return;
    dispatch({ type: "LOAD_MORE" });
    try {
      await fetchFromFirebase(true);
      if (isMounted.current) dispatch({ type: "DONE" });
    } catch {
      if (isMounted.current)
        dispatch({ type: "ERROR", msg: "Failed to load more." });
    }
  }, []);

  // ── Hard refresh ─────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    store.clearAll();
    dispatch({ type: "LOADING" });
    try {
      await fetchFromFirebase(false);
      if (isMounted.current) dispatch({ type: "DONE" });
    } catch {
      if (isMounted.current)
        dispatch({ type: "ERROR", msg: "Refresh failed." });
    }
  }, []);

  // ── Archive (optimistic) ─────────────────────────────────────────────────
  const archiveMessage = useCallback(async (message) => {
    const prev = message.status;
    store.patchMessage(message.id, { status: "archived" });
    dispatch({ type: "ACTION_START" });
    try {
      await updateDoc(doc(db, "contactMessages", message.id), {
        status: "archived",
      });
    } catch {
      store.patchMessage(message.id, { status: prev }); // rollback
      alert("Archive failed — changes reverted.");
    } finally {
      if (isMounted.current) dispatch({ type: "ACTION_END" });
    }
  }, []);

  // ── Mark as read (optimistic) ─────────────────────────────────────────────
  const markAsRead = useCallback(async (message) => {
    if (message.read) return;
    store.patchMessage(message.id, { read: true });
    try {
      await updateDoc(doc(db, "contactMessages", message.id), { read: true });
    } catch {
      store.patchMessage(message.id, { read: false });
    }
  }, []);

  // ── Delete (optimistic) ──────────────────────────────────────────────────
  const deleteMessage = useCallback(async (message) => {
    if (!window.confirm("Permanently delete this message?")) return false;
    store.removeMessage(message.id);
    dispatch({ type: "ACTION_START" });
    try {
      await deleteDoc(doc(db, "contactMessages", message.id));
      return true;
    } catch {
      // Rollback: re-insert at original position is complex, so refetch
      store.clearAll();
      fetchFromFirebase(false);
      alert("Delete failed — inbox refreshed.");
      return false;
    } finally {
      if (isMounted.current) dispatch({ type: "ACTION_END" });
    }
  }, []);

  return {
    messages: store.messages,
    hasMore: store.hasMore,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    actionLoading: state.actionLoading,
    unreadCount: store.messages.filter((m) => !m.read).length,
    loadMore,
    refresh,
    archiveMessage,
    markAsRead,
    deleteMessage,
  };
}
