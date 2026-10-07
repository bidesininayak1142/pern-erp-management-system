const express = require("express");
const { getProducts, createProduct } = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, createProduct);

module.exports = router;
