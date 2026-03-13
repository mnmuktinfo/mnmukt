import { auth, db } from "../../../../config/firebase";
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
} from "firebase/auth";
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

// ─── Helper: fetch default address ───────────────────────────────────────────
const fetchDefaultAddress = async (uid, defaultAddressId) => {
  if (!defaultAddressId) return null;
  try {
    const addrRef  = doc(db, "users", uid, "addresses", defaultAddressId);
    const addrSnap = await getDoc(addrRef);
    return addrSnap.exists() ? { id: addrSnap.id, ...addrSnap.data() } : null;
  } catch (err) {
    console.error("Error fetching default address:", err);
    return null;
  }
};

// ─── Error formatting ─────────────────────────────────────────────────────────
const formatError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":    return "This email is already registered.";
    case "auth/invalid-email":           return "Invalid email address.";
    case "auth/weak-password":           return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":      return "Incorrect email or password.";
    case "auth/email-not-verified":      return "Please verify your email before logging in.";
    case "auth/user-blocked":            return "Your account has been blocked. Please contact support.";
    case "auth/popup-closed-by-user":    return "Sign-in was cancelled.";
    case "auth/cancelled-popup-request": return "Only one sign-in popup can be open at a time.";
    case "auth/network-request-failed":  return "Network error. Please check your connection.";
    // Thrown when same email was registered with a different provider (e.g. Google vs Facebook)
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email. Try signing in with Google or email/password.";
    default:                             return "Something went wrong. Please try again.";
  }
};

// ─── Shared social login handler ──────────────────────────────────────────────
// Google and Facebook share identical post-auth logic — extracted to avoid duplication.
const handleSocialLogin = async (user, providerName) => {
  const userRef = doc(db, "users", user.uid);
  const snap    = await getDoc(userRef);

  if (snap.exists()) {
    // Existing user
    const existing = snap.data();
    if (existing.isBlocked) throw { code: "auth/user-blocked" };

    const address = existing.defaultAddressId
      ? await fetchDefaultAddress(user.uid, existing.defaultAddressId)
      : null;

    const updates = {
      name:          user.displayName || existing.name,
      emailVerified: user.emailVerified,
      updatedAt:     serverTimestamp(),
    };

    await updateDoc(userRef, updates);
    return { ...existing, ...updates, address };

  } else {
    // New user — create Firestore record
    const newUser = {
      uid:              user.uid,
      role:             "user",
      provider:         providerName,
      isBlocked:        false,
      name:             user.displayName || "",
      email:            user.email       || "",
      phone:            user.phoneNumber || "",
      emailVerified:    user.emailVerified,
      defaultAddressId: null,
      createdAt:        serverTimestamp(),
      updatedAt:        serverTimestamp(),
    };

    await setDoc(userRef, newUser);
    return { ...newUser, address: null };
  }
};

/* ══════════════════════════════════════════════
   1. SIGNUP (EMAIL)
══════════════════════════════════════════════ */
export const signupUser = async ({ email, password, name, phone }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user);

    const userDoc = {
      uid:              user.uid,
      role:             "user",
      provider:         "email",
      isBlocked:        false,
      name,
      email,
      phone:            phone || "",
      emailVerified:    false,
      defaultAddressId: null,
      createdAt:        serverTimestamp(),
      updatedAt:        serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userDoc);
    return { ...userDoc, address: null };
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   2. LOGIN (EMAIL)
══════════════════════════════════════════════ */
export const loginUser = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user   = result.user;

    if (!user.emailVerified) throw { code: "auth/email-not-verified" };

    const userRef = doc(db, "users", user.uid);
    const snap    = await getDoc(userRef);

    if (!snap.exists()) throw new Error("User record missing.");

    const userData = snap.data();

    if (userData.isBlocked) throw { code: "auth/user-blocked" };

    userData.address = userData.defaultAddressId
      ? await fetchDefaultAddress(user.uid, userData.defaultAddressId)
      : null;

    if (user.emailVerified && !userData.emailVerified) {
      await updateDoc(userRef, { emailVerified: true });
      userData.emailVerified = true;
    }

    return userData;
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   3. GOOGLE LOGIN
══════════════════════════════════════════════ */
export const googleSignup = async () => {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return await handleSocialLogin(result.user, "google");
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   4. FACEBOOK LOGIN
   ── Setup checklist (do this once) ────────────
   1. Firebase Console → Authentication →
      Sign-in method → Facebook → Enable
   2. developers.facebook.com → Your App →
      Add "Facebook Login" product
   3. In Facebook app settings → Valid OAuth redirect URIs → add:
      https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler
   4. Copy Facebook App ID + App Secret →
      paste into Firebase Console Facebook provider settings
══════════════════════════════════════════════ */
export const facebookLogin = async () => {
  try {
    const provider = new FacebookAuthProvider();

    // Request email explicitly — Facebook doesn't always include it by default
    provider.addScope("email");
    provider.addScope("public_profile");

    const result = await signInWithPopup(auth, provider);
    return await handleSocialLogin(result.user, "facebook");

  } catch (err) {
    // auth/account-exists-with-different-credential:
    // User already signed up with same email via Google or email/password.
    // Firebase blocks the login — surface a clear message.
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   5. ADD ADDRESS
══════════════════════════════════════════════ */
export const addAddress = async (uid, address) => {
  if (!uid) throw new Error("UID required");

  const addressColRef = collection(db, "users", uid, "addresses");

  if (address.isDefault) {
    const existingSnap = await getDocs(
      query(addressColRef, where("isDefault", "==", true))
    );
    if (!existingSnap.empty) {
      const batch = writeBatch(db);
      existingSnap.docs.forEach((d) => batch.update(d.ref, { isDefault: false }));
      await batch.commit();
    }
  }

  const docRef = await addDoc(addressColRef, {
    ...address,
    createdAt: serverTimestamp(),
  });

  const addressData = { id: docRef.id, ...address };

  if (address.isDefault) {
    await updateDoc(doc(db, "users", uid), {
      defaultAddressId: docRef.id,
      updatedAt:        serverTimestamp(),
    });
  }

  return addressData;
};

/* ══════════════════════════════════════════════
   6. CHANGE PASSWORD
══════════════════════════════════════════════ */
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);

  return "Password updated";
};

/* ══════════════════════════════════════════════
   7. UPDATE PROFILE
══════════════════════════════════════════════ */
export const updateProfileData = async (uid, updates) => {
  if (!uid) throw new Error("UID required");

  const allowedFields = {
    name:        updates.name,
    gender:      updates.gender,
    dateOfBirth: updates.dateOfBirth,
    phone:       updates.phone,
  };

  Object.keys(allowedFields).forEach((k) => {
    if (allowedFields[k] == null || allowedFields[k] === "") delete allowedFields[k];
  });

  if (!Object.keys(allowedFields).length) return {};

  await updateDoc(doc(db, "users", uid), {
    ...allowedFields,
    updatedAt: serverTimestamp(),
  });

  if (allowedFields.name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: allowedFields.name });
  }

  return allowedFields;
};

/* ══════════════════════════════════════════════
   8. FORGOT PASSWORD
══════════════════════════════════════════════ */
export const forgotPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent";
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};