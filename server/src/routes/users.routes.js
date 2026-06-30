const express = require("express");
const router = express.Router();

const firebaseAuthMiddleware = require("../middleware/firebaseAuthMiddleware");

const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/order.controller");

// Protect all routes
router.use(firebaseAuthMiddleware);

// Routes
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;