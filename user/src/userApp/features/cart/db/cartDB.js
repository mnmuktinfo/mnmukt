import { openDB } from "idb";

const DB_NAME = "cart-db";
const STORE = "cart";

const getDB = () =>
  // 🔥 FIXED: Bumped version to 2 to trigger the schema upgrade
  openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      // If the old store exists with the wrong keyPath, delete it first
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE);
      }
      // 🔥 FIXED: keyPath is now "cartKey" to support product variants
      db.createObjectStore(STORE, { keyPath: "cartKey" });
    },
  });

export const getCartDB = async () => {
  const db = await getDB();
  return db.getAll(STORE);
};

export const addCartDB = async (item) => {
  const db = await getDB();
  
  // Safety check: Ensure the item has a cartKey before saving
  if (!item.cartKey) {
    console.error("Cannot add to DB: Item is missing 'cartKey'", item);
    return;
  }

  await db.put(STORE, item);
};

// 🔥 FIXED: Renamed parameter to 'cartKey' for clarity
export const updateCartDB = async (cartKey, data) => {
  const db = await getDB();
  const item = await db.get(STORE, cartKey);
  
  if (item) {
    await db.put(STORE, { ...item, ...data });
  } else {
    // Fallback: If it doesn't exist for some reason, just put the new data
    await db.put(STORE, data);
  }
};

// 🔥 FIXED: Renamed parameter to 'cartKey' for clarity
export const removeCartDB = async (cartKey) => {
  const db = await getDB();
  await db.delete(STORE, cartKey);
};

export const clearCartDB = async () => {
  const db = await getDB();
  await db.clear(STORE);
};