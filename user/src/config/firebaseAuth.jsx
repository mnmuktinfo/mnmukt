import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Main Firebase project for Auth, orders, users, storage
const firebaseMainConfig = {
  apiKey: import.meta.env.VITE_AUTH_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_AUTH_PROJECT_ID,
  databaseURL: import.meta.env.VITE_AUTH_DATABASE_URL,
  storageBucket: import.meta.env.VITE_AUTH_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_AUTH_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_AUTH_APP_ID,
  measurementId: import.meta.env.VITE_AUTH_MEASUREMENTID,
};

// ✅ Prevent multiple initialization (dev hot reload safe)
const mainApp =
  getApps().find((app) => app.name === "mainApp") ||
  initializeApp(firebaseMainConfig, "mainApp");

// ✅ Services
export const auth = getAuth(mainApp); // main auth
export const db = getFirestore(mainApp); // main Firestore (orders, users, inquiries)

export default mainApp;
