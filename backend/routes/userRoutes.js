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

    // First get user info to check semester if filter is applied
    if (semester) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('semester')
        .eq('user_id', userId)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          return res.json({ success: true, reports: [] });
        }
        throw userError;
      }

      // If user's semester doesn't match the filter, return empty
      if (user.semester !== parseInt(semester)) {
        return res.json({ success: true, reports: [] });
      }
    }

    // Get registrations for the user
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('reg_id, registration_date, event_id')
      .eq('user_id', userId)
      .order('registration_date', { ascending: false });

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

    // Get user semester info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('semester')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

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
      semester: user.semester
    }));

    res.json({ success: true, reports });
  } catch (err) {
    console.error("getReports error:", err.message);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;
