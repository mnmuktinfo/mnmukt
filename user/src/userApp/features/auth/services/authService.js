import { auth, db } from "../../../../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
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
} from "firebase/firestore";

/* ==============================
   HELPER: Fetch Full Address
   (Used internally by Login/Google)
============================== */
const fetchDefaultAddress = async (uid, defaultAddressId) => {
  if (!defaultAddressId) return null;
  try {
    const addrRef = doc(db, "users", uid, "addresses", defaultAddressId);
    const addrSnap = await getDoc(addrRef);
    return addrSnap.exists() ? { id: addrSnap.id, ...addrSnap.data() } : null;
  } catch (err) {
    console.error("Error fetching default address:", err);
    return null;
  }
};

/* ==============================
   ERROR FORMATTING
============================== */
const formatError = (code) => {
  switch (code) {
    case "auth/email-already-in-use": return "This email is already registered.";
    case "auth/invalid-email": return "Invalid email address.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Incorrect email or password.";
    case "auth/email-not-verified": return "Please verify your email before logging in.";
    default: return "Something went wrong. Please try again.";
  }
};

/* ==============================
   1. SIGNUP (EMAIL)
============================== */
export const signupUser = async ({ email, password, name, phone,role }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password,role);
    const user = cred.user;

    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user);

    const userDoc = {
      uid: user.uid,
      role: "user",
      provider: "email",
      isBlocked: false,
      name,
      email,
      phone: phone || "",
      emailVerified: false,
      defaultAddressId: null, // DB only stores the ID
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userDoc);
    
    // Return userDoc (address is null initially)
    return { ...userDoc, address: null };
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

/* ==============================
   2. LOGIN (EMAIL) - UPDATED 🚀
============================== */
export const loginUser = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (!user.emailVerified) throw { code: "auth/email-not-verified" };

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) throw new Error("User record missing.");

    let userData = snap.data();

    // 🚀 HYBRID SYNC:
    // If DB has a defaultAddressId, fetch the actual address data now
    // so we can save it to LocalStorage immediately.
    if (userData.defaultAddressId) {
       const fullAddress = await fetchDefaultAddress(user.uid, userData.defaultAddressId);
       userData.address = fullAddress; // Attach to memory object (for LocalStorage)
    } else {
       userData.address = null;
    }

    // Auto-sync verification status
    if (user.emailVerified && !userData.emailVerified) {
      await updateDoc(userRef, { emailVerified: true });
      userData.emailVerified = true;
    }

    return userData;
  } catch (err) {
    throw new Error(formatError(err.code) || err.message);
  }
};

/* ==============================
   3. GOOGLE LOGIN - UPDATED 🚀
============================== */
export const googleSignup = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    let finalUser;

    if (snap.exists()) {
      // EXISTING USER
      finalUser = snap.data();
      
      // 🚀 Fetch Address for LocalStorage
      if (finalUser.defaultAddressId) {
        finalUser.address = await fetchDefaultAddress(user.uid, finalUser.defaultAddressId);
      }

      await updateDoc(userRef, {
        name: user.displayName,
        emailVerified: user.emailVerified,
        updatedAt: serverTimestamp(),
      });
      
      finalUser = { ...finalUser, name: user.displayName, emailVerified: user.emailVerified };

    } else {
      // NEW USER
      finalUser = {
        uid: user.uid,
        role: "user",
        provider: "google",
        isBlocked: false,
        name: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        emailVerified: user.emailVerified,
        defaultAddressId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, finalUser);
      finalUser.address = null;
    }

    return finalUser;
  } catch (err) {
    throw new Error("Google login failed.");
  }
};

/* ==============================
   4. ADD ADDRESS - UPDATED 🚀
============================== */
export const addAddress = async (uid, address) => {
  if (!uid) throw new Error("UID required");

  // 1. Add to Subcollection (History)
  const addressColRef = collection(db, "users", uid, "addresses");
  const docRef = await addDoc(addressColRef, {
    ...address,
    createdAt: serverTimestamp(),
  });

  const addressData = { id: docRef.id, ...address };

  // 2. If Default, Update Main Profile ID
  if (address.isDefault) {
    await updateDoc(doc(db, "users", uid), {
      defaultAddressId: docRef.id, // Only save ID to DB
      updatedAt: serverTimestamp(),
    });
  }

  // 3. Return Full Object
  // The frontend Context will take this 'addressData' and save it 
  // into localStorage as 'user.address'
  return addressData;
};

/* ==============================
   5. CHANGE PASSWORD
============================== */
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);

  return "Password updated";
};

/* ==============================
   6. UPDATE PROFILE
============================== */
export const updateProfileData = async (uid, updates) => {
  if (!uid) throw new Error("UID required");

  const allowedFields = {
    name: updates.name,
    gender: updates.gender,
    dateOfBirth: updates.dateOfBirth,
    phone: updates.phone,
    // Note: We don't allow updating address here directly anymore
  };

  Object.keys(allowedFields).forEach(
    (k) => allowedFields[k] == null && delete allowedFields[k]
  );

  await updateDoc(doc(db, "users", uid), {
    ...allowedFields,
    updatedAt: serverTimestamp(),
  });

  if (allowedFields.name && auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: allowedFields.name,
    });
  }

  return allowedFields;
};

/* ==============================
   7. FORGOT PASSWORD
============================== */
export const forgotPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  return "Password reset email sent";
};