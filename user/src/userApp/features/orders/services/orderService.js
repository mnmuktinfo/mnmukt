/**
 * ORDER SERVICE
 *
 * Production architecture for scalable e-commerce using Firebase Firestore.
 *
 * Firestore Structure:
 *   orders/{orderId}
 *     ├── items/{itemId}
 *     ├── payments/{paymentId}
 *     └── timeline/{eventId}
 *
 *   users/{userId}/orders/{orderId}  ← lightweight list + full items array
 */

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../../../config/firebaseAuth";

/* ─────────────────────────────────────
   ORDER ID GENERATOR
   e.g. ravi-KR4M7D
───────────────────────────────────── */
export const makeOrderId = (name = "user") => {
  const prefix = name.replace(/\s+/g, "").toLowerCase().slice(0, 4);
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${time}${rand}`;
};

/* ─────────────────────────────────────
   CREATE ORDER
   - Writes root order doc
   - Writes items subcollection
   - Writes payment record
   - Writes timeline entry
   - Writes lightweight user/orders doc WITH full items array
     (so list view never needs a second fetch)
───────────────────────────────────── */
export const createOrder = async ({
  orderId,
  user,
  selectedAddress,
  items,
  pricing,
  paymentMethod = "cod",
}) => {
  if (!user?.uid) throw new Error("User not authenticated");
  if (!items?.length) throw new Error("Order items missing");
  if (!selectedAddress) throw new Error("Delivery address missing");

  const now = serverTimestamp();
  const batch = writeBatch(db);
  const orderRef = doc(db, "orders", orderId);

  /* ── Root order document ── */
  batch.set(orderRef, {
    orderId,
    userId: user.uid,
    orderStatus: "placed",
    paymentStatus: "pending",
    itemCount: items.length,
    totalAmount: pricing.totalPayable ?? pricing.totalAmount,
    pricing,
    addressSnapshot: {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      line1: selectedAddress.line1 || selectedAddress.addressLine1 || "",
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
    },
    createdAt: now,
    updatedAt: now,
  });

  /* ── Normalise items for storage ── */
  const normalisedItems = items.map((item) => ({
    productId: item.id || item.productId || "",
    name: item.name ?? "",
    image: item.image ?? "",
    description: item.description ?? "",
    price: Number(item.price) || 0,
    quantity: item.quantity || item.selectedQuantity || 1,
    selectedSize: item.size || item.selectedSize || "",
    itemStatus: "placed",
    shipmentStatus: "pending",
  }));

  /* ── Items subcollection (for order-detail page) ── */
  normalisedItems.forEach((item) => {
    const itemRef = doc(collection(orderRef, "items"));
    batch.set(itemRef, { ...item, createdAt: now, updatedAt: now });
  });

  /* ── Payment record ── */
  batch.set(doc(collection(orderRef, "payments")), {
    method: paymentMethod,
    status: "pending",
    amount: pricing.totalPayable ?? pricing.totalAmount,
    createdAt: now,
  });

  /* ── Timeline entry ── */
  batch.set(doc(collection(orderRef, "timeline")), {
    status: "placed",
    note: "Order created",
    timestamp: now,
  });

  /*
   * ── Lightweight user order (list view) ──
   *
   * KEY CHANGE: We store the full `items` array here so that
   * getUserOrders() can return everything OrderCard needs in a
   * single Firestore read — no extra per-order fetches.
   *
   * previewItem is still stored for backward compatibility.
   */
  const previewItem = normalisedItems[0];
  batch.set(doc(db, "users", user.uid, "orders", orderId), {
    orderId,
    orderStatus: "placed",
    paymentStatus: "pending",
    totalAmount: pricing.totalPayable ?? pricing.totalAmount,
    itemCount: items.length,
    // Full items array — powers the OrderCard list view
    items: normalisedItems,
    // Legacy preview field — kept for any existing code that reads it
    previewItem: {
      name: previewItem?.name ?? "",
      image: previewItem?.image ?? "",
      price: previewItem?.price ?? 0,
      description: previewItem?.description ?? "",
    },
    addressSnapshot: {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
    },
    createdAt: now,
  });

  await batch.commit();
  return { orderId };
};

/* ─────────────────────────────────────
   ORDER SERVICE
───────────────────────────────────── */
export const orderService = {

  /**
   * getUserOrders
   *
   * Fetches the lightweight user/orders subcollection which now contains
   * the full items array written at order-creation time.
   *
   * One Firestore query → complete data for every OrderCard. No N+1 reads.
   */
  async getUserOrders(userId, maxResults = 20, lastDoc = null) {
    if (!userId) {
      console.warn("[orderService] getUserOrders: no userId provided");
      return { orders: [], lastDoc: null };
    }

    const constraints = [orderBy("createdAt", "desc"), limit(maxResults)];
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(
      collection(db, "users", userId, "orders"),
      ...constraints
    );

    try {
      const snap = await getDocs(q);
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log(`[orderService] fetched ${orders.length} orders for user ${userId}`);
      return {
        orders,
        lastDoc: snap.docs[snap.docs.length - 1] ?? null,
      };
    } catch (err) {
      console.error("[orderService] getUserOrders error:", err);
      return { orders: [], lastDoc: null };
    }
  },

  /**
   * getOrderDetails
   *
   * Fetches the full order document + items subcollection.
   * Use this on the Order Detail page where you need timeline,
   * payment info, and per-item status history.
   */
  async getOrderDetails(orderId) {
    if (!orderId) return null;

    try {
      const [orderSnap, itemsSnap] = await Promise.all([
        getDoc(doc(db, "orders", orderId)),
        getDocs(collection(db, "orders", orderId, "items")),
      ]);

      if (!orderSnap.exists()) return null;

      return {
        id: orderSnap.id,
        ...orderSnap.data(),
        items: itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      };
    } catch (err) {
      console.error("[orderService] getOrderDetails error:", err);
      return null;
    }
  },

  /**
   * updateOrderStatusInUserDoc
   *
   * Call this from your backend/admin or cloud function whenever an order's
   * status changes. Keeps the lightweight user doc in sync so the list view
   * always shows the correct status without a full re-fetch.
   */
  async updateOrderStatusInUserDoc(userId, orderId, updates = {}) {
    if (!userId || !orderId) return;
    try {
      await updateDoc(
        doc(db, "users", userId, "orders", orderId),
        { ...updates, updatedAt: serverTimestamp() }
      );
    } catch (err) {
      console.error("[orderService] updateOrderStatusInUserDoc error:", err);
    }
  },

  /**
   * cancelItem
   *
   * Cancels a single item inside an order. Also adds a timeline entry.
   * After calling this, call updateOrderInCache() in the UI to reflect
   * the change without a refetch.
   */
  async cancelItem(orderId, itemId, reason = "") {
    const now = serverTimestamp();
    const batch = writeBatch(db);

    batch.update(doc(db, "orders", orderId, "items", itemId), {
      itemStatus: "cancelled",
      cancelReason: reason,
      updatedAt: now,
    });

    batch.set(doc(collection(db, "orders", orderId, "timeline")), {
      status: "item_cancelled",
      itemId,
      note: reason,
      timestamp: now,
    });

    await batch.commit();
  },

  /**
   * requestReturn
   *
   * Marks an item as return_requested and logs reason.
   */
  async requestReturn(orderId, itemId, reason = "") {
    await updateDoc(doc(db, "orders", orderId, "items", itemId), {
      itemStatus: "return_requested",
      returnReason: reason,
      updatedAt: serverTimestamp(),
    });
  },
};