const express = require("express");
const { editProfile, getProfile } = require("../Controllers/profileController");
const auth = require("../Middleware/auth");
const router = express.Router();

router.put("/", auth, editProfile);
router.get("/", auth, getProfile);

module.exports = router;
