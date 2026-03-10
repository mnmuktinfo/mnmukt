import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

// Helper for human-readable error messages
const handleAuthError = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return new Error("Identifier already exists in registry.");
    case 'auth/weak-password':
      return new Error("Key strength insufficient (min 6 chars).");
    case 'auth/invalid-email':
      return new Error("Identifier format incorrect.");
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return new Error("Invalid Administrative Credentials.");
    default:
      return new Error(error.message || "Authorization System Error.");
  }
};

export const authService = {
  // 1. REGISTER NEW ADMIN
  registerAdmin: async ({ name, email, password, phone, role }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const adminProfile = {
        uid: user.uid,
        name,
        email,
        phone,
        role: role || "admin",
        isAdmin: true, 
        isActive: true,
        createdAt: new Date()
      };

      await setDoc(doc(db, "users", user.uid), adminProfile);
      return adminProfile;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // 2. LOGIN ADMIN
  loginAdmin: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        await signOut(auth);
        throw new Error("Access Denied: Administrative Clearance Required.");
      }

      return { uid: userCredential.user.uid, ...userDoc.data() };
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // 3. UPDATE ADMIN PROFILE
  updateAdminRegistry: async (uid, data) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      throw new Error("Failed to synchronize registry update.");
    }
  },

  // 4. LOGOUT
  logout: async () => {
    try {
      await signOut(auth);
      // Clear specific admin token if needed
      localStorage.removeItem("mnmukt_admin_session");
    } catch (error) {
      console.error("Logout Protocol Failed");
    }
  }
};