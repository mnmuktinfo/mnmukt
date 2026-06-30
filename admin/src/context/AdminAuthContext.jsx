import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { auth, db } from "../config/firebaseauth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const AdminAuthContext = createContext();

// ── Constants ──
const STORAGE_KEY = "mnmukt_admin_session";
const SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours
const CACHE_REVALIDATE_MS = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ── Rate Limiting ──
class RateLimiter {
  constructor(maxAttempts, lockoutDuration) {
    this.maxAttempts = maxAttempts;
    this.lockoutDuration = lockoutDuration;
    this.attempts = [];
    this.isLocked = false;
  }

  recordAttempt() {
    const now = Date.now();
    this.attempts = this.attempts.filter((t) => now - t < this.lockoutDuration);

    if (this.attempts.length >= this.maxAttempts) {
      this.isLocked = true;
      setTimeout(() => {
        this.isLocked = false;
        this.attempts = [];
      }, this.lockoutDuration);
      return false;
    }

    this.attempts.push(now);
    return true;
  }

  reset() {
    this.attempts = [];
    this.isLocked = false;
  }

  getRemainingLockoutTime() {
    if (!this.isLocked) return 0;
    if (this.attempts.length === 0) return 0;
    const oldestAttempt = Math.min(...this.attempts);
    const remaining = this.lockoutDuration - (Date.now() - oldestAttempt);
    return Math.max(0, remaining);
  }
}

// ── Cache Management ──
const SessionCache = {
  set(data) {
    try {
      const safe = { ...data };
      // Convert Firebase timestamps to ISO strings
      ["createdAt", "updatedAt"].forEach((key) => {
        if (safe[key]?.seconds) {
          safe[key] = new Date(safe[key].seconds * 1000).toISOString();
        }
      });
      safe.cachedAt = new Date().toISOString();
      safe.expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      return safe;
    } catch (err) {
      console.error("Cache write error:", err);
      return null;
    }
  },

  get() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      // Check expiration
      if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
        this.clear();
        return null;
      }
      return cached;
    } catch (err) {
      console.error("Cache read error:", err);
      return null;
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Cache clear error:", err);
    }
  },

  isStale() {
    const cached = this.get();
    if (!cached?.cachedAt) return true;
    const age = Date.now() - new Date(cached.cachedAt).getTime();
    return age > CACHE_REVALIDATE_MS;
  },
};

// ── Provider ──
export const AdminAuthProvider = ({ children }) => {
  const cached = SessionCache.get();

  const [admin, setAdmin] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [isAuthorized, setIsAuthorized] = useState(!!cached);
  const [error, setError] = useState("");
  const [sessionExpiring, setSessionExpiring] = useState(false);

  const authStateRef = useRef({ uid: cached?.uid ?? null });
  const rateLimiter = useRef(
    new RateLimiter(MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS),
  );
  const sessionTimerRef = useRef(null);
  const verificationAbortRef = useRef(null);
  const isRegisteringRef = useRef(false);

  // ── Session timeout management ──
  const startSessionTimer = useCallback((uid) => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);

    // Warn 5 minutes before expiry
    const warningTime = SESSION_TIMEOUT_MS - 5 * 60 * 1000;

    sessionTimerRef.current = setTimeout(() => {
      setSessionExpiring(true);

      setTimeout(
        async () => {
          if (authStateRef.current.uid === uid) {
            await logout();
          }
        },
        5 * 60 * 1000,
      );
    }, warningTime);
  }, []);

  const clearSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  // ── Verify admin status from Firestore ──
  const verifyAdminStatus = useCallback(async (firebaseUser, signal) => {
    try {
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (signal?.aborted) return null;

      if (!snap.exists()) {
        throw new Error("User record not found");
      }

      const userData = snap.data();

      if (!userData.isAdmin) {
        throw new Error("Unauthorized: Admin privileges required");
      }

      if (userData.isBlocked) {
        throw new Error("Account has been blocked");
      }

      return userData;
    } catch (err) {
      throw err;
    }
  }, []);

  // ── Observer for auth state changes ──
  useEffect(() => {
    // Set persistence first
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Persistence error:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isRegisteringRef.current) {
        // Skip verification during registration to avoid race conditions
        return;
      }

      if (!firebaseUser) {
        clearSession();
        setLoading(false);
        return;
      }

      // Check if already verified in this session
      const currentCache = SessionCache.get();
      if (
        currentCache?.uid === firebaseUser.uid &&
        !SessionCache.isStale() &&
        authStateRef.current.uid === firebaseUser.uid
      ) {
        setLoading(false);
        return;
      }

      // Create abort controller for verification
      const controller = new AbortController();
      verificationAbortRef.current = controller;

      try {
        const userData = await verifyAdminStatus(
          firebaseUser,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          const freshData = SessionCache.set({
            uid: firebaseUser.uid,
            ...userData,
          });
          authStateRef.current.uid = firebaseUser.uid;
          setAdmin(freshData);
          setIsAuthorized(true);
          setError("");
          startSessionTimer(firebaseUser.uid);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Admin verification failed:", err);
          await signOut(auth);
          clearSession();
          setError(err.message || "Verification failed");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribe();
      verificationAbortRef.current?.abort();
      clearSessionTimer();
    };
  }, [verifyAdminStatus, startSessionTimer, clearSessionTimer]);

  const clearSession = useCallback(() => {
    SessionCache.clear();
    authStateRef.current.uid = null;
    setAdmin(null);
    setIsAuthorized(false);
    setSessionExpiring(false);
    clearSessionTimer();
    rateLimiter.current.reset();
  }, [clearSessionTimer]);

  // ── Admin login ──
  const login = useCallback(
    async (email, password) => {
      // Check rate limiting
      if (!rateLimiter.current.recordAttempt()) {
        const remainingMs = rateLimiter.current.getRemainingLockoutTime();
        const minutes = Math.ceil(remainingMs / 60000);
        throw new Error(
          `Too many login attempts. Please try again in ${minutes} minute${
            minutes > 1 ? "s" : ""
          }.`,
        );
      }

      setLoading(true);
      setError("");

      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userData = await verifyAdminStatus(cred.user, null);

        const data = SessionCache.set({
          uid: cred.user.uid,
          ...userData,
        });

        authStateRef.current.uid = cred.user.uid;
        setAdmin(data);
        setIsAuthorized(true);
        rateLimiter.current.reset();
        startSessionTimer(cred.user.uid);

        return { success: true };
      } catch (err) {
        const errorMsg =
          err.code === "auth/user-not-found"
            ? "No account found with this email"
            : err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
              ? "Incorrect email or password"
              : err.code === "auth/too-many-requests"
                ? "Too many failed attempts. Please try again later."
                : err.message || "Login failed";

        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [verifyAdminStatus, startSessionTimer],
  );

  // ── Admin register ──
  const register = useCallback(
    async (email, password, name) => {
      if (!rateLimiter.current.recordAttempt()) {
        throw new Error("Too many attempts. Please try again later.");
      }

      setLoading(true);
      setError("");
      isRegisteringRef.current = true;

      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        // Update Firebase Auth profile
        await updateProfile(cred.user, { displayName: name });

        // Create Firestore admin record
        const adminData = {
          uid: cred.user.uid,
          name: name.trim(),
          email: email.toLowerCase(),
          isAdmin: true,
          isBlocked: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };

        await setDoc(doc(db, "users", cred.user.uid), adminData);

        // Don't auto-login, require manual login
        await signOut(auth);
        clearSession();
        setError(""); // Clear error for success state
        rateLimiter.current.reset();

        return { success: true };
      } catch (err) {
        const errorMsg =
          err.code === "auth/email-already-in-use"
            ? "Email already registered"
            : err.code === "auth/weak-password"
              ? "Password is too weak"
              : err.message || "Registration failed";

        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        isRegisteringRef.current = false;
        setLoading(false);
      }
    },
    [clearSession],
  );

  // ── Admin logout ──
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      clearSession();
    } catch (err) {
      console.error("Logout error:", err);
      clearSession();
    }
  }, [clearSession]);

  // ── Extend session (on user action) ──
  const extendSession = useCallback(
    (uid) => {
      if (authStateRef.current.uid === uid) {
        startSessionTimer(uid);
        setSessionExpiring(false);
      }
    },
    [startSessionTimer],
  );

  const value = {
    admin,
    isAuthorized,
    loading,
    error,
    sessionExpiring,
    login,
    register,
    logout,
    extendSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
