import { auth, db } from "../../../../config/firebase";
import {
  createUserWithEmailAndPassword, sendEmailVerification,
  signInWithEmailAndPassword, updateProfile,
  GoogleAuthProvider, FacebookAuthProvider, signInWithPopup,
  updatePassword, reauthenticateWithCredential,
  EmailAuthProvider, sendPasswordResetEmail, reload,
} from "firebase/auth";
import {
  setDoc, doc, getDoc, updateDoc,
  serverTimestamp, collection, addDoc,
  getDocs, query, where, writeBatch,
} from "firebase/firestore";

// ─── Error formatting ─────────────────────────────────────────────────────────
const formatError = (code) => ({
  "auth/email-already-in-use":                    "This email is already registered.",
  "auth/invalid-email":                           "Invalid email address.",
  "auth/weak-password":                           "Password must be at least 6 characters.",
  "auth/user-not-found":                          "Incorrect email or password.",
  "auth/wrong-password":                          "Incorrect email or password.",
  "auth/invalid-credential":                      "Incorrect email or password.",
  "auth/email-not-verified":                      "Please verify your email before logging in.",
  "auth/user-blocked":                            "Your account has been blocked. Please contact support.",
  "auth/popup-closed-by-user":                    "Sign-in was cancelled.",
  "auth/cancelled-popup-request":                 "Only one sign-in popup can be open at a time.",
  "auth/network-request-failed":                  "Network error. Please check your connection.",
  "auth/account-exists-with-different-credential":"An account already exists with this email. Try signing in with Google or email/password.",
}[code] ?? "Something went wrong. Please try again.");

// ─── Helper: fetch default address ───────────────────────────────────────────
const fetchDefaultAddress = async (uid, defaultAddressId) => {
  if (!defaultAddressId) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid, "addresses", defaultAddressId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error("Address fetch error:", err);
    return null;
  }
};

// ─── Shared social login ──────────────────────────────────────────────────────
const handleSocialLogin = async (user, providerName) => {
  const userRef = doc(db, "users", user.uid);
  const snap    = await getDoc(userRef);

  if (snap.exists()) {
    const existing = snap.data();
    if (existing.isBlocked) throw { code: "auth/user-blocked" };
    const address = await fetchDefaultAddress(user.uid, existing.defaultAddressId);
    await updateDoc(userRef, {
      name:          user.displayName || existing.name,
      emailVerified: user.emailVerified,
      updatedAt:     serverTimestamp(),
    });
    return { ...existing, address };
  }

  const newUser = {
    uid: user.uid, role: "user", provider: providerName,
    isBlocked: false, name: user.displayName || "",
    email: user.email || "", phone: user.phoneNumber || "",
    emailVerified: user.emailVerified, defaultAddressId: null,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  await setDoc(userRef, newUser);
  return { ...newUser, address: null };
};

/* ══════════════════════════════════════════════
   1. SIGNUP (EMAIL)
   ✅ Saves to Firestore immediately after account
      creation. Cache stays empty until email is
      verified — AuthContext handles that gate.
══════════════════════════════════════════════ */
export const signupUser = async ({ email, password, name, phone }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Run profile update + email verification in parallel
    await Promise.all([
      updateProfile(user, { displayName: name }),
      sendEmailVerification(user),
    ]);

    // ✅ Save to Firestore immediately — but emailVerified = false
    // AuthContext will NOT cache this user until emailVerified flips to true
    const userDoc = {
      uid: user.uid, role: "user", provider: "email",
      isBlocked: false, name, email,
      phone: phone || "", emailVerified: false,
      defaultAddressId: null,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), userDoc);

    // Return minimal object — enough to show "check your email" screen
    return { uid: user.uid, email, name, emailVerified: false };
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   2. POLL FOR EMAIL VERIFICATION
   Call this after signup to detect when user
   clicks the verification link.
   Returns the full user object once verified.
   ✅ Uses reload() — no Firestore reads during poll
══════════════════════════════════════════════ */
export const pollEmailVerification = (onVerified, intervalMs = 3000) => {
  const interval = setInterval(async () => {
    try {
      const user = auth.currentUser;
      if (!user) { clearInterval(interval); return; }

      // reload() re-fetches Firebase Auth state — NOT a Firestore read
      await reload(user);

      if (user.emailVerified) {
        clearInterval(interval);

        // ✅ NOW sync emailVerified = true to Firestore (1 write, once ever)
        await updateDoc(doc(db, "users", user.uid), {
          emailVerified: true,
          updatedAt: serverTimestamp(),
        }).catch(() => {});

        // This triggers onAuthStateChanged → AuthContext does full Firestore read
        // → caches the verified user for the next hour
        onVerified();
      }
    } catch (err) {
      console.warn("[pollEmailVerification] error:", err.message);
    }
  }, intervalMs);

  // Return cleanup function — call this if user leaves the verify screen
  return () => clearInterval(interval);
};

/* ══════════════════════════════════════════════
   3. LOGIN (EMAIL)
   ✅ Checks emailVerified BEFORE Firestore read
   ✅ Saves 1 read for every unverified login attempt
══════════════════════════════════════════════ */
export const loginUser = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user   = result.user;

    // ✅ Check verification FIRST — no Firestore read wasted on unverified users
    if (!user.emailVerified) throw { code: "auth/email-not-verified" };

    // Only verified users reach Firestore
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) throw new Error("User record missing.");

    const userData = userSnap.data();
    if (userData.isBlocked) throw { code: "auth/user-blocked" };

    // Sync emailVerified flag if it somehow lagged behind
    if (!userData.emailVerified) {
      await updateDoc(doc(db, "users", user.uid), {
        emailVerified: true, updatedAt: serverTimestamp(),
      }).catch(() => {});
    }

    const address = await fetchDefaultAddress(user.uid, userData.defaultAddressId);
    return { ...userData, emailVerified: true, address };
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   4. GOOGLE LOGIN
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
   5. FACEBOOK LOGIN
══════════════════════════════════════════════ */
export const facebookLogin = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");
    const result = await signInWithPopup(auth, provider);
    return await handleSocialLogin(result.user, "facebook");
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ══════════════════════════════════════════════
   6. ADD ADDRESS
══════════════════════════════════════════════ */
export const addAddress = async (uid, address) => {
  if (!uid) throw new Error("UID required");
  const colRef = collection(db, "users", uid, "addresses");
  if (address.isDefault) {
    const snap = await getDocs(query(colRef, where("isDefault", "==", true)));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { isDefault: false }));
      await batch.commit();
    }
  }
  const ref = await addDoc(colRef, { ...address, createdAt: serverTimestamp() });
  if (address.isDefault) {
    await updateDoc(doc(db, "users", uid), {
      defaultAddressId: ref.id, updatedAt: serverTimestamp(),
    });
  }
  return { id: ref.id, ...address };
};

/* ══════════════════════════════════════════════
   7. CHANGE PASSWORD
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
   8. UPDATE PROFILE
══════════════════════════════════════════════ */
export const updateProfileData = async (uid, updates) => {
  if (!uid) throw new Error("UID required");
  const allowed = Object.fromEntries(
    ["name", "gender", "dateOfBirth", "phone"]
      .filter((k) => updates[k] != null && updates[k] !== "")
      .map((k) => [k, updates[k]])
  );
  if (!Object.keys(allowed).length) return {};
  await updateDoc(doc(db, "users", uid), { ...allowed, updatedAt: serverTimestamp() });
  if (allowed.name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: allowed.name });
  }
  return allowed;
};

/* ══════════════════════════════════════════════
   9. FORGOT PASSWORD
══════════════════════════════════════════════ */
export const forgotPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent";
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};