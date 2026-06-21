const express = require("express");
const rateLimit = require("express-rate-limit");
const auth = require("../Middleware/auth");
const { handleChat } = require("../Controllers/chatbotController");

const router = express.Router();

const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 15,
  message: {
    error: "Terlalu banyak permintaan dari akun/IP ini. Silakan coba lagi dalam satu menit. / Too many requests. Please try again in a minute."
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

router.post("/chat", auth, chatbotLimiter, handleChat);

module.exports = router;
