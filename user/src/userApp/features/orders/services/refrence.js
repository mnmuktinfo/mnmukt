// # Order + Payment API — Frontend Integration Guide

// Base URL: `/api/v1`

// Auth: send `Authorization: Bearer <firebaseToken>` for logged-in users.
// Omit it entirely for guest checkout (guest fields become required instead).

// ---

// ## 1. Create Order

// `POST /orders`

// Auth: optional (guest or logged-in)

// ### Payload — logged-in user
// ```json
// {
//   "items": [
//     {
//       "productId": "PROD123",
//       "sku": "SKU-RED-M",
//       "slug": "cotton-tshirt",
//       "name": "Cotton T-Shirt",
//       "image": "https://cdn.example.com/tshirt.jpg",
//       "variant": { "size": "M", "color": "Red" },
//       "quantity": 2,
//       "price": 599
//     }
//   ],
//   "shippingAddress": {
//     "fullName": "Rahul Sharma",
//     "phone": "9876543210",
//     "addressLine1": "123 MG Road",
//     "addressLine2": "Near City Mall",
//     "city": "Saharanpur",
//     "state": "Uttar Pradesh",
//     "postalCode": "247001",
//     "country": "India"
//   },
//   "pricing": {
//     "subtotal": 1198,
//     "discount": 100,
//     "shipping": 0,
//     "tax": 54,
//     "total": 1152
//   },
//   "paymentMethod": "razorpay",
//   "customerNote": "Please deliver after 6 PM"
// }
// ```

// ### Payload — guest user (add these two fields)
// ```json
// {
//   "...": "same as above, plus:",
//   "customerEmail": "guest@example.com",
//   "customerName": "Rahul Sharma"
// }
// ```

// > `pricing.subtotal/discount/tax/shipping/total` from the frontend are used as a hint —
// > the backend recalculates `subtotal` and `total` from `items` itself in `pre('validate')`,
// > so send your best estimate but don't rely on the client value being final.

// ### Response `201`
// ```json
// {
//   "success": true,
//   "data": {
//     "orderId": "ORD20260704A1B2C3D4",
//     "orderStatus": "pending",
//     "paymentStatus": "pending",
//     "trackingUrl": "/order-tracking/ORD20260704A1B2C3D4?email=guest%40example.com"
//   }
// }
// ```

// Save `orderId` from this response — you need it for the next step (Razorpay).

// ---

// ## 2. Create Razorpay Order (get payment session)

// `POST /payments/create-order`

// Auth: optional (same rule — token or guest email)

// ### Payload
// ```json
// {
//   "orderId": "ORD20260704A1B2C3D4",
//   "customerEmail": "guest@example.com"
// }
// ```
// `customerEmail` required only for guests. Logged-in users can omit it — access is checked via the Bearer token.

// > Do **not** send `amount` from the frontend expecting it to set the charge — the backend
// > always charges `order.pricing.total` from the DB, ignoring any client-supplied amount.

// ### Response `200`
// ```json
// {
//   "success": true,
//   "data": {
//     "id": "order_NqXXXXXXXXXXXX",
//     "amount": 115200,
//     "currency": "INR",
//     "status": "created"
//   }
// }
// ```

// Use `data.id`, `data.amount`, `data.currency` to open Razorpay Checkout on the frontend:

// ```js
// const options = {
//   key: RAZORPAY_KEY_ID,          // your public key, not the secret
//   amount: data.amount,
//   currency: data.currency,
//   order_id: data.id,
//   name: "Your Store",
//   prefill: {
//     name: customerName,
//     email: customerEmail,
//     contact: phone,
//   },
//   handler: async function (response) {
//     // response.razorpay_order_id, razorpay_payment_id, razorpay_signature
//     await verifyPayment(response);
//   },
// };
// new window.Razorpay(options).open();
// ```

// ---

// ## 3. Verify Payment

// `POST /payments/verify`

// Auth: optional (same rule)

// Called from the Razorpay Checkout `handler` callback after the user completes payment.

// ### Payload
// ```json
// {
//   "orderId": "ORD20260704A1B2C3D4",
//   "razorpay_order_id": "order_NqXXXXXXXXXXXX",
//   "razorpay_payment_id": "pay_NqYYYYYYYYYYYY",
//   "razorpay_signature": "3f9e2c...",
//   "customerEmail": "guest@example.com"
// }
// ```

// ### Response `200`
// ```json
// {
//   "success": true,
//   "message": "Payment verified",
//   "data": {
//     "orderId": "ORD20260704A1B2C3D4",
//     "orderStatus": "confirmed",
//     "paymentStatus": "paid"
//   }
// }
// ```

// Show your "Order Confirmed" screen on this response. No shipment is booked automatically —
// that happens later when an admin adds tracking info.

// > Note: even if this call never fires (user closes the tab mid-payment), the backend webhook
// > (`/payments/webhook`, server-to-server) independently confirms the payment as a fallback —
// > so poll `GET /orders/status/:orderId` if you need to double-check payment status after a reload.

// ---

// ## 4. Track Order Status (guest or logged-in)

// `GET /orders/status/:orderId?email=guest@example.com`

// Auth: optional. If logged-in, omit `?email=` — the Bearer token is used instead.

// ### Response `200`
// ```json
// {
//   "success": true,
//   "data": {
//     "orderId": "ORD20260704A1B2C3D4",
//     "orderStatus": "confirmed",
//     "shipments": [],
//     "timeline": [
//       { "status": "pending", "message": "Order created", "createdAt": "2026-07-04T10:00:00Z" },
//       { "status": "confirmed", "message": "Payment verified via Razorpay", "createdAt": "2026-07-04T10:05:00Z" }
//     ],
//     "pricing": { "subtotal": 1198, "discount": 100, "tax": 54, "shipping": 0, "total": 1152 }
//   }
// }
// ```

// ---

// ## 5. Logged-in User Endpoints

// All require `Authorization: Bearer <token>`.

// | Method | Route | Purpose |
// |---|---|---|
// | GET | `/orders?page=1&limit=20&status=confirmed` | List my orders (status filter optional) |
// | GET | `/orders/:id` | Get one of my orders (by Mongo `_id` or `orderId`) |
// | PATCH | `/orders/:id` | Update `shippingAddress` / `customerNote` — only while `pending`/`confirmed` and before a shipment exists |
// | PATCH | `/orders/:id/cancel` | Cancel — only allowed before `shipped` |

// ### PATCH `/orders/:id` payload
// ```json
// {
//   "shippingAddress": { "addressLine1": "New address line", "city": "Delhi" },
//   "customerNote": "Updated delivery instructions"
// }
// ```

// ### PATCH `/orders/:id/cancel` payload
// ```json
// { "reason": "Ordered by mistake" }
// ```

// ---

// ## 6. Admin Endpoints

// All require `Authorization: Bearer <adminToken>` (admin role).

// | Method | Route | Purpose |
// |---|---|---|
// | GET | `/orders/admin?page=1&limit=20&status=confirmed` | List all orders |
// | GET | `/orders/admin/:id` | Get one order (full detail) |
// | PATCH | `/orders/admin/:id/status` | Update status + **add manual shipment/tracking info** |
// | DELETE | `/orders/admin/:id` | Soft delete |

// ### PATCH `/orders/admin/:id/status` payload — this is where manual shipping happens
// ```json
// {
//   "orderStatus": "shipped",
//   "message": "Dispatched via Delhivery",
//   "courier": "Delhivery",
//   "trackingNumber": "AWB123456789",
//   "trackingUrl": "https://www.delhivery.com/track/AWB123456789",
//   "adminNote": "Packed and handed to courier at 4 PM"
// }
// ```
// `courier` / `trackingNumber` / `trackingUrl` are optional — only send them when you're actually
// attaching/updating shipment info. Sending just `orderStatus` (e.g. moving to `processing`) is fine too.

// ---

// ## Typical Frontend Flow (checkout)

// ```
// 1. POST /orders                        → get orderId
// 2. POST /payments/create-order         → get Razorpay order_id + amount
// 3. Open Razorpay Checkout with that data
// 4. On success → POST /payments/verify  → show confirmation
// 5. (Optional) GET /orders/status/:orderId → poll/display live status later
// ```

// ## Error Shape (all endpoints)

// ```json
// { "success": false, "message": "Human-readable error" }
// ```
// Always check `success` before trusting `data`.