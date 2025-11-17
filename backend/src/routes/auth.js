const express = require("express");
const {
  register,
  login,
  switchRole,
  logout,
} = require("../Controllers/authController");
const auth = require("../Middleware/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/switch-role", auth, switchRole);
router.post("/logout", logout);

module.exports = router;
