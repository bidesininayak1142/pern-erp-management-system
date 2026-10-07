const pool = require("../db");
const createQuotation = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      quotation_number,
      enquiry_id,
      valid_until,
      items
    } = req.body;

    if (!quotation_number || !enquiry_id || !items || items.length === 0) {
      return res.status(400).json({
        message: "Quotation number, enquiry and items are required"
      });
    }

    await client.query("BEGIN");

    const enquiryResult = await client.query(
      `SELECT id, customer_id, status
       FROM enquiries
       WHERE id = $1`,
      [enquiry_id]
    );

    if (enquiryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Enquiry not found"
      });
    }

    const enquiry = enquiryResult.rows[0];

    let grandTotal = 0;
    const quotationItems = [];
    for (const item of items) {
      const {
        product_id,
        quantity,
        unit_price,
        discount_percent = 0,
        gst_percent = 0
      } = item;

      if (!product_id || !quantity || unit_price === undefined) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Product, quantity and unit price are required"
        });
      }

      const productResult = await client.query(
        `SELECT id, base_price
         FROM products
         WHERE id = $1`,
        [product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Product not found"
        });
      }
      const baseAmount = quantity * unit_price;

      const discountAmount =
        baseAmount * (discount_percent / 100);

      const amountAfterDiscount =
        baseAmount - discountAmount;

      const gstAmount =
        amountAfterDiscount * (gst_percent / 100);

      const lineAmount =
        amountAfterDiscount + gstAmount;

      grandTotal += lineAmount;

      quotationItems.push({
        product_id,
        quantity,
        unit_price,
        discount_percent,
        gst_percent,
        line_amount: lineAmount
      });
    }
    const quotationResult = await client.query(
      `INSERT INTO quotations
       (
         quotation_number,
         enquiry_id,
         customer_id,
         valid_until,
         status,
         grand_total
       )
       VALUES ($1, $2, $3, $4, 'DRAFT', $5)
       RETURNING *`,
      [
        quotation_number,
        enquiry_id,
        enquiry.customer_id,
        valid_until,
        grandTotal
      ]
    );

    const quotation = quotationResult.rows[0];
    for (const item of quotationItems) {
      await client.query(
        `INSERT INTO quotation_items
         (
           quotation_id,
           product_id,
           quantity,
           unit_price,
           discount_percent,
           gst_percent,
           line_amount
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          quotation.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.discount_percent,
          item.gst_percent,
          item.line_amount
        ]
      );
    }

    await client.query(
      `UPDATE enquiries
       SET status = 'QUOTED'
       WHERE id = $1`,
      [enquiry_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Quotation created successfully",
      quotation_id: quotation.id,
      grand_total: grandTotal
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create quotation error:", error);

    res.status(500).json({
      message: "Server error"
    });

  } finally {
    client.release();
  }
};
const getQuotations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        q.id,
        q.quotation_number,
        q.enquiry_id,
        q.customer_id,
        q.valid_until,
        q.status,
        q.grand_total,
        q.created_at,
        c.company_name,
        c.contact_person,
        e.enquiry_number
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN enquiries e ON q.enquiry_id = e.id
      ORDER BY q.id DESC
    `);

    res.json({
      quotations: result.rows
    });
  } catch (error) {
    console.error("Get quotations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const qRes = await pool.query(`
      SELECT q.*, c.company_name, e.enquiry_number
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN enquiries e ON q.enquiry_id = e.id
      WHERE q.id = $1
    `, [id]);

    if (qRes.rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const itemsRes = await pool.query(`
      SELECT qi.*, p.product_name, p.product_code
      FROM quotation_items qi
      JOIN products p ON qi.product_id = p.id
      WHERE qi.quotation_id = $1
    `, [id]);

    res.json({
      quotation: qRes.rows[0],
      items: itemsRes.rows
    });
  } catch (error) {
    console.error("Get quotation by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"];
    const normalizedStatus = (status || "").toUpperCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const result = await pool.query(
      `UPDATE quotations SET status = $1 WHERE id = $2 RETURNING *`,
      [normalizedStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    res.json({
      message: `Quotation status updated to ${normalizedStatus}`,
      quotation: result.rows[0],
    });
  } catch (error) {
    console.error("Update quotation status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const convertQuotationToSalesOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { order_number } = req.body || {};

    await client.query("BEGIN");

    const quotationResult = await client.query(
      `SELECT id, quotation_number, customer_id, grand_total, status
       FROM quotations
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (quotationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Quotation not found" });
    }

    const quotation = quotationResult.rows[0];

    if (quotation.status !== "ACCEPTED") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Only ACCEPTED quotation can create Sales Order"
      });
    }

    const existingOrder = await client.query(
      `SELECT id FROM sales_orders WHERE quotation_id = $1`,
      [id]
    );

    if (existingOrder.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Sales Order already exists for this quotation"
      });
    }

    const soNumber =
      order_number || `SO-${Date.now().toString().slice(-6)}`;

    const orderResult = await client.query(
      `INSERT INTO sales_orders
       (
         order_number,
         quotation_id,
         customer_id,
         order_date,
         total_amount,
         status
       )
       VALUES ($1, $2, $3, CURRENT_DATE, $4, 'PENDING')
       RETURNING *`,
      [soNumber, quotation.id, quotation.customer_id, quotation.grand_total]
    );

    const salesOrder = orderResult.rows[0];

    const itemsResult = await client.query(
      `SELECT product_id, quantity
       FROM quotation_items
       WHERE quotation_id = $1`,
      [id]
    );

    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO sales_order_items
         (sales_order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [salesOrder.id, item.product_id, item.quantity]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Sales Order created successfully",
      sales_order: salesOrder
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Convert quotation error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus,
  convertQuotationToSalesOrder
};