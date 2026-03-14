// AdminAuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AdminAuthContext = createContext();

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = "mnmukt_registry_token";
const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour — only 1 Firestore read per session

// ── Helpers ────────────────────────────────────────────────
const readCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  // Strip Firestore Timestamps before storing — they don't serialize cleanly
  const safe = { ...data };
  ["createdAt", "updatedAt"].forEach((k) => {
    if (safe[k]?.seconds)
      safe[k] = new Date(safe[k].seconds * 1000).toISOString();
  });
  safe.syncedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  return safe;
};

const isCacheStale = (cached) => {
  if (!cached?.syncedAt) return true;
  return Date.now() - new Date(cached.syncedAt).getTime() > REVALIDATE_MS;
};

// ── Provider ───────────────────────────────────────────────
export const AdminAuthProvider = ({ children }) => {
  // Bootstrap from cache instantly — no flicker, no loading screen on refresh
  const cached = readCache();
  const [admin, setAdmin] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached); // if cache exists → skip loading
  const [isAuthorized, setIsAuthorized] = useState(!!cached);

  // Guard: prevent double Firestore calls if Firebase re-emits the same user
  const lastVerifiedUid = useRef(cached?.uid ?? null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // User signed out on another tab, or session expired
        clearSession();
        setLoading(false);
        return;
      }

      const currentCache = readCache();

      // ── CASE 1: Cache is fresh + same user → skip Firestore read entirely ──
      if (
        currentCache &&
        currentCache.uid === firebaseUser.uid &&
        !isCacheStale(currentCache) &&
        lastVerifiedUid.current === firebaseUser.uid
      ) {
        // Already authorized from cache — nothing to do
        setLoading(false);
        return;
      }

      // ── CASE 2: No cache, stale cache, or different user → verify with Firestore ──
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (!snap.exists() || !snap.data().isAdmin || snap.data().isBlocked) {
          // Not an admin (or blocked) — force sign out and clear everything
          await signOut(auth);
          clearSession();
          setLoading(false);
          return;
        }

        const freshData = writeCache({ uid: firebaseUser.uid, ...snap.data() });
        lastVerifiedUid.current = firebaseUser.uid;
        setAdmin(freshData);
        setIsAuthorized(true);
      } catch (err) {
        console.error("Admin verification failed:", err);
        // Network error: keep existing cache rather than logging out
        // (avoids unnecessary logout on flaky connections)
        if (!currentCache) clearSession();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []); // runs once on mount

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    lastVerifiedUid.current = null;
    setAdmin(null);
    setIsAuthorized(false);
  };

  const logout = async () => {
    await signOut(auth); // triggers onAuthStateChanged → clearSession
  };

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthorized, loading, logout }}>
      {/* Show children once we know auth state — cache makes this instant on refresh */}
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
