import { db } from "../../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- Function to Place Order in Firebase ---
export const placeOrder = async (user, cartItems, shippingDetails, totalAmount) => {
  try {
    const orderData = {
      userId: user.uid, // Attached User ID
      customerDetails: {
        name: shippingDetails.name,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        city: shippingDetails.city,
        pincode: shippingDetails.pincode
      },
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      pricing: {
        subtotal: totalAmount,
        deliveryCharges: 0, 
        total: totalAmount 
      },
      status: "pending",
      orderDate: serverTimestamp(),
      platform: "web"
    };

    // Save to Firestore 'taruvedaorders' collection
    const docRef = await addDoc(collection(db, "taruvedaorders"), orderData);
    return { success: true, orderId: docRef.id };

  } catch (error) {
    console.error("Error placing order:", error);
    return { success: false, error: error.message };
  }
};

// --- Function to Generate WhatsApp Message ---
export const generateWhatsAppLink = (orderId, details, items, total) => {
  const phoneNumber = "919876543210"; // REPLACE with your number
  
  let message = `*🌿 New Order Request from Website* \n`;
  message += `*Order ID:* ${orderId}\n`;
  message += `---------------------------\n`;
  
  message += `*👤 Customer:*\n`;
  message += `${details.name}\n${details.phone}\n`;
  message += `${details.address}, ${details.city} - ${details.pincode}\n\n`;
  
  message += `*🛒 Items:*\n`;
  items.forEach(item => {
    message += `▪️ ${item.name} (x${item.qty}) - ₹${item.price * item.qty}\n`;
  });
  
  message += `---------------------------\n`;
  message += `*💰 Total Amount: ₹${total}*\n`;
  message += `\n_Please confirm my order._`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};