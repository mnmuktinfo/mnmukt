// Safety check

import { db as oldDB } from "./firebaseDB";     // OLD Firestore project
import { db } from "./firebaseAuth";            // NEW Firestore project

import {
  collection,
  getDocs,
  doc,
  writeBatch,
} from "firebase/firestore";
const checkProjects = () => {
  if (oldDB.app.options.projectId === db.app.options.projectId) {
    throw new Error("OLD and NEW project IDs are the same!");
  }
};

const migrateCollection = async (collectionName) => {
  console.log(`🚀 Starting migration: ${collectionName}`);

  const snapshot = await getDocs(collection(oldDB, collectionName));

  if (snapshot.empty) {
    console.warn(`No documents found in ${collectionName}`);
    return 0;
  }

  let batch = writeBatch(db);
  let count = 0;
  let total = 0;

  for (const docSnap of snapshot.docs) {
    batch.set(
      doc(db, collectionName, docSnap.id),
      docSnap.data()
    );

    count++;

    if (count === 500) {
      await batch.commit();
      total += count;
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    total += count;
  }

  return total;
};
const migrateSingle = async (collectionName) => {
  try {
    checkProjects();

    const count = await migrateCollection(collectionName);

    console.log(`✅ ${collectionName}: ${count} migrated`);
    alert(`✅ ${collectionName} migrated successfully!\nDocuments: ${count}`);

    return count;
  } catch (err) {
    console.error(`❌ ${collectionName}:`, err);
    alert(`❌ ${collectionName} migration failed!\n${err.message}`);
    return 0;
  }
};

// Individual exports
export const migrateCategories = () => migrateSingle("categories");
export const migrateProducts = () => migrateSingle("products");
export const migrateTestimonials = () => migrateSingle("testimonials");
export const migrateItemsCollection = () => migrateSingle("itemsCollection");

// Migrate everything
export const migrateAll = async () => {
  await migrateCategories();
  await migrateProducts();
  await migrateTestimonials();
  await migrateItemsCollection();
};