
const pool = require("../db");
const createDispatch = async (req, res) => {
  const client = await pool.connect();

  try {
    let {
      dispatch_number,
      sales_order_id,
      vehicle_number,
      driver_name,
      items,
    } = req.body;

    if (!sales_order_id) {
      return res.status(400).json({
        message: "Sales Order ID is required",
      });
    }

    const dspNumber =
      dispatch_number ||
      `DSP-${Date.now().toString().slice(-6)}`;

    await client.query("BEGIN");
    const orderResult = await client.query(
      `SELECT
        id,
        status
       FROM sales_orders
       WHERE id = $1
       FOR UPDATE`,
      [sales_order_id]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Sales Order not found",
      });
    }

    const order = orderResult.rows[0];
    if (order.status !== "CONFIRMED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Only CONFIRMED Sales Order can be dispatched",
      });
    }
    const existingDispatch = await client.query(
      `SELECT id
       FROM dispatches
       WHERE sales_order_id = $1`,
      [sales_order_id]
    );

    if (existingDispatch.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Dispatch already exists for this Sales Order",
      });
    }
    if (!items || items.length === 0) {
      const orderItemsResult = await client.query(
        `SELECT
          product_id,
          quantity
         FROM sales_order_items
         WHERE sales_order_id = $1`,
        [sales_order_id]
      );

      items = orderItemsResult.rows;
    }

    if (!items || items.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "No items found to dispatch for this Sales Order",
      });
    }
    const dispatchNumberResult = await client.query(
      `SELECT id
       FROM dispatches
       WHERE dispatch_number = $1`,
      [dspNumber]
    );

    if (dispatchNumberResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Dispatch number already exists",
      });
    }
    const dispatchResult = await client.query(
      `INSERT INTO dispatches
       (
         dispatch_number,
         sales_order_id,
         dispatch_date,
         vehicle_number,
         driver_name
       )
       VALUES
       (
         $1,
         $2,
         CURRENT_DATE,
         $3,
         $4
       )
       RETURNING *`,
      [
        dspNumber,
        sales_order_id,
        vehicle_number || "OD-02-AB-1234",
        driver_name || "Assigned Driver",
      ]
    );

    const dispatch = dispatchResult.rows[0];
    for (const item of items) {
      const productId =
        item.product_id || item.productId;

      const quantity = Number(item.quantity);

      if (!productId || !quantity || quantity <= 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            "Valid product and quantity are required",
        });
      }
      const orderItemResult = await client.query(
        `SELECT quantity
         FROM sales_order_items
         WHERE sales_order_id = $1
           AND product_id = $2`,
        [sales_order_id, productId]
      );

      if (orderItemResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Product ${productId} does not belong to this Sales Order`,
        });
      }

      const orderedQuantity = Number(
        orderItemResult.rows[0].quantity
      );
      const inventoryResult = await client.query(
        `SELECT
          physical_quantity,
          reserved_quantity
         FROM inventory
         WHERE product_id = $1
         FOR UPDATE`,
        [productId]
      );

      if (inventoryResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Inventory not found for product ${productId}`,
        });
      }

      const inventory = inventoryResult.rows[0];

      const physicalQuantity = Number(
        inventory.physical_quantity
      );

      const reservedQuantity = Number(
        inventory.reserved_quantity
      );
      if (quantity > orderedQuantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Cannot dispatch more than ordered quantity for product ${productId}`,
          ordered: orderedQuantity,
          requested: quantity,
        });
      }
      if (reservedQuantity < quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Reserved quantity is insufficient for product ${productId}`,
          reserved: reservedQuantity,
          requested: quantity,
        });
      }
      if (physicalQuantity < quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Physical quantity is insufficient for product ${productId}`,
          physical: physicalQuantity,
          requested: quantity,
        });
      }


      await client.query(
        `INSERT INTO dispatch_items
         (
           dispatch_id,
           product_id,
           quantity
         )
         VALUES
         (
           $1,
           $2,
           $3
         )`,
        [dispatch.id, productId, quantity]
      );
      await client.query(
        `UPDATE inventory
         SET
           physical_quantity =
             physical_quantity - $1,
           reserved_quantity =
             reserved_quantity - $1
         WHERE product_id = $2`,
        [quantity, productId]
      );
    }
    const updatedOrder = await client.query(
      `UPDATE sales_orders
       SET status = 'DISPATCHED'
       WHERE id = $1
       RETURNING *`,
      [sales_order_id]
    );
    await client.query("COMMIT");

    res.status(201).json({
      message: "Dispatch created successfully",

      dispatch,

      sales_order: updatedOrder.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Create Dispatch error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
const getDispatches = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.dispatch_number,
        d.sales_order_id,
        d.dispatch_date,
        d.vehicle_number,
        d.driver_name,
        d.created_at,

        so.order_number,
        so.status AS order_status,

        c.company_name

      FROM dispatches d

      LEFT JOIN sales_orders so
        ON d.sales_order_id = so.id

      LEFT JOIN customers c
        ON so.customer_id = c.id

      ORDER BY d.id DESC
    `);

    res.json({
      dispatches: result.rows,
    });
  } catch (error) {
    console.error(
      "Get dispatches error:",
      error
    );

    res.status(500).json({
      message: "Failed to load dispatch records",
      error: error.message,
    });
  }
};
const getDispatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const dispatchResult = await pool.query(
      `
      SELECT
        d.*,

        so.order_number,
        so.status AS order_status,

        c.company_name,
        c.contact_person,
        c.mobile,
        c.city

      FROM dispatches d

      JOIN sales_orders so
        ON d.sales_order_id = so.id

      JOIN customers c
        ON so.customer_id = c.id

      WHERE d.id = $1
      `,
      [id]
    );

    if (dispatchResult.rows.length === 0) {
      return res.status(404).json({
        message: "Dispatch not found",
      });
    }
    const itemsResult = await pool.query(
      `
      SELECT
        di.*,

        p.product_name,
        p.product_code,
        p.unit

      FROM dispatch_items di

      JOIN products p
        ON di.product_id = p.id

      WHERE di.dispatch_id = $1
      `,
      [id]
    );

    res.json({
      dispatch: dispatchResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error(
      "Get dispatch by id error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  createDispatch,
  getDispatches,
  getDispatchById,
};
