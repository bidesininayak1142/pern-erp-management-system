const express = require("express");

const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  addEnquiryItem,
} = require("../controllers/enquiryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.post(
  "/",
  authMiddleware,
  createEnquiry
);
router.get(
  "/",
  authMiddleware,
  getEnquiries
);
router.get(
  "/:id",
  authMiddleware,
  getEnquiryById
);
router.post(
  "/items",
  authMiddleware,
  addEnquiryItem
);

module.exports = router;