const express = require("express");
const {
  createOrder,
  listAvailable,
  acceptOrder,
  completeOrder,
  cancelOrder,
  history,
  getOrderDetails,
} = require("../Controllers/orderController");
const auth = require("../Middleware/auth");
const router = express.Router();

router.post("/", auth, createOrder);
router.get("/available", auth, listAvailable);
router.get("/history", auth, history); // Must be before /:id route
router.patch("/:id/accept", auth, acceptOrder);
router.patch("/:id/done", auth, completeOrder);
router.patch("/:id/cancel", auth, cancelOrder);
router.get("/:id", auth, getOrderDetails);

module.exports = router;
