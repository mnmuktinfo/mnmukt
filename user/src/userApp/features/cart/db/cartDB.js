import { openDB } from "idb";

const DB_NAME = "cart-db";
const DB_VERSION = 3;
const STORE = "cart";

// Composite key so the same product+size can exist independently per scope
const makeId = (scope, cartKey) => `${scope}::${cartKey}`;

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, tx) {
      if (oldVersion < 3) {
        // Migrate old unscoped items (keyPath was "cartKey") into "guest" scope
        let oldItems = [];
        if (db.objectStoreNames.contains(STORE)) {
          oldItems = await tx.objectStore(STORE).getAll();
          db.deleteObjectStore(STORE);
        }

        const newStore = db.createObjectStore(STORE, { keyPath: "id" });
        newStore.createIndex("scope", "scope");

        for (const item of oldItems) {
          const scope = item.scope || "guest";
          newStore.put({
            ...item,
            scope,
            id: makeId(scope, item.cartKey),
          });
        }
      } else if (!db.objectStoreNames.contains(STORE)) {
        const newStore = db.createObjectStore(STORE, { keyPath: "id" });
        newStore.createIndex("scope", "scope");
      }
    },
  });

export const getCartDB = async (scope = "guest") => {
  const db = await getDB();
  return await db.getAllFromIndex(STORE, "scope", scope);
};

export const addCartDB = async (scope = "guest", item) => {
  const db = await getDB();

  if (!item?.cartKey) {
    console.error("Cannot add to DB: missing cartKey", item);
    return;
  }

  await db.put(STORE, {
    ...item,
    scope,
    id: makeId(scope, item.cartKey),
  });
};

export const updateCartDB = async (scope = "guest", cartKey, data) => {
  const db = await getDB();
  const id = makeId(scope, cartKey);
  const existing = await db.get(STORE, id);

  await db.put(STORE, {
    ...(existing || {}),
    ...data,
    scope,
    cartKey,
    id,
  });
};

export const removeCartDB = async (scope = "guest", cartKey) => {
  const db = await getDB();
  await db.delete(STORE, makeId(scope, cartKey));
};

export const clearCartDB = async (scope = "guest") => {
  const db = await getDB();
  const items = await getCartDB(scope);
  const tx = db.transaction(STORE, "readwrite");
  await Promise.all(items.map((item) => tx.store.delete(item.id)));
  await tx.done;
};