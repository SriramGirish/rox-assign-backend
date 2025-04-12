const express = require("express");
const router = express.Router();
const { getStoreRatings, getAverageRating } = require("../controllers/storeOwnerController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.use(protect);
router.use(authorizeRoles("store_owner"));

router.get("/ratings", getStoreRatings);
router.get("/average-rating", getAverageRating);

module.exports = router;
