
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const authService = {
  listenAuth: (callback) => onAuthStateChanged(auth, callback),
  signOut: () => signOut(auth),
  getUserProfile: async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },
};
