import { openDB } from "idb";

const DB_NAME = "main-cart-db";
const STORE_NAME = "cart";
const DB_VERSION = 1;

const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

/* ---------------------------
   GET CART
---------------------------- */
export const getCart = async (uid) => {
  if (!uid) return [];
  const db = await getDB();
  const cart = await db.get(STORE_NAME, uid);
  return Array.isArray(cart) ? cart : [];
};

/* ---------------------------
   SET CART
---------------------------- */
export const setCart = async (uid, cart) => {
  if (!uid || !Array.isArray(cart)) return;
  const db = await getDB();
  await db.put(STORE_NAME, cart, uid);
};

/* ---------------------------
   CLEAR CART
---------------------------- */
export const clearCartDB = async (uid) => {
  if (!uid) return;
  const db = await getDB();
  await db.delete(STORE_NAME, uid);
};
