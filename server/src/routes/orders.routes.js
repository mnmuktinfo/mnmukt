"use strict";

const express = require("express");
const router = express.Router();

const {
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  asyncHandler,
  orderLimiter,
  readLimiter,
  adminLimiter,
  validateBody,
  validateParams,
  validateQuery,
} = require("../middleware");

const { orderSchemas } = require("../validations/order.validation");

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  deleteOrder,
  getAdminOrders,
  getAdminOrder,
  getOrderStatus, // ← NEW: Guest order status endpoint
} = require("../controllers/order.controller");

/* ==========================================================
   ADMIN ROUTES
========================================================== */

const adminRouter = express.Router();

// Admin routes REQUIRE both authentication AND admin role
adminRouter.use(firebaseAuthMiddleware);
adminRouter.use(adminMiddleware);

/**
 * GET ALL ORDERS (ADMIN)
 * GET /api/v1/orders/admin (requires admin role)
 */
adminRouter.get(
  "/",
  adminLimiter,
  asyncHandler(getAdminOrders)
);

/**
 * GET SINGLE ORDER (ADMIN)
 * GET /api/v1/orders/admin/:id
 */
adminRouter.get(
  "/:id",
  adminLimiter,
  validateParams(orderSchemas.idParam),
  asyncHandler(getAdminOrder)
);

/**
 * UPDATE ORDER STATUS (ADMIN)
 * PATCH /api/v1/orders/admin/:id/status
 */
adminRouter.patch(
  "/:id/status",
  adminLimiter,
  validateParams(orderSchemas.idParam),
  validateBody(orderSchemas.updateStatus),
  asyncHandler(updateOrderStatus)
);

/**
 * DELETE ORDER (ADMIN - SOFT DELETE)
 * DELETE /api/v1/orders/admin/:id
 */
adminRouter.delete(
  "/:id",
  adminLimiter,
  validateParams(orderSchemas.idParam),
  asyncHandler(deleteOrder)
);

/* ==========================================================
   MOUNT ADMIN ROUTES
========================================================== */
router.use("/admin", adminRouter);

/* ==========================================================
   GUEST-FRIENDLY ROUTES (Optional Auth)
========================================================== */

/**
 * CREATE ORDER - GUEST + AUTH USERS
 * POST /api/v1/orders
 *
 * Supports:
 * - Authenticated users with Bearer token
 * - Guest users without token
 *
 * Guest users must provide: email, fullName, phone in request body
 */
router.post(
  "/",
  optionalAuthMiddleware, // ← Optional auth for guests
  orderLimiter,
  validateBody(orderSchemas.create),
  asyncHandler(createOrder)
);

/**
 * GET ORDER STATUS - PUBLIC (GUEST + AUTH)
 * GET /api/v1/orders/status/:orderId?email=guest@example.com
 *
 * Supports:
 * - Authenticated users with Bearer token
 * - Guest users with valid email (no token needed)
 */
router.get(
  "/status/:orderId",
  optionalAuthMiddleware, // ← Optional auth for guests
  readLimiter,
  validateParams(orderSchemas.idParam),
  asyncHandler(getOrderStatus) // ← NEW endpoint
);

/* ==========================================================
   AUTHENTICATED USER ROUTES
========================================================== */

/**
 * GET MY ORDERS
 * GET /api/v1/orders
 * Requires: Authentication
 */
router.get(
  "/",
  firebaseAuthMiddleware, // ← Required auth
  readLimiter,
  asyncHandler(getAllOrders)
);

/**
 * GET SINGLE ORDER
 * GET /api/v1/orders/:id
 * Requires: Authentication
 * User can only see their own orders
 */
router.get(
  "/:id",
  firebaseAuthMiddleware, // ← Required auth
  readLimiter,
  validateParams(orderSchemas.idParam),
  asyncHandler(getOrderById)
);

/**
 * UPDATE ORDER
 * PATCH /api/v1/orders/:id
 * Requires: Authentication
 * Users can only update their own orders
 */
router.patch(
  "/:id",
  firebaseAuthMiddleware, // ← Required auth
  validateParams(orderSchemas.idParam),
  validateBody(orderSchemas.update),
  asyncHandler(updateOrder)
);

/**
 * CANCEL ORDER
 * PATCH /api/v1/orders/:id/cancel
 * Requires: Authentication
 * Users can only cancel their own orders
 */
router.patch(
  "/:id/cancel",
  firebaseAuthMiddleware, // ← Required auth
  validateParams(orderSchemas.idParam),
  asyncHandler(cancelOrder)
);



module.exports = router;

/* ==========================================================
   ROUTE SUMMARY
========================================================== */

/**
 * PUBLIC (Optional Auth):
 * POST   /api/v1/orders                    → Create order (guest/auth)
 * GET    /api/v1/orders/status/:orderId    → Get order status (guest/auth)
 *
 * AUTHENTICATED:
 * GET    /api/v1/orders                    → Get my orders
 * GET    /api/v1/orders/:id                → Get my order
 * PATCH  /api/v1/orders/:id                → Update my order
 * PATCH  /api/v1/orders/:id/cancel         → Cancel my order
 *
 * ADMIN ONLY:
 * GET    /api/v1/orders/admin              → Get all orders
 * GET    /api/v1/orders/admin/:id          → Get order details
 * PATCH  /api/v1/orders/admin/:id/status   → Update status
 * DELETE /api/v1/orders/admin/:id          → Soft delete
 */