import { openDB } from "idb";

const DB_NAME = "cart-db";
const STORE = "cart";

const getDB = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      // keyPath: "id" means every object saved MUST have an 'id' property
      db.createObjectStore(STORE, { keyPath: "id" });
    },
  });

export const getCartDB = async () => {
  const db = await getDB();
  return db.getAll(STORE);
};

// 🔥 FIXED: Now accepts the full 'item' object instead of just 'id'
export const addCartDB = async (item) => {
  const db = await getDB();
  
  // Safety check: Ensure the item has an ID before saving
  if (!item.id) {
    console.error("Cannot add to DB: Item is missing 'id'", item);
    return;
  }

  // We save the 'item' directly because it already contains { id, selectedQuantity, selectedSize }
  // passed from ProductCard -> CartContext -> Here.
  await db.put(STORE, item);
};

export const updateCartDB = async (id, data) => {
  const db = await getDB();
  const item = await db.get(STORE, id);
  if (item) {
    await db.put(STORE, { ...item, ...data });
  }
};

export const removeCartDB = async (id) => {
  const db = await getDB();
  await db.delete(STORE, id);
};

export const clearCartDB = async () => {
  const db = await getDB();
  await db.clear(STORE);
};