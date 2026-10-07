const express = require("express");
const cors = require("cors");
const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const customerRoutes = require("./routes/customerRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");
const dispatchRoutes = require("./routes/dispatchRoutes");
const inventoryRoutes = require("./routes/InventoryRoutes");
const productRoutes = require("./routes/productRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/dispatches", dispatchRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("PERN Backend is running");
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "PostgreSQL connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});