import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getRegistrationsForUser } from "../controllers/registrationController.js";
import { getVolunteersByUser } from "../controllers/volunteerController.js";
import { getNotificationsByUser, markNotificationRead } from "../controllers/notificationController.js";
import pool from "../config/database.js";
// Add this route after the imports

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Users API working" });
});


// ==============================
// Student Routes
// ==============================

// My Events (registrations)
router.get("/:userId/registrations", authMiddleware, getRegistrationsForUser);

// My Volunteers
router.get("/:userId/volunteers", authMiddleware, getVolunteersByUser);

// My Notifications
router.get("/:userId/notifications", authMiddleware, getNotificationsByUser);
router.put("/notifications/:id/read", authMiddleware, markNotificationRead);

// My Reports (participation history with optional semester filter)
router.get("/:userId/reports", authMiddleware, async (req, res) => {
  try {
    const { semester } = req.query;
    const { userId } = req.params;

    let query = `
      SELECT r.reg_id, e.event_id, e.name, e.date, e.category, r.registration_date, u.semester
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      JOIN users u ON r.user_id = u.user_id
      WHERE r.user_id = $1
    `;

    const params = [userId];
    if (semester) {
      params.push(parseInt(semester));
      query += ` AND u.semester = $${params.length}`;
    }
    query += " ORDER BY r.registration_date DESC";

    const { rows } = await pool.query(query, params);
    res.json({ success: true, reports: rows });
  } catch (err) {
    console.error("getReports error:", err.message);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;
