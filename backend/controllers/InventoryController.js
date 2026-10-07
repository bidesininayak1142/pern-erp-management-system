
const pool = require("../db");

const getInventory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        products.id AS product_id,
        products.product_code,
        products.product_name,
        products.category,
        products.unit,
        products.base_price,

        COALESCE(inventory.physical_quantity, 0)
          AS physical_quantity,

        COALESCE(inventory.reserved_quantity, 0)
          AS reserved_quantity,

        (
          COALESCE(inventory.physical_quantity, 0)
          -
          COALESCE(inventory.reserved_quantity, 0)
        ) AS available_quantity

      FROM products

      LEFT JOIN inventory
        ON inventory.product_id = products.id

      ORDER BY products.id
    `);
    console.log(
  "Inventory IDs from database:",
  result.rows.map((row) => row.product_id)
);

    res.json({
      inventory: result.rows
    });

  } catch (error) {
    console.error("Inventory error:", error);

    res.status(500).json({
      message: "Failed to load inventory"
    });
  }
};

module.exports = { getInventory };