import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from "react";
import { auth, db } from "../../../../config/firebase";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const STORAGE_KEY = "mnmukt_user_cache";
const ADDR_KEY = "mnmukt_user_cache";
const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour — max 1 Firestore read/session
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 300;

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
const withRetry = async (fn, retries = MAX_RETRIES, label = "op") => {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries)
        await new Promise((r) => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
    }
  }
  console.error(
    `[AuthContext] ${label} failed after ${retries + 1} attempts`,
    lastErr,
  );
  throw lastErr;
};

const authErrorMessage = (code) =>
  ({
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Invalid email address.",
    "auth/email-already-in-use": "This email is already in use.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/requires-recent-login":
      "Please log out and log in again to continue.",
  })[code] ?? "An unexpected error occurred. Please try again.";

const toISO = (v) => {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return v;
};

// ── Cache helpers ──────────────────────────────────────────
const readUserCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readAddrCache = () => {
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (user, address) => {
  try {
    if (!user) return;
    // Strip Firestore Timestamps — they don't serialize
    const safe = { ...user };
    ["createdAt", "updatedAt"].forEach((k) => {
      if (safe[k]?.seconds)
        safe[k] = new Date(safe[k].seconds * 1000).toISOString();
    });
    safe.syncedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    if (address) localStorage.setItem(ADDR_KEY, JSON.stringify(address));
    else localStorage.removeItem(ADDR_KEY);
  } catch {
    /* quota exceeded / private browsing — silent */
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ADDR_KEY);
  } catch {
    /* ignore */
  }
};

const isCacheStale = (cached) => {
  if (!cached?.syncedAt) return true;
  return Date.now() - new Date(cached.syncedAt).getTime() > REVALIDATE_MS;
};

/* ════════════════════════════════════════════════════════════
   REDUCER
════════════════════════════════════════════════════════════ */
const INITIAL_STATE = {
  user: null,
  address: null,
  isLoggedIn: false,
  // ✅ KEY: 3 distinct loading states
  authLoading: true, // true until Firebase confirms state
  actionLoading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.user,
        address: action.address ?? state.address,
        isLoggedIn: true,
        authLoading: false,
        actionLoading: false,
        error: null,
      };
    case "AUTH_CLEAR":
      return { ...INITIAL_STATE, authLoading: false };
    case "SET_ADDRESS":
      return { ...state, address: action.address };
    case "PATCH_USER":
      return { ...state, user: { ...state.user, ...action.updates } };
    case "ACTION_START":
      return { ...state, actionLoading: true, error: null };
    case "ACTION_END":
      return { ...state, actionLoading: false };
    case "SET_ERROR":
      return { ...state, error: action.error, actionLoading: false };
    default:
      return state;
  }
};

/* ════════════════════════════════════════════════════════════
   CONTEXT + PROVIDER
════════════════════════════════════════════════════════════ */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ Bootstrap instantly from cache — no loading flicker on refresh
  const cachedUser = readUserCache();
  const cachedAddr = readAddrCache();

  const [state, dispatch] = useReducer(authReducer, {
    ...INITIAL_STATE,
    // Pre-fill from cache only if user was verified (unverified users are never cached)
    user: cachedUser?.emailVerified ? cachedUser : null,
    address: cachedUser?.emailVerified ? cachedAddr : null,
    isLoggedIn: !!cachedUser?.emailVerified,
    authLoading: true, // still true — Firebase must confirm before we trust cache fully
  });

  const lastVerifiedUid = useRef(cachedUser?.uid ?? null);
  const aliveRef = useRef(true);

  /* ── Firebase auth listener ──────────────────────────────── */
  useEffect(() => {
    aliveRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ── CASE 1: No Firebase session ──────────────────────────
      if (!firebaseUser) {
        if (aliveRef.current) {
          dispatch({ type: "AUTH_CLEAR" });
          clearCache();
        }
        return;
      }

      // ── CASE 2: Email NOT verified ────────────────────────────
      // Do NOT read Firestore. Do NOT cache. Show "verify email" state only.
      if (!firebaseUser.emailVerified) {
        if (aliveRef.current) {
          dispatch({
            type: "AUTH_SUCCESS",
            // Minimal user object — just enough to show "please verify" UI
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "",
              emailVerified: false,
              role: "unverified",
            },
            address: null,
          });
        }
        // ✅ No Firestore read — unverified users cost nothing
        return;
      }

      // ── CASE 3: Verified — check cache freshness ──────────────
      const cached = readUserCache();
      if (
        cached?.emailVerified &&
        cached.uid === firebaseUser.uid &&
        !isCacheStale(cached) &&
        lastVerifiedUid.current === firebaseUser.uid
      ) {
        // Cache is fresh and same user — skip Firestore read entirely
        if (aliveRef.current) {
          dispatch({
            type: "AUTH_SUCCESS",
            user: cached,
            address: readAddrCache(),
          });
          dispatch({ type: "ACTION_END" }); // ensure authLoading clears
        }
        return;
      }

      // ── CASE 4: Verified + stale/missing cache → Firestore read ──
      try {
        const userSnap = await withRetry(
          () => getDoc(doc(db, "users", firebaseUser.uid)),
          MAX_RETRIES,
          "authListener:getUser",
        );

        if (!userSnap.exists()) {
          if (aliveRef.current) {
            dispatch({ type: "AUTH_CLEAR" });
            clearCache();
          }
          return;
        }

        const data = userSnap.data();
        if (data.isBlocked) {
          await signOut(auth);
          if (aliveRef.current) {
            dispatch({ type: "AUTH_CLEAR" });
            clearCache();
          }
          return;
        }

        // ✅ Sync emailVerified to Firestore if it changed (e.g. user just clicked link)
        if (firebaseUser.emailVerified && !data.emailVerified) {
          await updateDoc(doc(db, "users", firebaseUser.uid), {
            emailVerified: true,
            updatedAt: serverTimestamp(),
          }).catch(() => {}); // non-fatal
        }

        const finalUser = {
          uid: firebaseUser.uid,
          role: data.role || "user",
          provider: data.provider || "email",
          name: data.name || "",
          email: data.email || firebaseUser.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          defaultAddressId: data.defaultAddressId || null,
          emailVerified: true, // guaranteed by CASE 3 check above
          isBlocked: false,
          createdAt: toISO(data.createdAt),
          updatedAt: toISO(data.updatedAt),
        };

        // Fetch address in parallel — non-fatal if missing
        let address = null;
        if (data.defaultAddressId) {
          try {
            const addrSnap = await withRetry(
              () =>
                getDoc(
                  doc(
                    db,
                    "users",
                    firebaseUser.uid,
                    "addresses",
                    data.defaultAddressId,
                  ),
                ),
              MAX_RETRIES,
              "authListener:getAddress",
            );
            if (addrSnap.exists())
              address = { id: addrSnap.id, ...addrSnap.data() };
          } catch (e) {
            console.warn(
              "[AuthContext] Address fetch failed (non-fatal):",
              e.message,
            );
          }
        }

        if (!aliveRef.current) return;

        lastVerifiedUid.current = firebaseUser.uid;
        dispatch({ type: "AUTH_SUCCESS", user: finalUser, address });
        writeCache(finalUser, address);
      } catch (err) {
        console.error("[AuthContext] Auth sync error:", err);
        if (aliveRef.current) {
          // Keep stale cache rather than logging out on network error
          if (!readUserCache()) {
            dispatch({ type: "AUTH_CLEAR" });
            clearCache();
          } else dispatch({ type: "ACTION_END" });
        }
      }
    });

    return () => {
      aliveRef.current = false;
      unsubscribe();
    };
  }, []);

  /* ── Save / update address ───────────────────────────────── */
  const saveAddress = useCallback(
    async (addressData) => {
      if (!state.user?.uid) throw new Error("Not authenticated");
      dispatch({ type: "ACTION_START" });
      try {
        const { id, ...dataToSave } = addressData;
        const payload = { ...dataToSave, updatedAt: serverTimestamp() };
        const existingId =
          id || state.address?.id || state.user.defaultAddressId;
        let finalId;

        if (!existingId) {
          const ref = await withRetry(
            () =>
              addDoc(collection(db, "users", state.user.uid, "addresses"), {
                ...payload,
                createdAt: serverTimestamp(),
              }),
            MAX_RETRIES,
            "saveAddress:create",
          );
          finalId = ref.id;
          await withRetry(
            () =>
              updateDoc(doc(db, "users", state.user.uid), {
                defaultAddressId: finalId,
                updatedAt: serverTimestamp(),
              }),
            MAX_RETRIES,
            "saveAddress:linkDefault",
          );
          dispatch({
            type: "PATCH_USER",
            updates: { defaultAddressId: finalId },
          });
        } else {
          finalId = existingId;
          await withRetry(
            () =>
              setDoc(
                doc(db, "users", state.user.uid, "addresses", finalId),
                payload,
                { merge: true },
              ),
            MAX_RETRIES,
            "saveAddress:update",
          );
        }

        const saved = { id: finalId, ...dataToSave };
        dispatch({ type: "SET_ADDRESS", address: saved });
        dispatch({ type: "ACTION_END" });
        writeCache(state.user, saved);
        return saved;
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err.message });
        throw err;
      }
    },
    [state.user, state.address],
  );

  /* ── Update profile (optimistic) ────────────────────────── */
  const updateUserAndSync = useCallback(
    async (updates) => {
      if (!state.user?.uid) throw new Error("Not authenticated");
      dispatch({ type: "ACTION_START" });
      const { address: _ignored, ...profileUpdates } = updates;
      const payload = Object.fromEntries(
        Object.entries(profileUpdates).filter(([, v]) => v !== undefined),
      );
      const snapshot = { ...state.user };
      dispatch({ type: "PATCH_USER", updates: payload });
      try {
        await withRetry(
          () =>
            updateDoc(doc(db, "users", state.user.uid), {
              ...payload,
              updatedAt: serverTimestamp(),
            }),
          MAX_RETRIES,
          "updateUserAndSync",
        );
        dispatch({ type: "ACTION_END" });
        return payload;
      } catch (err) {
        dispatch({ type: "PATCH_USER", updates: snapshot }); // rollback
        dispatch({ type: "SET_ERROR", error: err.message });
        throw err;
      }
    },
    [state.user],
  );

  /* ── Change password ─────────────────────────────────────── */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    dispatch({ type: "ACTION_START" });
    try {
      const cred = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      dispatch({ type: "ACTION_END" });
    } catch (err) {
      const msg = authErrorMessage(err.code);
      dispatch({ type: "SET_ERROR", error: msg });
      throw new Error(msg);
    }
  }, []);

  /* ── Reset password ──────────────────────────────────────── */
  const resetPassword = useCallback(async (email) => {
    if (!email?.trim()) throw new Error("Email is required");
    dispatch({ type: "ACTION_START" });
    try {
      await sendPasswordResetEmail(auth, email.trim());
      dispatch({ type: "ACTION_END" });
      return "Password reset email sent successfully.";
    } catch (err) {
      const msg = authErrorMessage(err.code);
      dispatch({ type: "SET_ERROR", error: msg });
      throw new Error(msg);
    }
  }, []);

  /* ── Logout ──────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    dispatch({ type: "ACTION_START" });
    try {
      await signOut(auth);
      dispatch({ type: "AUTH_CLEAR" });
      clearCache();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err.message });
      throw err;
    }
  }, []);

  /* ── Manual address override ─────────────────────────────── */
  const updateAddressCache = useCallback(
    (newAddress) => {
      dispatch({ type: "SET_ADDRESS", address: newAddress });
      writeCache(state.user, newAddress);
    },
    [state.user],
  );

  /* ── Clear error ─────────────────────────────────────────── */
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        address: state.address,
        isLoggedIn: state.isLoggedIn,
        authLoading: state.authLoading,
        actionLoading: state.actionLoading,
        error: state.error,
        logout,
        resetPassword,
        changePassword,
        saveAddress,
        updateUserAndSync,
        updateAddressCache,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
