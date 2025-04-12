const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);  // accepts role = 'user' or 'admin' or 'store_owner'
router.post("/login", login);

module.exports = router;
