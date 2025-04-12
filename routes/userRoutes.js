const express = require("express");
const router = express.Router();
const { getAllStores, submitRating } = require("../controllers/userController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.use(protect);
router.use(authorizeRoles("user"));

router.get("/stores", getAllStores);
router.post("/rate", submitRating);

module.exports = router;
