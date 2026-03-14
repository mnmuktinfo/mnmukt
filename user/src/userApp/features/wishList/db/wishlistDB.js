import { openDB } from "idb";

const DB_NAME = "wishlist-db";
const STORE = "wishlist";

let dbPromise;

/*
──────────────── DB CONNECTION
Only opens once
────────────────
*/
const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, {
            keyPath: "productId",
          });

          // helpful for sorting / analytics
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }

  return dbPromise;
};

/*
──────────────── Get All Wishlist
────────────────
*/
export const getWishlistDB = async () => {
  const db = await getDB();
  return db.getAll(STORE);
};

/*
──────────────── Add Item
────────────────
*/
export const addWishlistDB = async (productId) => {
  const db = await getDB();

  if (!productId) throw new Error("Invalid productId");

  const item = {
    productId: productId.toString(),
    createdAt: Date.now(),
  };

  await db.put(STORE, item);

  return item;
};

/*
──────────────── Remove Item
────────────────
*/
export const removeWishlistDB = async (productId) => {
  const db = await getDB();

  if (!productId) return;

  await db.delete(STORE, productId.toString());
};

/*
──────────────── Clear Wishlist
────────────────
*/
export const clearWishlistDB = async () => {
  const db = await getDB();

  await db.clear(STORE);
};

/*
──────────────── Optional Helpers
────────────────
*/

/* get wishlist sorted by newest */
export const getWishlistSortedDB = async () => {
  const db = await getDB();

  const tx = db.transaction(STORE);
  const index = tx.store.index("createdAt");

  return index.getAll(null, "prev");
};