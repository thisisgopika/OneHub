const express = require("express");
const router = express.Router();
const pool = require("../config/database"); // assuming pg Pool is exported

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      backend: true,
      database: true,
      db_time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      backend: true,
      database: false,
      error: err.message
    });
  }
});

module.exports = router;
