const pool = require("../db");
const createSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      order_number,
      quotation_id,
    } = req.body;

    if (!order_number || !quotation_id) {
      return res.status(400).json({
        message: "Order number and quotation are required",
      });
    }

    await client.query("BEGIN");

    const quotationResult = await client.query(
      `
      SELECT
        id,
        customer_id,
        grand_total,
        status
      FROM quotations
      WHERE id = $1
      FOR UPDATE
      `,
      [quotation_id]
    );

    if (quotationResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    const quotation = quotationResult.rows[0];
    if (
      String(quotation.status).toUpperCase() !==
      "ACCEPTED"
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Only ACCEPTED quotation can create Sales Order",
      });
    }

    const existingOrder = await client.query(
      `
      SELECT id
      FROM sales_orders
      WHERE quotation_id = $1
      `,
      [quotation_id]
    );

    if (existingOrder.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Sales Order already exists for this quotation",
      });
    }
    const quotationItemsResult = await client.query(
      `
      SELECT
        product_id,
        quantity
      FROM quotation_items
      WHERE quotation_id = $1
      `,
      [quotation_id]
    );

    if (quotationItemsResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Quotation has no products",
      });
    }
    const orderResult = await client.query(
      `
      INSERT INTO sales_orders
      (
        order_number,
        quotation_id,
        customer_id,
        order_date,
        total_amount,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        CURRENT_DATE,
        $4,
        'PENDING'
      )
      RETURNING *
      `,
      [
        order_number.trim(),
        quotation_id,
        quotation.customer_id,
        quotation.grand_total,
      ]
    );

    const salesOrder = orderResult.rows[0];
    for (const item of quotationItemsResult.rows) {
      await client.query(
        `
        INSERT INTO sales_order_items
        (
          sales_order_id,
          product_id,
          quantity
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        `,
        [
          salesOrder.id,
          item.product_id,
          item.quantity,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message:
        "Sales Order created successfully",
      sales_order: salesOrder,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Create Sales Order error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Server error",
    });
  } finally {
    client.release();
  }
};

const getSalesOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        so.id,
        so.order_number,
        so.quotation_id,
        so.customer_id,
        so.order_date,
        so.total_amount,
        so.status,
        so.created_at,

        c.company_name,
        c.contact_person,

        q.quotation_number

      FROM sales_orders so

      LEFT JOIN customers c
        ON so.customer_id = c.id

      LEFT JOIN quotations q
        ON so.quotation_id = q.id

      ORDER BY so.id DESC
      `
    );

    res.json({
      sales_orders: result.rows,
    });
  } catch (error) {
    console.error(
      "Get Sales Orders error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load sales orders",
    });
  }
};
// GET SALES ORDER BY ID
// =====================================================

const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `
      SELECT
        so.*,

        c.company_name,
        c.contact_person,
        c.mobile,
        c.email,
        c.city,

        q.quotation_number

      FROM sales_orders so

      LEFT JOIN customers c
        ON so.customer_id = c.id

      LEFT JOIN quotations q
        ON so.quotation_id = q.id

      WHERE so.id = $1
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message:
          "Sales Order not found",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        soi.id,
        soi.product_id,
        soi.quantity,

        p.product_name,
        p.product_code,
        p.unit,

        COALESCE(
          i.physical_quantity,
          0
        ) AS physical_quantity,

        COALESCE(
          i.reserved_quantity,
          0
        ) AS reserved_quantity,

        (
          COALESCE(
            i.physical_quantity,
            0
          )
          -
          COALESCE(
            i.reserved_quantity,
            0
          )
        ) AS available_quantity

      FROM sales_order_items soi

      JOIN products p
        ON soi.product_id = p.id

      LEFT JOIN inventory i
        ON p.id = i.product_id

      WHERE soi.sales_order_id = $1

      ORDER BY soi.id
      `,
      [id]
    );

    res.json({
      sales_order:
        orderResult.rows[0],

      items:
        itemsResult.rows,
    });
  } catch (error) {
    console.error(
      "Get Sales Order by ID error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load Sales Order",
    });
  }
};
const confirmSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");


    const orderResult = await client.query(
      `
      SELECT
        id,
        status
      FROM sales_orders
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message:
          "Sales Order not found",
      });
    }

    const order = orderResult.rows[0];

    if (
      String(order.status).toUpperCase() !==
      "PENDING"
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Only PENDING Sales Order can be confirmed",
      });
    }

    const itemsResult = await client.query(
      `
      SELECT
        product_id,
        quantity
      FROM sales_order_items
      WHERE sales_order_id = $1
      `,
      [id]
    );

    if (itemsResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Sales Order has no items",
      });
    }

    for (const item of itemsResult.rows) {
      const inventoryResult =
        await client.query(
          `
          SELECT
            id,
            physical_quantity,
            reserved_quantity

          FROM inventory

          WHERE product_id = $1

          FOR UPDATE
          `,
          [item.product_id]
        );

      if (
        inventoryResult.rows.length === 0
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Inventory not found for product ${item.product_id}`,
        });
      }

      const inventory =
        inventoryResult.rows[0];

      const physical =
        Number(
          inventory.physical_quantity
        );

      const reserved =
        Number(
          inventory.reserved_quantity
        );

      const available =
        physical - reserved;

      const required =
        Number(item.quantity);

      if (available < required) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Insufficient inventory for product ${item.product_id}`,
          available,
          requested: required,
        });
      }

      await client.query(
        `
        UPDATE inventory

        SET reserved_quantity =
          reserved_quantity + $1

        WHERE product_id = $2
        `,
        [
          required,
          item.product_id,
        ]
      );
    }
    const updatedOrder =
      await client.query(
        `
        UPDATE sales_orders

        SET status = 'CONFIRMED'

        WHERE id = $1

        RETURNING *
        `,
        [id]
      );

    await client.query("COMMIT");

    res.json({
      message:
        "Sales Order confirmed and inventory reserved successfully",

      sales_order:
        updatedOrder.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Confirm Sales Order error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to confirm Sales Order",
    });
  } finally {
    client.release();
  }
};

const cancelSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const orderResult =
      await client.query(
        `
        SELECT
          id,
          status
        FROM sales_orders
        WHERE id = $1
        FOR UPDATE
        `,
        [id]
      );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message:
          "Sales Order not found",
      });
    }

    const order =
      orderResult.rows[0];

    const status =
      String(order.status).toUpperCase();

    if (status === "DISPATCHED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Cannot cancel a dispatched order",
      });
    }

    if (status === "CANCELLED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Order is already cancelled",
      });
    }
    if (status === "CONFIRMED") {
      const itemsResult =
        await client.query(
          `
          SELECT
            product_id,
            quantity

          FROM sales_order_items

          WHERE sales_order_id = $1
          `,
          [id]
        );

      for (const item of itemsResult.rows) {
        await client.query(
          `
          UPDATE inventory

          SET reserved_quantity =
            GREATEST(
              0,
              reserved_quantity - $1
            )

          WHERE product_id = $2
          `,
          [
            item.quantity,
            item.product_id,
          ]
        );
      }
    }

    const updated =
      await client.query(
        `
        UPDATE sales_orders

        SET status = 'CANCELLED'

        WHERE id = $1

        RETURNING *
        `,
        [id]
      );

    await client.query("COMMIT");

    res.json({
      message:
        "Sales Order cancelled successfully",

      sales_order:
        updated.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Cancel Sales Order error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to cancel Sales Order",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
  getSalesOrders,
  getSalesOrderById,
};