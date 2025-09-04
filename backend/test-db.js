// backend/test-db.js
import pool from "./config/database.js";

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to DB:", result.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  } finally {
    pool.end();
  }
}

testConnection();
