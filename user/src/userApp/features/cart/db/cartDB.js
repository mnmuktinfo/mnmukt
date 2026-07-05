import { openDB } from "idb";

const DB_NAME = "cart-db";
const DB_VERSION = 2;
const STORE = "cart";

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {

      // Create only if it doesn't exist
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, {
          keyPath: "cartKey",
        });
      }

      // Migration logic if needed later
      if (oldVersion < 2) {
        console.log(
          "Cart DB upgraded → v2"
        );
      }
    },
  });

export const getCartDB = async () => {
  const db = await getDB();

  return await db.getAll(STORE);
};

export const addCartDB = async (item) => {
  const db = await getDB();

  if (!item?.cartKey) {
    console.error(
      "Cannot add to DB: missing cartKey",
      item
    );

    return;
  }

  await db.put(STORE, item);
};

export const updateCartDB = async (
  cartKey,
  data
) => {
  const db = await getDB();

  const existing =
    await db.get(STORE, cartKey);

  if (existing) {
    await db.put(STORE, {
      ...existing,
      ...data,
    });
  } else {
    await db.put(STORE, data);
  }
};

export const removeCartDB = async (
  cartKey
) => {
  const db = await getDB();

  await db.delete(
    STORE,
    cartKey
  );
};

export const clearCartDB = async () => {
  const db = await getDB();

  await db.clear(STORE);
};