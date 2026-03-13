import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase"; 

// Helper to remove undefined/null values
const sanitize = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v ?? ""]));

// Generates a stable, unique 4-digit order ID based on the user's name
export const makeOrderId = (name = "user") => {
  const prefix = name.replace(/\s+/g, "").toLowerCase().slice(0, 4);
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${suffix}`;
};

/**
 * Writes the order to both `orders` (lightweight) and `orders_detailed` (full snapshot) atomically.
 */
export const createOrder = async ({ orderId, user, selectedAddress, items, totalAmount }) => {
  const now = serverTimestamp();
  
  // Create a safe static date for arrays
  const staticNow = new Date().toISOString(); 

  // 1. Map items
  const mappedItems = items.map((item) => ({
    productId: item.id,
    name: item.name,
    image: Array.isArray(item.images) ? item.images[0] : item.image || "",
    price: Number(item.price),
    quantity: Number(item.selectedQuantity || 1),
    selectedSize: item.selectedSize || "N/A",
    lineTotal: Number(item.price) * Number(item.selectedQuantity || 1),
  }));

  // 2. Format delivery address
  const deliveryAddress = sanitize({
    line1: selectedAddress.line1 || selectedAddress.addressLine1 || "",
    city: selectedAddress.city,
    state: selectedAddress.state,
    pincode: selectedAddress.pincode,
    name: selectedAddress.name || user.name,
    phone: selectedAddress.phone || user.phone,
  });

  // 3. Lightweight Payload (For UI Listings)
  const lightPayload = {
    orderId,
    userId: user.uid,
    userName: user.name || "",
    userEmail: user.email || "",
    totalAmount: Number(totalAmount),
    itemCount: mappedItems.length,
    previewItem: {
      name: mappedItems[0]?.name || "",
      image: mappedItems[0]?.image || "",
    },
    deliveryCity: deliveryAddress.city,
    deliveryState: deliveryAddress.state,
    status: "PLACED",
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    createdAt: now,
    updatedAt: now,
  };

  // 4. Detailed Payload (For Admin/Invoices)
  const detailedPayload = {
    orderId,
    userId: user.uid,
    userSnapshot: {
      uid: user.uid,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
    },
    deliveryAddress,
    items: mappedItems,
    pricing: {
      subtotal: Number(totalAmount),
      discount: 0,
      platformFee: 0,
      deliveryFee: 0,
      totalAmount: Number(totalAmount),
    },
    payment: {
      method: "COD",
      status: "PENDING",
      paidAt: null,
      refundAt: null,
    },
    status: "PLACED",
    timeline: [
      {
        status: "PLACED",
        timestamp: staticNow, // <-- FIXED: Safe string for arrays
        note: "Order placed by customer",
      }
    ],
    platform: "web",
    createdAt: now,
    updatedAt: now,
  };

  // 5. Write atomically using Batch
  const batch = writeBatch(db);
  const lightRef = doc(collection(db, "orders"));
  const detailedRef = doc(collection(db, "orders_detailed"));

  batch.set(lightRef, lightPayload);
  batch.set(detailedRef, detailedPayload);

  await batch.commit();

  return { lightId: lightRef.id, detailedId: detailedRef.id };
};