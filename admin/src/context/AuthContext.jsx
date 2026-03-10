import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Instant Boot: Check for existing session in storage
    const storedSession = localStorage.getItem("mnmukt_registry_token");
    if (storedSession) {
      const parsedData = JSON.parse(storedSession);
      setAdmin(parsedData);
      setIsAuthorized(true);
    }

    // 2. Real-time Sync: Monitor Firebase Auth State
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Double-verify with Firestore to ensure they have 'admin' clearance
        const adminDoc = await getDoc(doc(db, "users", firebaseUser.uid));

        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          const adminData = {
            uid: firebaseUser.uid,
            ...adminDoc.data(),
            syncedAt: new Date().toISOString(),
          };

          setAdmin(adminData);
          setIsAuthorized(true);
          localStorage.setItem(
            "mnmukt_registry_token",
            JSON.stringify(adminData),
          );
        } else {
          // Not an admin: Block access
          handleLogoutProtocol();
        }
      } else {
        handleLogoutProtocol();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogoutProtocol = () => {
    setAdmin(null);
    setIsAuthorized(false);
    localStorage.removeItem("mnmukt_registry_token");
  };

  const value = {
    admin,
    isAuthorized,
    loading,
    logout: handleLogoutProtocol,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

// Custom Hook for easy access in any Admin Component
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
