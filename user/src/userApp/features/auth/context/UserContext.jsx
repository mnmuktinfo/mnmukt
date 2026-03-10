import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../../../config/firebase";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // -------------------------
  // 1. STATE MANAGEMENT
  // -------------------------
  // User Profile (Name, Email, Role, etc.)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("User storage parse error", e);
      return null;
    }
  });

  // Active Address (Line1, City, Pincode)
  const [address, setAddress] = useState(() => {
    try {
      const stored = localStorage.getItem("user_address");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // 2. FIREBASE AUTH SYNC (On Load/Refresh)
  // -------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth();
        return;
      }

      try {
        // A. Fetch Main User Profile
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          clearAuth();
          return;
        }

        const userData = userSnap.data();

        // Construct Clean User Object
        const finalUser = {
          uid: firebaseUser.uid,
          role: userData.role || "user",
          provider: userData.provider || "email",
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth || "",
          defaultAddressId: userData.defaultAddressId || null,
          emailVerified: firebaseUser.emailVerified,
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null,
        };

        // B. Fetch Address from Subcollection (If ID exists)
        if (userData.defaultAddressId) {
          try {
            const addrRef = doc(
              db,
              "users",
              firebaseUser.uid,
              "addresses",
              userData.defaultAddressId,
            );
            const addrSnap = await getDoc(addrRef);

            if (addrSnap.exists()) {
              const addressData = { id: addrSnap.id, ...addrSnap.data() };
              setAddress(addressData);
              localStorage.setItem("user_address", JSON.stringify(addressData));
            }
          } catch (addrErr) {
            console.error("Address fetch failed:", addrErr);
          }
        } else {
          setAddress(null);
          localStorage.removeItem("user_address");
        }

        // C. Update State
        setUser(finalUser);
        setIsLoggedIn(true);
        localStorage.setItem("user", JSON.stringify(finalUser));
        localStorage.setItem("auth_uid", firebaseUser.uid);
      } catch (err) {
        console.error("Auth sync failed:", err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // -------------------------
  // 3. SMART SAVE ADDRESS (Create New or Update Existing)
  // -------------------------
  const saveAddress = async (addressData) => {
    if (!user?.uid) return;

    try {
      // Clean Data: Remove ID from payload
      const { id, ...dataToSave } = addressData;
      const payload = { ...dataToSave, updatedAt: serverTimestamp() };

      let finalAddressId = id || address?.id || user.defaultAddressId;
      let docRef;

      // SCENARIO A: CREATE NEW (No ID exists)
      if (!finalAddressId) {
        const addressCollection = collection(
          db,
          "users",
          user.uid,
          "addresses",
        );
        // addDoc automatically generates a clean unique ID
        docRef = await addDoc(addressCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });
        finalAddressId = docRef.id;

        // Link new ID to Main User Profile
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { defaultAddressId: finalAddressId });

        // Update Local User State
        const updatedUser = { ...user, defaultAddressId: finalAddressId };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      // SCENARIO B: UPDATE EXISTING (ID exists)
      else {
        docRef = doc(db, "users", user.uid, "addresses", finalAddressId);
        // setDoc with merge:true is safer than updateDoc (creates if missing)
        await setDoc(docRef, payload, { merge: true });
      }

      // SCENARIO C: SYNC CACHE (Instant UI Update)
      const fullAddress = { id: finalAddressId, ...dataToSave };
      setAddress(fullAddress);
      localStorage.setItem("user_address", JSON.stringify(fullAddress));

      return fullAddress;
    } catch (error) {
      console.error("Failed to save address:", error);
      throw error;
    }
  };

  // -------------------------
  // 4. UPDATE USER PROFILE (Name, Phone, etc.)
  // -------------------------
  const updateUserAndSync = async (updates) => {
    if (!user?.uid) return;

    try {
      // Safety: Strip out 'address' if accidentally passed
      const { address: ignored, ...profileUpdates } = updates;

      // Filter undefined
      const payload = {};
      Object.keys(profileUpdates).forEach((key) => {
        if (profileUpdates[key] !== undefined) {
          payload[key] = profileUpdates[key];
        }
      });

      payload.updatedAt = new Date().toISOString();

      // Update Firestore Main Doc
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, payload);

      // Update Local State & Storage
      setUser((prev) => {
        const updatedUser = { ...prev, ...payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      return payload;
    } catch (error) {
      console.error("Failed to sync user profile:", error);
      throw error;
    }
  };

  // -------------------------
  // 5. CACHE HELPER (Manual Override)
  // -------------------------
  const updateAddressCache = (newAddress) => {
    setAddress(newAddress);
    localStorage.setItem("user_address", JSON.stringify(newAddress));
  };

  // -------------------------
  // 6. LOGOUT
  // -------------------------
  const clearAuth = () => {
    setUser(null);
    setAddress(null);
    setIsLoggedIn(false);
    setLoading(false);
    localStorage.removeItem("user");
    localStorage.removeItem("user_address");
    localStorage.removeItem("auth_uid");
  };

  const logout = async () => {
    await signOut(auth);
    clearAuth();
  };

  const resetPassword = async (email) => {
    if (!email) throw new Error("Email is required");

    try {
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent successfully.";
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        throw new Error("No account found with this email.");
      }
      if (err.code === "auth/invalid-email") {
        throw new Error("Invalid email address.");
      }
      throw new Error("Failed to send reset email.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        address, // 🔥 Exposed directly (e.g., address.city)
        isLoggedIn,
        loading,
        logout,
        saveAddress, // 🔥 Use this for Address Forms
        updateUserAndSync, // 🔥 Use this for Profile Forms
        updateAddressCache, // Use for manual UI updates
        resetPassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
