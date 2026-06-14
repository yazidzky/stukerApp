const express = require("express");
const rateLimit = require("express-rate-limit");
const auth = require("../Middleware/auth");
const { handleChat } = require("../Controllers/chatbotController");

const router = express.Router();

// Rate limiter: Max 15 requests per minute
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
  message: {
    error: "Terlalu banyak permintaan dari akun/IP ini. Silakan coba lagi dalam satu menit. / Too many requests. Please try again in a minute."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Protect with JWT auth and Rate Limit
router.post("/chat", auth, chatbotLimiter, handleChat);

module.exports = router;
