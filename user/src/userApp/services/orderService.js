/**
 * ORDER SERVICE
 *
 * Production architecture for scalable e-commerce using Firebase Firestore.
 *
 * Goals:
 *  - Minimize Firestore reads/writes
 *  - Support item-level cancel/return
 *  - Fast user order list via lightweight subcollection
 *  - Atomic order creation via batch
 *
 * Firestore Structure:
 *
 *  orders/{orderId}
 *    ├── items/{itemId}
 *    ├── payments/{paymentId}
 *    └── timeline/{eventId}
 *
 *  users/{userId}/orders/{orderId}   ← lightweight list view
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

import { db } from "../../config/firebase";
// import { collection, query, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
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

  /* ── Items subcollection ── */
  items.forEach((item) => {
    const itemRef = doc(collection(orderRef, "items"));
    batch.set(itemRef, {
      productId: item.id,
      name: item.name ?? "",
      image: item.image ?? "",
      price: Number(item.price) || 0,
      quantity: item.quantity || item.selectedQuantity || 1, // ✅ normalized field first
      selectedSize: item.size || item.selectedSize || "",
      itemStatus: "placed",
      shipmentStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
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

  /* ── Lightweight user order (for list view) ── */
  const previewItem = items[0];
  batch.set(doc(db, "users", user.uid, "orders", orderId), {
    orderId,
    orderStatus: "placed",
    paymentStatus: "pending",
    totalAmount: pricing.totalPayable ?? pricing.totalAmount,
    itemCount: items.length,
    previewItem: {
      name: previewItem?.name ?? "",
      image: previewItem?.image ?? "",
      price: previewItem?.price ?? 0,
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

  /* ── Fetch paginated user orders ── */
  async getUserOrders(userId, maxResults = 20, lastDoc = null) {
    
  if (!userId) {
    console.log("No userId provided");
    return { orders: [], lastDoc: null };
  }

  const constraints = [orderBy("createdAt", "desc"), limit(maxResults)];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, "users", userId, "orders"), ...constraints);

  console.log("Firestore query constraints:", constraints);

  try {
    const snap = await getDocs(q);

    console.log("Fetched documents:", snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })));

    return {
      orders: snap.docs.map(d => ({ id: d.id, ...d.data() })),
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    };
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return { orders: [], lastDoc: null };
  }
},




  /* ── Fetch full order with items ── */
  async getOrderDetails(orderId) {
    if (!orderId) return null;

    try {
      const orderSnap = await getDoc(doc(db, "orders", orderId));
      if (!orderSnap.exists()) return null;

      const itemsSnap = await getDocs(
        collection(db, "orders", orderId, "items"),
      );

      return {
        id: orderSnap.id,
        ...orderSnap.data(),
        items: itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      };
    } catch (err) {
      console.error("Error fetching order details:", err);
      return null;
    }
  },

  /* ── Cancel a single item ── */
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

  /* ── Request item return ── */
  async requestReturn(orderId, itemId, reason = "") {
    await updateDoc(doc(db, "orders", orderId, "items", itemId), {
      itemStatus: "return_requested",
      returnReason: reason,
      updatedAt: serverTimestamp(),
    });
  },
};





