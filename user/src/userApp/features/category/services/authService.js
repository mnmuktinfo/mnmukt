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
  sendPasswordResetEmail
} from "firebase/auth";

import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

// ----------------------------
// HUMAN-FRIENDLY ERROR MESSAGES
// ----------------------------
const formatError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-not-verified":
      return "Please verify your email before logging in.";
      case "auth/invalid-credential":
  return "Incorrect email or password.";

    default:
      return "Something went wrong. Please try again.";
  }
};

// ----------------------------
// SIGNUP (EMAIL + PASSWORD)
// ----------------------------
export const signupUser = async (form) => {
  try {
    const { email, password, firstName, lastName, mobile, address } = form;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    await sendEmailVerification(user);

    const userData = {
      uid: user.uid,
      email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      mobile: mobile || "",
      emailVerified: false,
      provider: "email",
      role: "user",
      createdAt: serverTimestamp(),

      // Address
      address: {
        name: address?.name || `${firstName} ${lastName}`,
        phone: address?.phone || mobile || "",
        line1: address?.line1 || "",
        locality: address?.locality || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.pincode || "",
      },
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return userData;
  } catch (err) {
    throw new Error(formatError(err.code));
  }
};

// ----------------------------
// LOGIN (EMAIL + PASSWORD)
// ----------------------------
export const loginUser = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Check email verification
    if (!user.emailVerified) {
      const customErr = new Error("Please verify your email before logging in.");
      customErr.code = "auth/email-not-verified";
      throw customErr;
    }

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    const userData = snap.exists()
      ? snap.data()
      : {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
        };

    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  } catch (err) {    console.log("LOGIN ERROR:", err.code);

    throw new Error(formatError(err.code) || err.message);

  }
};

// ----------------------------
// GOOGLE SIGNUP / LOGIN
// ----------------------------
export const googleSignup = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const nameParts = user.displayName?.split(" ") || ["", ""];

    const userData = {
      uid: user.uid,
      email: user.email,
      firstName: nameParts[0],
      lastName: nameParts[1] || "",
      displayName: user.displayName || "",
      phone: user.phoneNumber || "",
      provider: "google",
      role: "user",
      emailVerified: user.emailVerified,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), userData, { merge: true });

    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  } catch (err) {
    throw new Error(err.message || "Google login failed.");
  }
};

// ----------------------------
// ADD OR UPDATE ADDRESS
// ----------------------------
export const addOrUpdateAddress = async (uid, newAddress) => {
  try {
    if (!uid) throw new Error("User ID is required.");

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found.");
    }

    const existingData = userSnap.data();
    const updatedAddress = {
      ...(existingData.address || {}),
      ...newAddress,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, { address: updatedAddress });

    return { ...existingData, address: updatedAddress };
  } catch (err) {
    throw new Error(err.message || "Failed to update address.");
  }
};

// ----------------------------
// CHANGE PASSWORD
// ----------------------------
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in.");

    const cred = EmailAuthProvider.credential(user.email, currentPassword);

    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);

    return "Password updated successfully!";
  } catch (err) {
    throw new Error(formatError(err.code) || err.message);
  }
};

// ----------------------------
// UPDATE MOBILE
// ----------------------------
export const updateMobile = async (uid, newMobile) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      mobile: newMobile,
      "address.phone": newMobile,
      updatedAt: serverTimestamp(),
    });

    return "Mobile number updated!";
  } catch (err) {
    throw new Error(err.message || "Failed to update mobile.");
  }
};

// ----------------------------
// UNIVERSAL PROFILE UPDATE
// ----------------------------
export const updateProfileData = async (uid, updates) => {
  try {
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    if (updates.displayName) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
      });
    }

    return "Profile updated successfully!";
  } catch (err) {
    throw new Error(err.message || "Failed to update profile.");
  }
};

// ----------------------------
// FORGOT PASSWORD
// ----------------------------
export const forgotPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent.";
  } catch (err) {
    throw new Error(formatError(err.code) || "Failed to send reset email.");
  }
};