
const pool = require("../db");


const createCustomer = async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      mobile,
      email,
      city,
    } = req.body;

    if (!company_name || !contact_person) {
      return res.status(400).json({
        message: "Company name and contact person are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO customers
       (company_name, contact_person, mobile, email, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        company_name,
        contact_person,
        mobile,
        email,
        city,
      ]
    );

    res.status(201).json({
      message: "Customer created successfully",
      customer: result.rows[0],
    });

  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY id DESC"
    );

    res.json({
      customers: result.rows,
    });

  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer deleted successfully",
      customer: result.rows[0],
    });

  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};


module.exports = {
  createCustomer,
  getCustomers,
  deleteCustomer,
};
