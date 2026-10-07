const express = require("express");

const {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus,
  convertQuotationToSalesOrder
} = require("../controllers/quotationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, getQuotations);
router.get("/:id", authMiddleware, getQuotationById);
router.post(
  "/",
  authMiddleware,
  createQuotation
);
router.patch("/:id/status", authMiddleware, updateQuotationStatus);
router.put("/:id/status", authMiddleware, updateQuotationStatus);
router.post("/:id/convert", authMiddleware, convertQuotationToSalesOrder);

module.exports = router;