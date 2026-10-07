
const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.query("SELECT current_database()", (error, result) => {
  if (error) {
    console.error("Database connection error:", error.message);
  } else {
    console.log(
      "Backend connected to database:",
      result.rows[0].current_database
    );
  }
});

module.exports = pool;
