const express = require("express");

const {
  createSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
  getSalesOrders,
  getSalesOrderById,
} = require("../controllers/salesOrderController");

const {
  createDispatch,
} = require("../controllers/dispatchController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getSalesOrders
);

router.get(
  "/:id",
  authMiddleware,
  getSalesOrderById
);

router.post(
  "/",
  authMiddleware,
  createSalesOrder
);

router.put(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware("ADMIN"),
  confirmSalesOrder
);
router.post(
  "/:id/dispatch",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res, next) => {
    req.body.sales_order_id =
      req.params.id;

    return createDispatch(
      req,
      res,
      next
    );
  }
);


router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("ADMIN"),
  cancelSalesOrder
);


module.exports = router;