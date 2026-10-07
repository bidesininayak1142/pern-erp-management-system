const pool = require("../db");

const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json({ products: result.rows });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { product_code, product_name, category, unit, base_price } = req.body;
    if (!product_name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const code = product_code || `PRD-${Date.now().toString().slice(-4)}`;
    const result = await pool.query(
      `INSERT INTO products (product_code, product_name, category, unit, base_price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, product_name, category || "General", unit || "PCS", base_price || 100]
    );
    await pool.query(
      `INSERT INTO inventory (product_id, physical_quantity, reserved_quantity)
       VALUES ($1, 100, 0)`,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0]
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProducts, createProduct };
