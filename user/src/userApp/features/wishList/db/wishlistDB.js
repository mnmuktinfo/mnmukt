import { openDB } from "idb";

const DB_NAME = "wishlist-db";
const STORE = "wishlist";

const getDB = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "productId" });
      }
    },
  });

export const getWishlistDB = async () => {
  const db = await getDB();
  return await db.getAll(STORE);
};

export const addWishlistDB = async (productId) => {
  const db = await getDB();
  if (!productId) throw new Error("Invalid productId");
  const item = { productId: productId.toString(), createdAt: Date.now() };
  await db.put(STORE, item);  // works fine now
  return item;
};



export const removeWishlistDB = async (productId) => {
  const db = await getDB();
  await db.delete(STORE, productId);
};

export const clearWishlistDB = async () => {
  const db = await getDB();
  await db.clear(STORE);
};
