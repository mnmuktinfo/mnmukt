import { auth, db } from "../../../../config/firebaseAuth";
import {
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
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

/* ════════════════════════════════════════════════════════════
   ERROR FORMATTER
════════════════════════════════════════════════════════════ */

const ERROR_MAP = {
  "auth/email-already-in-use"                    : "This email is already registered.",
  "auth/invalid-email"                           : "Invalid email address.",
  "auth/weak-password"                           : "Password must be at least 6 characters.",
  "auth/user-not-found"                          : "Incorrect email or password.",
  "auth/wrong-password"                          : "Incorrect email or password.",
  "auth/invalid-credential"                      : "Incorrect email or password.",
  "auth/network-request-failed"                  : "Network error. Check your connection.",
  "auth/user-blocked"                            : "Your account has been blocked.",
  "auth/popup-closed-by-user"                    : "Login cancelled.",
  "auth/too-many-requests"                       : "Too many attempts. Please try later.",
  "auth/account-exists-with-different-credential": "Account exists with a different login method.",
};

const formatError = (code) => ERROR_MAP[code] ?? "Something went wrong. Please try again.";

const handleError = (err) => {
  console.error("AUTH ERROR:", err);
  throw new Error(formatError(err.code));
};

/* ════════════════════════════════════════════════════════════
   INTERNAL HELPERS
════════════════════════════════════════════════════════════ */

/**
 * Fetch a single address doc from the user's addresses subcollection.
 * Returns null if not found or on error — never throws.
 */
const fetchDefaultAddress = async (uid, addressId) => {
  if (!addressId) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid, "addresses", addressId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
};

/**
 * Unset isDefault on all currently-default address docs for a user.
 * Used before promoting a new default so only one is ever marked.
 */
const clearDefaultAddressFlags = async (uid) => {
  const colRef = collection(db, "users", uid, "addresses");
  const snap   = await getDocs(query(colRef, where("isDefault", "==", true)));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { isDefault: false }));
  await batch.commit();
};

/**
 * Shared social login handler — create or sync Firestore user doc.
 */
const handleSocialLogin = async (firebaseUser, providerName) => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snap    = await getDoc(userRef);

  if (snap.exists()) {
    const existing = snap.data();

    if (existing.isBlocked) {
      await signOut(auth);
      const err = new Error("Account blocked");
      err.code  = "auth/user-blocked";
      throw err;
    }

    await updateDoc(userRef, {
      name          : firebaseUser.displayName || existing.name,
      avatarUrl     : firebaseUser.photoURL    || existing.avatarUrl || "",
      emailVerified : firebaseUser.emailVerified,
      updatedAt     : serverTimestamp(),
    });

    const address = await fetchDefaultAddress(firebaseUser.uid, existing.defaultAddressId);
    return { ...existing, address };
  }

  // First-time social login — create full Firestore doc
  const newUser = {
    uid                  : firebaseUser.uid,
    email                : firebaseUser.email         ?? "",
    emailVerified        : firebaseUser.emailVerified ?? false,
    provider             : providerName,
    role                 : "user",
    name                 : firebaseUser.displayName   ?? "",
    phone                : firebaseUser.phoneNumber   ?? "",
    gender               : "",
    dateOfBirth          : "",
    avatarUrl            : firebaseUser.photoURL      ?? "",
    isBlocked            : false,
    defaultAddressId     : null,
    notificationsEnabled : true,
    marketingEmails      : false,
    createdAt            : serverTimestamp(),
    updatedAt            : serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return { ...newUser, address: null };
};

/* ════════════════════════════════════════════════════════════
   SIGNUP
════════════════════════════════════════════════════════════ */

export const signupUser = async ({
  email,
  password,
  name,
  phone       = "",
  gender      = "",
  dateOfBirth = "",
}) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
      uid                  : user.uid,
      email,
      emailVerified        : false,
      provider             : "email",
      role                 : "user",
      name,
      phone,
      gender,
      dateOfBirth,
      avatarUrl            : "",
      isBlocked            : false,
      defaultAddressId     : null,
      notificationsEnabled : true,
      marketingEmails      : false,
      createdAt            : serverTimestamp(),
      updatedAt            : serverTimestamp(),
    });

    return { uid: user.uid, email, name, emailVerified: false };
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════════════════════ */

export const loginUser = async (email, password) => {
  try {
    const res  = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await reload(user);

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) throw new Error("User record missing");

    const data = snap.data();

    if (data.isBlocked) {
      await signOut(auth);
      const err = new Error("Account blocked");
      err.code  = "auth/user-blocked";
      throw err;
    }

    const address = await fetchDefaultAddress(user.uid, data.defaultAddressId);
    return { ...data, emailVerified: user.emailVerified, address };
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   CHECK EMAIL VERIFICATION
════════════════════════════════════════════════════════════ */

export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    await reload(user);

    if (user.emailVerified) {
      await updateDoc(doc(db, "users", user.uid), {
        emailVerified : true,
        updatedAt     : serverTimestamp(),
      }).catch(() => {});
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

/* ════════════════════════════════════════════════════════════
   GOOGLE LOGIN
════════════════════════════════════════════════════════════ */

export const googleLogin = async () => {
  try {
    const result   = await signInWithPopup(auth, new GoogleAuthProvider());
    const userData = await handleSocialLogin(result.user, "google");
    return userData;
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   FACEBOOK LOGIN
════════════════════════════════════════════════════════════ */

export const facebookLogin = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    const result   = await signInWithPopup(auth, provider);
    const userData = await handleSocialLogin(result.user, "facebook");
    return userData;
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   UPDATE PROFILE
   Allowed keys include defaultAddressId so EditProfilePage
   can update it in one call alongside other profile fields.
════════════════════════════════════════════════════════════ */

export const updateProfileData = async (uid, updates) => {
  try {
    const ALLOWED_KEYS = [
      "name",
      "phone",
      "gender",
      "dateOfBirth",
      "avatarUrl",
      "notificationsEnabled",
      "marketingEmails",
      "defaultAddressId",   // ✅ added — lets EditProfilePage sync address in one call
    ];

    const allowed = Object.fromEntries(
      ALLOWED_KEYS
        .filter((k) => updates[k] !== undefined)
        .map((k)   => [k, updates[k]])
    );

    if (!Object.keys(allowed).length) return {};

    await updateDoc(doc(db, "users", uid), {
      ...allowed,
      updatedAt: serverTimestamp(),
    });

    if (allowed.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: allowed.name });
    }

    return allowed;
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   CHANGE PASSWORD
════════════════════════════════════════════════════════════ */

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      const err = new Error();
      err.code  = "auth/user-not-found";
      throw err;
    }
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   FORGOT PASSWORD
════════════════════════════════════════════════════════════ */

export const forgotPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — GET ALL
   Returns all addresses for a user, sorted newest first.
════════════════════════════════════════════════════════════ */

export const getAddresses = async (uid) => {
  try {
    const snap = await getDocs(
      query(collection(db, "users", uid, "addresses"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — GET DEFAULT
   Convenience wrapper — fetches the user doc and resolves
   the defaultAddressId into a full address object.
════════════════════════════════════════════════════════════ */

export const getDefaultAddress = async (uid) => {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return null;
    return fetchDefaultAddress(uid, userSnap.data().defaultAddressId);
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — ADD
   Stores a new address. If isDefault is true:
     1. Clears isDefault on all existing addresses
     2. Sets defaultAddressId on the user doc
   Always returns { id, ...address }.
════════════════════════════════════════════════════════════ */

export const addAddress = async (uid, address) => {
  try {
    if (address.isDefault) {
      await clearDefaultAddressFlags(uid);
    }

    const ref = await addDoc(collection(db, "users", uid, "addresses"), {
      ...address,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (address.isDefault) {
      await updateDoc(doc(db, "users", uid), {
        defaultAddressId : ref.id,
        updatedAt        : serverTimestamp(),
      });
    }

    return { id: ref.id, ...address };
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — UPDATE
   Updates specific fields on an existing address doc.
   If isDefault is being set to true:
     1. Clears isDefault on all other addresses
     2. Updates defaultAddressId on the user doc
   If isDefault is being set to false and this was the default:
     1. Clears defaultAddressId on the user doc
════════════════════════════════════════════════════════════ */

export const updateAddress = async (uid, addressId, updates) => {
  try {
    const addressRef = doc(db, "users", uid, "addresses", addressId);

    // ── Promoting to default ──
    if (updates.isDefault === true) {
      await clearDefaultAddressFlags(uid);
      await updateDoc(addressRef, { ...updates, updatedAt: serverTimestamp() });
      await updateDoc(doc(db, "users", uid), {
        defaultAddressId : addressId,
        updatedAt        : serverTimestamp(),
      });
      return { id: addressId, ...updates };
    }

    // ── Demoting from default ──
    if (updates.isDefault === false) {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.data()?.defaultAddressId === addressId) {
        await updateDoc(doc(db, "users", uid), {
          defaultAddressId : null,
          updatedAt        : serverTimestamp(),
        });
      }
    }

    await updateDoc(addressRef, { ...updates, updatedAt: serverTimestamp() });
    return { id: addressId, ...updates };
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — DELETE
   Removes an address doc. If it was the default address,
   clears defaultAddressId on the user doc so context
   doesn't hold a stale reference.
════════════════════════════════════════════════════════════ */

export const deleteAddress = async (uid, addressId) => {
  try {
    // Check if this is the current default before deleting
    const userSnap = await getDoc(doc(db, "users", uid));
    const wasDefault = userSnap.data()?.defaultAddressId === addressId;

    await deleteDoc(doc(db, "users", uid, "addresses", addressId));

    if (wasDefault) {
      await updateDoc(doc(db, "users", uid), {
        defaultAddressId : null,
        updatedAt        : serverTimestamp(),
      });
    }

    return { id: addressId, deleted: true, wasDefault };
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — SET DEFAULT
   Promotes an existing address to default without changing
   any other fields on it. Useful for an "Set as default"
   button on an address list page.
════════════════════════════════════════════════════════════ */

export const setDefaultAddress = async (uid, addressId) => {
  try {
    await clearDefaultAddressFlags(uid);

    await updateDoc(doc(db, "users", uid, "addresses", addressId), {
      isDefault : true,
      updatedAt : serverTimestamp(),
    });

    await updateDoc(doc(db, "users", uid), {
      defaultAddressId : addressId,
      updatedAt        : serverTimestamp(),
    });

    return { id: addressId, isDefault: true };
  } catch (err) {
    handleError(err);
  }
};

/* ════════════════════════════════════════════════════════════
   ADDRESS — SAVE (upsert)
   Convenience function used by EditProfilePage and
   AddressPage — creates if no id, updates if id present.
   Accepts the flat form shape used across the app:
   { id?, name?, phone?, line1, city, state, pincode, tag?, isDefault? }
════════════════════════════════════════════════════════════ */

export const saveAddress = async (uid, address) => {
  try {
    const { id, ...fields } = address;

    if (id && !id.startsWith("temp-")) {
      // Existing Firestore doc — update it
      return updateAddress(uid, id, fields);
    }

    // New address — add it
    return addAddress(uid, fields);
  } catch (err) {
    handleError(err);
  }
};