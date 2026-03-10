import { db } from "../../../../config/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

// FETCH CART
export const fetchCart = async (uid) => {
  const ref = collection(db, "carts", uid, "cartItems");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ADD TO CART
export const addToCart = async (uid, item) => {
  const cartRef = collection(db, "carts", uid, "cartItems");
  const variantKey = `${item.productId}_${item.size || ""}`;

  const q = query(cartRef, where("variantKey", "==", variantKey));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const docSnap = snap.docs[0];
    const existingQty = docSnap.data().quantity || 1;
    await updateDoc(docSnap.ref, {
      quantity: existingQty + (item.quantity || 1),
    });
  } else {
    const newRef = doc(cartRef);
    await setDoc(newRef, {
      ...item,
      id: newRef.id,
      variantKey,
      quantity: item.quantity || 1,
      addedAt: Date.now(),
    });
  }

  return fetchCart(uid);
};

// UPDATE QTY
export const updateQty = async (uid, cartItemId, quantity) => {
  const ref = doc(db, "carts", uid, "cartItems", cartItemId);
  await updateDoc(ref, { quantity });
  return fetchCart(uid);
};

// REMOVE ITEM
export const removeFromCart = async (uid, cartItemId) => {
  const ref = doc(db, "carts", uid, "cartItems", cartItemId);
  await deleteDoc(ref);
  return fetchCart(uid);
};

// CLEAR CART
export const clearCart = async (uid) => {
  const ref = collection(db, "carts", uid, "cartItems");
  const snap = await getDocs(ref);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  return [];
};
