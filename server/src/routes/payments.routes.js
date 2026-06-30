const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
  optionalAuthMiddleware,
} = require("../middleware/firebaseAuthMiddleware");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/payment.controller");

/**
 * PAYMENT RATE LIMITING
 * 
 * - Authenticated users: Keyed by uid
 * - Guest users: Keyed by email (from request body)
 * - Fallback: Keyed by IP address
 */
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute
  message: "Too many payment attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Authenticated user
    if (req.user?.uid) {
      return `auth-${req.user.uid}`;
    }

    // Guest user - use email if available
    if (req.body?.customerEmail) {
      return `guest-${req.body.customerEmail}`;
    }

    // Fallback - use IP
    return req.ip;
  },
  skip: (req) => req.user?.role === "admin", // Admins bypass rate limit
});

/**
 * Stricter rate limiting for payment verification
 * This endpoint is critical - prevent brute force attacks
 */
const verificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per 5 minutes
  message: "Too many verification attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Authenticated user
    if (req.user?.uid) {
      return `verify-auth-${req.user.uid}`;
    }

    // Guest user - use order ID + email
    if (req.body?.orderId && req.body?.customerEmail) {
      return `verify-guest-${req.body.orderId}-${req.body.customerEmail}`;
    }

    // Fallback - use IP
    return req.ip;
  },
  skip: (req) => req.user?.role === "admin",
});

/**
 * APPLY OPTIONAL AUTH TO ALL PAYMENT ROUTES
 * Guests CAN use payment endpoints without authentication
 * Authenticated users will be recognized and rate limited by uid
 */
router.use(optionalAuthMiddleware);

/**
 * CREATE RAZORPAY ORDER
 * POST /api/v1/payments/create-order
 *
 * Request body:
 * {
 *   orderId: string,           // Order ID from orders service
 *   amount: number,            // Amount in paise
 *   customerEmail?: string,    // Optional for guests
 *   customerName?: string      // Optional for guests
 * }
 *
 * Supports:
 * - Authenticated users (with Bearer token)
 * - Guest users (without token, must provide email/name)
 */
router.post(
  "/create-order",
  paymentLimiter,
  createRazorpayOrder
);

/**
 * VERIFY RAZORPAY PAYMENT
 * POST /api/v1/payments/verify
 *
 * CRITICAL SECURITY ENDPOINT
 * 
 * Request body:
 * {
 *   orderId: string,
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   customerEmail?: string     // Required for guests
 * }
 *
 * Backend MUST:
 * 1. Verify Razorpay signature (prevents tampering)
 * 2. For guests: Verify email matches order email
 * 3. For auth users: Verify userId matches order userId
 * 4. Update order status only after verification
 *
 * Supports:
 * - Authenticated users (with Bearer token)
 * - Guest users (without token, email will be verified)
 */
router.post(
  "/verify",
  verificationLimiter,
  verifyRazorpayPayment
);

module.exports = router;

/* ==========================================================
   SECURITY NOTES FOR PAYMENT ROUTES
========================================================== */

/**
 * GUEST PAYMENT FLOW:
 * 
 * 1. Frontend: Send POST /create-order with:
 *    - orderId (from order creation)
 *    - amount
 *    - customerEmail
 *    - customerName
 *    NO BEARER TOKEN
 * 
 * 2. Backend: Create payment order without verifying token
 *    (Guest email is used for verification later)
 * 
 * 3. Frontend: User completes Razorpay payment
 * 
 * 4. Frontend: Send POST /verify with:
 *    - razorpay_order_id
 *    - razorpay_payment_id
 *    - razorpay_signature
 *    - customerEmail (must match order email)
 *    NO BEARER TOKEN
 * 
 * 5. Backend MUST:
 *    a) Verify Razorpay signature (CRITICAL - prevents tampering)
 *    b) Fetch order from DB
 *    c) Verify customerEmail matches order.shippingAddress.email
 *    d) Update order status to "paid"
 *    e) Return success only if all checks pass
 * 
 * WHY THIS IS SECURE:
 * - Razorpay signature verification prevents payment spoofing
 * - Email verification prevents one guest hijacking another's order
 * - Rate limiting prevents brute force attacks
 * - Even if someone has orderId, they need exact email + valid signature
 */

/**
 * AUTHENTICATED PAYMENT FLOW:
 * 
 * Similar to guest, but:
 * - Backend verifies userId from token matches order.userId
 * - No email verification needed (token is proof of identity)
 */