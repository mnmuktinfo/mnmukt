import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";

import { auth, db } from "../../../../config/firebaseAuth";
import {
  updateProfileData,
  saveAddress as saveAddressService,
  getDefaultAddress,
} from "../services/authService";

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  reload,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ════════════════════════════════════════════════════════════
   ERROR HANDLER
════════════════════════════════════════════════════════════ */

const ERROR_MAP = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "Invalid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-blocked": "Your account has been blocked.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/too-many-requests": "Too many attempts. Please try later.",
  "auth/popup-closed-by-user": "Login cancelled.",
  "auth/account-exists-with-different-credential":
    "Account exists with a different login method.",
};

const formatError = (code) => ERROR_MAP[code] ?? "Something went wrong.";

const handleError = (dispatch, err) => {
  console.error("AUTH ERROR:", err);
  const msg = formatError(err.code);
  dispatch({ type: "SET_ERROR", error: msg });
  throw new Error(msg);
};

/* ════════════════════════════════════════════════════════════
   LOCAL STORAGE CACHE
════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "mnmukt_user_cache";

const readCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCache = ({ user, address }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, address }));
  } catch (e) {
    console.warn("Cache write failed", e);
  }
};

const clearCache = () => localStorage.removeItem(STORAGE_KEY);

/* ════════════════════════════════════════════════════════════
   REDUCER
════════════════════════════════════════════════════════════ */

const INITIAL_STATE = {
  user: null,
  address: null,
  isLoggedIn: false,
  authLoading: true,
  actionLoading: false,
  error: null,
};

const reducer = (state, action) => {
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
    case "ACTION_START":
      return { ...state, actionLoading: true, error: null };
    case "ACTION_END":
      return { ...state, actionLoading: false };
    case "SET_ERROR":
      return { ...state, error: action.error, actionLoading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */

const buildUserObj = (firebaseUser, firestoreData = {}) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? "",
  emailVerified: firebaseUser.emailVerified ?? false,
  provider: firestoreData.provider ?? "email",
  name: firestoreData.name || firebaseUser.displayName || "",
  phone: firestoreData.phone ?? "",
  gender: firestoreData.gender ?? "",
  dateOfBirth: firestoreData.dateOfBirth ?? "",
  avatarUrl: firestoreData.avatarUrl || firebaseUser.photoURL || "",
  role: firestoreData.role ?? "user",
  isBlocked: firestoreData.isBlocked ?? false,
  defaultAddressId: firestoreData.defaultAddressId ?? null,
  notificationsEnabled: firestoreData.notificationsEnabled ?? true,
  marketingEmails: firestoreData.marketingEmails ?? false,
  createdAt:
    firestoreData.createdAt?.toDate?.()?.toISOString?.() ??
    firestoreData.createdAt ??
    null,
  updatedAt:
    firestoreData.updatedAt?.toDate?.()?.toISOString?.() ??
    firestoreData.updatedAt ??
    null,
});

const detectProvider = (firebaseUser) => {
  const raw = firebaseUser.providerData?.[0]?.providerId ?? "password";
  if (raw.includes("google")) return "google";
  if (raw.includes("facebook")) return "facebook";
  return "email";
};

const ensureUserDoc = async (firebaseUser, providerId = "email") => {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    if (data.isBlocked) {
      await signOut(auth);
      const err = new Error("Account blocked");
      err.code = "auth/user-blocked";
      throw err;
    }

    if (providerId !== "email") {
      await updateDoc(ref, {
        name: firebaseUser.displayName || data.name,
        avatarUrl: firebaseUser.photoURL || data.avatarUrl || "",
        emailVerified: firebaseUser.emailVerified,
        updatedAt: serverTimestamp(),
      });
      return {
        ...data,
        name: firebaseUser.displayName || data.name,
        avatarUrl: firebaseUser.photoURL || data.avatarUrl || "",
        emailVerified: firebaseUser.emailVerified,
      };
    }

    return data;
  }

  const newUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    emailVerified: firebaseUser.emailVerified ?? false,
    provider: providerId,
    role: "user",
    name: firebaseUser.displayName ?? "",
    phone: firebaseUser.phoneNumber ?? "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: firebaseUser.photoURL ?? "",
    isBlocked: false,
    defaultAddressId: null,
    notificationsEnabled: true,
    marketingEmails: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, newUser);
  return newUser;
};

/* ════════════════════════════════════════════════════════════
   CONTEXT
════════════════════════════════════════════════════════════ */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const cached = readCache();

  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    user: cached?.user ?? null,
    address: cached?.address ?? null,
    isLoggedIn: !!cached?.user,
    authLoading: !cached,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch({ type: "AUTH_CLEAR" });
        clearCache();
        return;
      }

      try {
        await reload(firebaseUser);
        const providerId = detectProvider(firebaseUser);
        const data = await ensureUserDoc(firebaseUser, providerId);
        const userObj = buildUserObj(firebaseUser, data);

        const address = await getDefaultAddress(firebaseUser.uid);

        dispatch({
          type: "AUTH_SUCCESS",
          user: userObj,
          address,
        });

        writeCache({ user: userObj, address });
      } catch (err) {
        console.error("Auth listener error:", err);
        dispatch({ type: "AUTH_CLEAR" });
        clearCache();
      }
    });

    return () => unsub();
  }, []);

  /* ════════════════════════════════════════════════════════════
     AUTH ACTIONS
  ════════════════════════════════════════════════════════════ */

  const signupUser = useCallback(
    async ({
      email,
      password,
      name,
      phone = "",
      gender = "",
      dateOfBirth = "",
    }) => {
      dispatch({ type: "ACTION_START" });
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = cred.user;

        await updateProfile(user, { displayName: name });
        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email,
          emailVerified: false,
          provider: "email",
          role: "user",
          name,
          phone,
          gender,
          dateOfBirth,
          avatarUrl: "",
          isBlocked: false,
          defaultAddressId: null,
          notificationsEnabled: true,
          marketingEmails: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        dispatch({ type: "ACTION_END" });
      } catch (err) {
        handleError(dispatch, err);
      }
    },
    [],
  );

  const loginUser = useCallback(async (email, password) => {
    dispatch({ type: "ACTION_START" });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      handleError(dispatch, err);
    }
  }, []);

  const startSocialLogin = useCallback(async (provider) => {
    dispatch({ type: "ACTION_START" });
    try {
      const result = await signInWithPopup(auth, provider);
      const providerId = detectProvider(result.user);
      await ensureUserDoc(result.user, providerId);
    } catch (err) {
      handleError(dispatch, err);
    }
  }, []);

  const googleLogin = useCallback(
    () => startSocialLogin(new GoogleAuthProvider()),
    [startSocialLogin],
  );
  const facebookLogin = useCallback(() => {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    return startSocialLogin(provider);
  }, [startSocialLogin]);

  const logout = useCallback(async () => {
    await signOut(auth);
    dispatch({ type: "AUTH_CLEAR" });
    clearCache();
  }, []);

  /* ════════════════════════════════════════════════════════════
     PROFILE + EMAIL VERIFICATION
  ════════════════════════════════════════════════════════════ */

  const checkEmailVerification = useCallback(async () => {
    dispatch({ type: "ACTION_START" });
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return false;

      await reload(firebaseUser);
      if (!firebaseUser.emailVerified) return false;

      await updateDoc(doc(db, "users", firebaseUser.uid), {
        emailVerified: true,
        updatedAt: serverTimestamp(),
      });

      const userObj = { ...state.user, emailVerified: true };
      dispatch({ type: "AUTH_SUCCESS", user: userObj });
      writeCache({ user: userObj, address: state.address });
      return true;
    } catch (err) {
      handleError(dispatch, err);
      return false;
    } finally {
      dispatch({ type: "ACTION_END" });
    }
  }, [state.user, state.address]);

  const updateUserProfile = useCallback(
    async (updates) => {
      dispatch({ type: "ACTION_START" });
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser)
          throw Object.assign(new Error(), { code: "auth/user-not-found" });

        const docUpdates = { updatedAt: serverTimestamp(), ...updates };
        await updateDoc(doc(db, "users", firebaseUser.uid), docUpdates);

        if (updates.name !== undefined)
          await updateProfile(firebaseUser, { displayName: updates.name });

        const userObj = {
          ...state.user,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: "AUTH_SUCCESS", user: userObj });
        writeCache({ user: userObj, address: state.address });
      } catch (err) {
        handleError(dispatch, err);
      } finally {
        dispatch({ type: "ACTION_END" });
      }
    },
    [state.user, state.address],
  );

  const updateUserAndSync = useCallback(
    async (updates) => {
      dispatch({ type: "ACTION_START" });
      try {
        const uid = state.user?.uid;
        if (!uid) throw new Error("User not found");

        const updated = await updateProfileData(uid, updates);
        const newUser = { ...state.user, ...updated };

        dispatch({
          type: "AUTH_SUCCESS",
          user: newUser,
          address: state.address,
        });
        writeCache({ user: newUser, address: state.address });
        return newUser;
      } catch (err) {
        handleError(dispatch, err);
      } finally {
        dispatch({ type: "ACTION_END" });
      }
    },
    [state.user, state.address],
  );

  /* ════════════════════════════════════════════════════════════
     ADDRESS
  ════════════════════════════════════════════════════════════ */

  const saveAddress = useCallback(
    async (address) => {
      dispatch({ type: "ACTION_START" });
      try {
        const uid = state.user?.uid;
        if (!uid) throw new Error("User not found");

        const saved = await saveAddressService(uid, address);
        let newAddress = state.address;

        if (saved.isDefault) {
          newAddress = saved;
          await updateProfileData(uid, { defaultAddressId: saved.id });
        }

        dispatch({
          type: "AUTH_SUCCESS",
          user: state.user,
          address: newAddress,
        });
        writeCache({ user: state.user, address: newAddress });
        return saved;
      } catch (err) {
        handleError(dispatch, err);
      } finally {
        dispatch({ type: "ACTION_END" });
      }
    },
    [state.user, state.address],
  );

  /* ════════════════════════════════════════════════════════════
     PASSWORD
  ════════════════════════════════════════════════════════════ */

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      handleError(dispatch, err);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    dispatch({ type: "ACTION_START" });
    try {
      const user = auth.currentUser;
      if (!user)
        throw Object.assign(new Error(), { code: "auth/user-not-found" });

      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
    } catch (err) {
      handleError(dispatch, err);
    } finally {
      dispatch({ type: "ACTION_END" });
    }
  }, []);

  /* ════════════════════════════════════════════════════════════
     CLEAR ERROR
  ════════════════════════════════════════════════════════════ */

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signupUser,
        loginUser,
        googleLogin,
        facebookLogin,
        logout,
        updateUserProfile,
        checkEmailVerification,
        updateUserAndSync,
        saveAddress,
        resetPassword,
        changePassword,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ════════════════════════════════════════════════════════════
   HOOK
════════════════════════════════════════════════════════════ */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
