import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getRegistrationsForUser } from "../controllers/registrationController.js";
import { getVolunteersByUser } from "../controllers/volunteerController.js";
import { getNotificationsByUser, markNotificationRead } from "../controllers/notificationController.js";
import { supabase } from "../config/supabaseClient.js";
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

    // Build query for registrations with optional semester filter
    let query = supabase
      .from('registrations')
      .select('reg_id, registration_date, event_id, semester')
      .eq('user_id', userId)
      .order('registration_date', { ascending: false });

    // Apply semester filter if provided
    if (semester) {
      query = query.eq('semester', parseInt(semester));
    }

    const { data: registrations, error: regError } = await query;

    if (regError) throw regError;

    if (!registrations || registrations.length === 0) {
      return res.json({ success: true, reports: [] });
    }

    // Get event details for these registrations
    const eventIds = registrations.map(reg => reg.event_id);
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('event_id, name, date, category')
      .in('event_id', eventIds);

    if (eventsError) throw eventsError;

    // Create event map for faster lookup
    const eventMap = {};
    events.forEach(event => {
      eventMap[event.event_id] = event;
    });

    // Transform the data to match the expected format
    const reports = registrations.map(reg => ({
      reg_id: reg.reg_id,
      event_id: reg.event_id,
      name: eventMap[reg.event_id]?.name || 'Unknown Event',
      date: eventMap[reg.event_id]?.date || null,
      category: eventMap[reg.event_id]?.category || 'Unknown',
      registration_date: reg.registration_date,
      semester: reg.semester
    }));

    res.json({ success: true, reports });
  } catch (err) {
    console.error("getReports error:", err.message);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;
