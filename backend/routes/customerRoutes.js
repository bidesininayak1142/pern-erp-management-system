const express = require("express");

const {
  createCustomer,
  getCustomers,
  deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createCustomer
);

router.get(
  "/",
  authMiddleware,
  getCustomers
);

router.delete(
  "/:id",
  authMiddleware,
  deleteCustomer
);

module.exports = router;