const express = require("express");
const { getInventory } = require("../controllers/InventoryController");

const router = express.Router();

router.get("/", getInventory);

module.exports = router;