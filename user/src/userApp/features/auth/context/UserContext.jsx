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
const SAFE_CACHE_FIELDS = ["uid", "name", "email", "defaultAddressId"];
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 300;

/* ════════════════════════════════════════════════════════════
   UTILITIES  (outside component — stable references)
════════════════════════════════════════════════════════════ */

/** Exponential back-off retry for any async fn */
const withRetry = async (fn, retries = MAX_RETRIES, label = "op") => {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) =>
          setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt)),
        );
      }
    }
  }
  console.error(
    `[AuthContext] ${label} failed after ${retries + 1} attempts`,
    lastErr,
  );
  throw lastErr;
};

/** Firebase error code → human message */
const authErrorMessage = (code) => {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-email": "Invalid email address.",
    "auth/email-already-in-use": "This email is already in use.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/requires-recent-login":
      "Please log out and log in again to continue.",
  };
  return map[code] ?? "An unexpected error occurred. Please try again.";
};

/** Pick only safe fields for localStorage */
const toSafeCache = (user) =>
  user
    ? Object.fromEntries(
        SAFE_CACHE_FIELDS.filter((k) => user[k] !== undefined).map((k) => [
          k,
          user[k],
        ]),
      )
    : null;

/** Firestore Timestamp → ISO string */
const toISO = (v) => {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return v;
};

// ✅ FIX 4: cache helpers outside component — stable, no re-creation on render
const _setLocalCache = (user, address) => {
  try {
    localStorage.setItem("auth_cache", JSON.stringify(toSafeCache(user)));
    if (address) {
      // ✅ FIX 5: store full address so checkout can read line1, line2 etc.
      localStorage.setItem("addr_cache", JSON.stringify(address));
    } else {
      localStorage.removeItem("addr_cache");
    }
  } catch {
    /* quota exceeded or private browsing — silent */
  }
};

const _clearLocalCache = () => {
  try {
    localStorage.removeItem("auth_cache");
    localStorage.removeItem("addr_cache");
    localStorage.removeItem("auth_uid");
  } catch {
    /* ignore */
  }
};

/* ════════════════════════════════════════════════════════════
   REDUCER
════════════════════════════════════════════════════════════ */
const INITIAL_STATE = {
  user: null,
  address: null,
  isLoggedIn: false,
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
        actionLoading: false, // clear any stale loading
        error: null,
      };
    case "AUTH_CLEAR":
      return {
        ...INITIAL_STATE,
        authLoading: false,
        actionLoading: false, // ✅ FIX Minor: reset on clear too
      };
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
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
  const aliveRef = useRef(true);

  /* ── Firebase auth listener ──────────────────────────────── */
  useEffect(() => {
    aliveRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (aliveRef.current) {
          dispatch({ type: "AUTH_CLEAR" });
          _clearLocalCache();
        }
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        // ✅ FIX 1: fetch user doc directly — no pointless single-item Promise.all
        const userSnap = await withRetry(
          () => getDoc(userRef),
          MAX_RETRIES,
          "onAuthStateChanged:getDoc",
        );

        if (!userSnap.exists()) {
          if (aliveRef.current) {
            dispatch({ type: "AUTH_CLEAR" });
            _clearLocalCache();
          }
          return;
        }

        const userData = userSnap.data();

        // ✅ FIX 3: block check in auth listener — blocked users never get through
        if (userData.isBlocked) {
          await signOut(auth);
          if (aliveRef.current) {
            dispatch({ type: "AUTH_CLEAR" });
            _clearLocalCache();
          }
          console.warn(
            "[AuthContext] Blocked user attempted login:",
            firebaseUser.uid,
          );
          return;
        }

        const finalUser = {
          uid: firebaseUser.uid,
          role: userData.role || "user",
          provider: userData.provider || "email",
          name: userData.name || "",
          email: userData.email || firebaseUser.email || "",
          phone: userData.phone || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth || "",
          defaultAddressId: userData.defaultAddressId || null,
          emailVerified: firebaseUser.emailVerified,
          isBlocked: false,
          createdAt: toISO(userData.createdAt),
          updatedAt: toISO(userData.updatedAt),
        };

        // ✅ FIX 1: fetch address in true parallel with nothing else blocking it
        let address = null;
        if (userData.defaultAddressId) {
          try {
            const addrSnap = await withRetry(
              () =>
                getDoc(
                  doc(
                    db,
                    "users",
                    firebaseUser.uid,
                    "addresses",
                    userData.defaultAddressId,
                  ),
                ),
              MAX_RETRIES,
              "onAuthStateChanged:getAddress",
            );
            if (addrSnap.exists())
              address = { id: addrSnap.id, ...addrSnap.data() };
          } catch (addrErr) {
            // Non-fatal — address missing shouldn't block login
            console.warn(
              "[AuthContext] Address fetch failed (non-fatal):",
              addrErr.message,
            );
          }
        }

        if (!aliveRef.current) return;

        dispatch({ type: "AUTH_SUCCESS", user: finalUser, address });
        _setLocalCache(finalUser, address);
      } catch (err) {
        console.error("[AuthContext] Auth sync failed:", err);
        if (aliveRef.current) {
          dispatch({ type: "AUTH_CLEAR" });
          _clearLocalCache();
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
          // CREATE new address
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
          // UPDATE existing address (merge: true is safe even if doc is missing)
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

        const savedAddress = { id: finalId, ...dataToSave };
        dispatch({ type: "SET_ADDRESS", address: savedAddress });
        dispatch({ type: "ACTION_END" });
        _setLocalCache(state.user, savedAddress);
        return savedAddress;
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

      // ✅ FIX 2: snapshot BEFORE optimistic patch so we can roll back correctly
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
        // ✅ FIX 2: roll back to snapshot, not broken re-spread
        dispatch({ type: "PATCH_USER", updates: snapshot });
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
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
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
      _clearLocalCache();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err.message });
      throw err;
    }
  }, []);

  /* ── Manual address override (checkout address picker) ───── */
  const updateAddressCache = useCallback(
    (newAddress) => {
      dispatch({ type: "SET_ADDRESS", address: newAddress });
      _setLocalCache(state.user, newAddress);
    },
    [state.user],
  );

  /* ── Clear error after toast ─────────────────────────────── */
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  /* ── Context value ───────────────────────────────────────── */
  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ════════════════════════════════════════════════════════════
   HOOK
════════════════════════════════════════════════════════════ */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
