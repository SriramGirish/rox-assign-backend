const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  addUser,
  addStore,
  getAllUsers,
  getAllStores,
  filterUsers,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/dashboard", getDashboardStats);
router.post("/user", addUser);
router.post("/store", addStore);
router.get("/users", getAllUsers);
router.get("/stores", getAllStores);
router.get("/filter-users", filterUsers);

module.exports = router;
