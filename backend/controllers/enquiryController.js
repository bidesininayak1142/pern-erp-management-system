const pool = require("../db");
const createEnquiry = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      enquiry_number,
      customer_id,
      enquiry_date,
      required_date,
      notes,
      items
    } = req.body;

    if (!enquiry_number || !customer_id || !enquiry_date) {
      return res.status(400).json({
        message: "Enquiry number, customer and enquiry date are required",
      });
    }
    const customer = await client.query(
      "SELECT id FROM customers WHERE id = $1",
      [customer_id]
    );

    if (customer.rows.length === 0) {
      return res.status(400).json({
        message: "Customer not found",
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO enquiries
       (enquiry_number, customer_id, enquiry_date, required_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        enquiry_number,
        customer_id,
        enquiry_date,
        required_date || null,
        notes || "",
      ]
    );

    const enquiry = result.rows[0];

    const insertedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.product_id && item.quantity) {
          const itemRes = await client.query(
            `INSERT INTO enquiry_items (enquiry_id, product_id, quantity)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [enquiry.id, item.product_id, item.quantity]
          );
          insertedItems.push(itemRes.rows[0]);
        }
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Enquiry created successfully",
      enquiry: { ...enquiry, items: insertedItems },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create enquiry error:", error);

    res.status(500).json({
      message: "Server error",
    });
  } finally {
    client.release();
  }
};
const getEnquiries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id,
        e.enquiry_number,
        e.enquiry_date,
        e.required_date,
        e.notes,
        e.status,
        c.id AS customer_id,
        c.company_name,
        c.contact_person,
        c.email,
        c.mobile,
        c.city,
        COUNT(ei.id) as items_count
      FROM enquiries e
      JOIN customers c
        ON e.customer_id = c.id
      LEFT JOIN enquiry_items ei
        ON e.id = ei.enquiry_id
      GROUP BY e.id, c.id
      ORDER BY e.id DESC
    `);

    res.json({
      enquiries: result.rows,
    });

  } catch (error) {
    console.error("Get enquiries error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enqRes = await pool.query(`
      SELECT
        e.*,
        c.company_name,
        c.contact_person,
        c.email,
        c.mobile,
        c.city
      FROM enquiries e
      JOIN customers c ON e.customer_id = c.id
      WHERE e.id = $1
    `, [id]);

    if (enqRes.rows.length === 0) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    const itemsRes = await pool.query(`
      SELECT
        ei.id,
        ei.enquiry_id,
        ei.product_id,
        ei.quantity,
        p.product_code,
        p.product_name,
        p.category,
        p.unit,
        p.base_price
      FROM enquiry_items ei
      JOIN products p ON ei.product_id = p.id
      WHERE ei.enquiry_id = $1
    `, [id]);

    res.json({
      enquiry: enqRes.rows[0],
      items: itemsRes.rows,
    });
  } catch (error) {
    console.error("Get enquiry by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const addEnquiryItem = async (req, res) => {
  try {
    const {
      enquiry_id,
      product_id,
      quantity,
    } = req.body;

    if (!enquiry_id || !product_id || !quantity) {
      return res.status(400).json({
        message: "Enquiry, product and quantity are required",
      });
    }

    const enquiry = await pool.query(
      "SELECT id FROM enquiries WHERE id = $1",
      [enquiry_id]
    );

    if (enquiry.rows.length === 0) {
      return res.status(400).json({
        message: "Enquiry not found",
      });
    }
    const product = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );

    if (product.rows.length === 0) {
      return res.status(400).json({
        message: "Product not found",
      });
    }
    const result = await pool.query(
      `INSERT INTO enquiry_items
       (enquiry_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        enquiry_id,
        product_id,
        quantity,
      ]
    );

    res.status(201).json({
      message: "Enquiry item added successfully",
      item: result.rows[0],
    });

  } catch (error) {
    console.error("Add enquiry item error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  addEnquiryItem,
};