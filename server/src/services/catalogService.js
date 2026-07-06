"use strict";

// Use the shared, already-initialized Firestore handle instead of calling
// admin.firestore() independently — avoids an implicit initialization-order
// dependency on ../config/firebase.config.js having run first.
// Adjust the relative path below to match your actual project layout.
const { db } = require("../config/firebaseAdmin");
const { FieldValue, FieldPath } = require("firebase-admin/firestore");

const PRODUCTS_COLLECTION = "products";

/* =========================================================
   FETCH PRODUCTS BY ID
   Single source of truth for price/name/sku/stock at order-creation
   time. The order controller must NEVER trust these fields from the
   client — always call this and overwrite whatever req.body sent.

   Returns: Map<productId, { id, name, price, sku, slug, image, stock, isActive }>
   Missing/deleted products are simply absent from the returned Map —
   callers must check for that and reject the order.
========================================================= */
async function fetchProductsByIds(productIds) {
  const uniqueIds = [...new Set(productIds)].filter(Boolean);
  if (uniqueIds.length === 0) return new Map();

  // Firestore's `in` / documentId() queries cap at 30 values per query,
  // so batch large carts instead of assuming one call covers everything.
  const BATCH_SIZE = 30;
  const batches = [];
  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    batches.push(uniqueIds.slice(i, i + BATCH_SIZE));
  }

  const result = new Map();

  await Promise.all(
    batches.map(async (batchIds) => {
      const snap = await db
        .collection(PRODUCTS_COLLECTION)
        .where(FieldPath.documentId(), "in", batchIds)
        .get();

      snap.forEach((doc) => {
        const data = doc.data();

        // Skip soft-deleted / disabled products entirely — treat them as
        // "not found" so the order controller rejects the item instead
        // of silently selling something that's been pulled from sale.
        if (data.isActive === false || data.isDeleted === true) return;

        result.set(doc.id, {
          id: doc.id,
          name: data.name,
          price: Number(data.price) || 0,
          sku: data.sku,
          slug: data.slug || doc.id,
          image: Array.isArray(data.images) ? data.images[0] : data.image,
          stock: typeof data.stock === "number" ? data.stock : null, // null = untracked stock
          isActive: data.isActive !== false,
        });
      });
    })
  );

  return result;
}

/* =========================================================
   RESERVE STOCK
   Atomically decrements stock for every item in a single Firestore
   transaction — either ALL items succeed or NONE do, and concurrent
   checkouts for the same product can never both succeed past
   available stock (Firestore transactions retry automatically on
   contention, so this is safe under concurrent load).

   verifiedItems: [{ productId, quantity, name }]
   Throws a plain Error with a customer-facing message on failure —
   the caller (order controller) should catch it and respond 409.
========================================================= */
async function reserveStock(verifiedItems) {
  await db.runTransaction(async (tx) => {
    const refs = verifiedItems.map((item) =>
      db.collection(PRODUCTS_COLLECTION).doc(item.productId)
    );

    // All reads must happen before any writes in a Firestore transaction.
    const snaps = await Promise.all(refs.map((ref) => tx.get(ref)));

    snaps.forEach((snap, i) => {
      const item = verifiedItems[i];

      if (!snap.exists) {
        throw new Error(`Product ${item.name || item.productId} is no longer available`);
      }

      const data = snap.data();

      // Products without stock tracking (stock === undefined) are treated
      // as always-in-stock (e.g. made-to-order items) — skip the check.
      if (typeof data.stock !== "number") return;

      if (data.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name || item.productId}`);
      }
    });

    snaps.forEach((snap, i) => {
      const data = snap.data();
      if (typeof data.stock !== "number") return;

      const item = verifiedItems[i];
      tx.update(refs[i], {
        stock: FieldValue.increment(-item.quantity),
      });
    });
  });
}

/* =========================================================
   RELEASE STOCK
   Reverses a reservation — call this when an order is cancelled or
   payment ultimately fails/expires after stock was already reserved.
   Safe to call even for products without stock tracking (no-op there).
========================================================= */
async function releaseStock(items) {
  await db.runTransaction(async (tx) => {
    const refs = items.map((item) =>
      db.collection(PRODUCTS_COLLECTION).doc(item.productId)
    );
    const snaps = await Promise.all(refs.map((ref) => tx.get(ref)));

    snaps.forEach((snap, i) => {
      if (!snap.exists) return; // product deleted since order was placed — nothing to release
      const data = snap.data();
      if (typeof data.stock !== "number") return;

      tx.update(refs[i], {
        stock: FieldValue.increment(items[i].quantity),
      });
    });
  });
}

module.exports = {
  fetchProductsByIds,
  reserveStock,
  releaseStock,
};