const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Admin! Protected API is working.",
      user: req.user,
    });
  }
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN", "SALES_USER"),
  (req, res) => {
    res.json({
      message: "Protected API is working.",
      user: req.user,
    });
  }
);

module.exports = router;