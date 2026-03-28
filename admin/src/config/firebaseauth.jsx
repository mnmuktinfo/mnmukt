import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseAuthConfig = {
  apiKey: import.meta.env.VITE_AUTH_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_AUTH_PROJECT_ID,

  databaseURL: import.meta.env.VITE_AUTH_DATABASE_URL,
  storageBucket: import.meta.env.VITE_AUTH_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_AUTH_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_AUTH_APP_ID,
  measurementId: import.meta.env.VITE_AUTH_MEASUREMENTID,
};

// Initialize Firebase
const authApp = initializeApp(firebaseAuthConfig, "authApp");
export const auth = getAuth(authApp);
export const db = getFirestore(authApp);
export const storage = getStorage(authApp);
// console.log("Firebase Config:", firebaseAuthConfig);
