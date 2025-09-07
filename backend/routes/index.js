import express from "express";
import pool from "../config/database.js";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import eventRoutes from "./events.js";
import volunteerRoutes from "./volunteers.js";

const router = express.Router();

// Health check
router.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});


// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/volunteers",volunteerRoutes);

export default router;
