const express = require("express");

const {
  createDispatch,
  getDispatches
} = require("../controllers/dispatchController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


router.get("/", authMiddleware, getDispatches);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createDispatch
);

module.exports = router;