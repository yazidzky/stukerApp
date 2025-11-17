const express = require("express");
const { createRating, getUserRating, getOrderRatingData } = require("../Controllers/ratingController");
const auth = require("../Middleware/auth");
const router = express.Router();

router.post("/", auth, createRating);
router.get("/user/:userId", auth, getUserRating);
router.get("/order/:orderId", auth, getOrderRatingData);

module.exports = router;
