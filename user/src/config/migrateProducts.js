import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseAuth";

/* ───────── OLD FIREBASE (SOURCE) ───────── */
const oldConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const oldApp =
  getApps().find((app) => app.name === "oldApp") ||
  initializeApp(oldConfig, "oldApp");

const oldDB = getFirestore(oldApp);

/* ───────── DIAGNOSTIC CHECK ───────── */
console.log("📤 OLD project:", oldDB.app.options.projectId);
console.log("📥 NEW project:", db.app.options.projectId);

/* ───────── REUSABLE MIGRATE FUNCTION ───────── */
const migrateCollection = async (collectionName) => {
  console.log(`\n🚀 Starting migration for: ${collectionName}`);

  const snapshot = await getDocs(collection(oldDB, collectionName));
  console.log(`📦 Found ${snapshot.size} docs in "${collectionName}"`);

  if (snapshot.empty) {
    console.warn(`⚠️ No documents found in "${collectionName}", skipping...`);
    return 0;
  }

  const BATCH_LIMIT = 500;
  let batch = writeBatch(db);
  let count = 0;
  let totalMigrated = 0;

  for (const docSnap of snapshot.docs) {
    console.log(`➡️ Migrating [${collectionName}]:`, docSnap.id);
    batch.set(doc(db, collectionName, docSnap.id), docSnap.data());
    count++;

    if (count === BATCH_LIMIT) {
      console.log(`🟡 Committing batch of ${count}...`);
      await batch.commit();
      totalMigrated += count;
      batch = writeBatch(db);
      count = 0;
    }
  }

  // Commit remaining
  if (count > 0) {
    console.log(`🟡 Committing final batch of ${count}...`);
    await batch.commit();
    totalMigrated += count;
  }

  // ✅ Verify write succeeded
  const verify = await getDocs(collection(db, collectionName));
  console.log(`🔍 Verified in NEW DB [${collectionName}]:`, verify.size, "docs");

  return totalMigrated;
};

/* ───────── MAIN MIGRATION (categories + products) ───────── */
export const migrateAll = async () => {
  try {
    // 🔴 Safety check — must be different projects
    if (oldDB.app.options.projectId === db.app.options.projectId) {
      console.error("❌ OLD and NEW project IDs are the same! Aborting.");
      alert("❌ ERROR: Both DBs point to the same project! Check your .env file.");
      return;
    }

    const categoriesCount = await migrateCollection("categories");
    const productsCount = await migrateCollection("products");

    console.log("\n✅ MIGRATION COMPLETE!");
    console.log("📊 Categories migrated:", categoriesCount);
    console.log("📊 Products migrated:", productsCount);
    alert(`✅ Migration Done!\nCategories: ${categoriesCount}\nProducts: ${productsCount}`);

  } catch (err) {
    console.error("❌ ERROR CODE:", err.code);
    console.error("❌ ERROR MESSAGE:", err.message);
    alert(`❌ Migration failed: ${err.message}`);
  }
};

/* ───────── INDIVIDUAL EXPORTS (optional) ───────── */
export const migrateCategories = () => migrateCollection("categories");
export const migrateProducts = () => migrateCollection("products");