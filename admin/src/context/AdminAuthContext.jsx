import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { auth, db } from "../config/firebaseauth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AdminAuthContext = createContext();

// ── Constants ──
const STORAGE_KEY = "mnmukt_admin_token";
const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour

// ── Cache helpers ──
const readCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
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

// ── Provider ──
export const AdminAuthProvider = ({ children }) => {
  const cached = readCache();
  const [admin, setAdmin] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [isAuthorized, setIsAuthorized] = useState(!!cached);

  const lastVerifiedUid = useRef(cached?.uid ?? null);

  // ── Observe auth state ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearSession();
        setLoading(false);
        return;
      }

      const currentCache = readCache();

      if (
        currentCache &&
        currentCache.uid === firebaseUser.uid &&
        !isCacheStale(currentCache) &&
        lastVerifiedUid.current === firebaseUser.uid
      ) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (!snap.exists() || !snap.data().isAdmin || snap.data().isBlocked) {
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
        if (!currentCache) clearSession();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    lastVerifiedUid.current = null;
    setAdmin(null);
    setIsAuthorized(false);
  };

  // ── Admin login ──
  const login = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));

      if (!snap.exists() || !snap.data().isAdmin || snap.data().isBlocked) {
        await signOut(auth);
        clearSession();
        throw new Error("Unauthorized access. Only admins allowed.");
      }

      const data = writeCache({ uid: cred.user.uid, ...snap.data() });
      setAdmin(data);
      setIsAuthorized(true);
      lastVerifiedUid.current = cred.user.uid;
    } finally {
      setLoading(false);
    }
  };

  // ── Admin register ──
  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // Create Firestore admin entry
      const adminData = {
        uid: cred.user.uid,
        name,
        email,
        isAdmin: true,
        isBlocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), adminData);

      const data = writeCache({ uid: cred.user.uid, ...adminData });
      setAdmin(data);
      setIsAuthorized(true);
      lastVerifiedUid.current = cred.user.uid;
    } finally {
      setLoading(false);
    }
  };

  // ── Admin logout ──
  const logout = async () => {
    await signOut(auth);
    clearSession();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthorized,
        loading,
        login,
        register,
        logout,
      }}>
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
