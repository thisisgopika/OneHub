import pool from '../config/database.js';

// Event creation controller
export const createEvent = async (req, res) => {
  try {
    const { name, description, date, venue, category, deadline, max_participants } = req.body;
    
    // Get user from JWT token
    const created_by = req.user.user_id;

    // Validate organizer permissions
   // if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
     // return res.status(403).json({ error: 'Only organizers can create events' });
    //}

    // 1. Validate required fields
    if (!name || !date || !venue || !category || !deadline) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Validate deadline is future date
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= currentDate) {
      return res.status(400).json({ error: "Deadline must be a future date" });
    }

    //  Insert into database (event_id will be auto-generated)
    const result = await pool.query(
      `INSERT INTO events (name, description, date, venue, category, created_by, deadline, max_participants) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, description || '', date, venue, category, created_by, deadline, max_participants || null]
    );

    res.status(201).json({
      message: "Event created successfully",
      event: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create Event Error:', error.message);
    res.status(500).json({ error: "Event creation failed" });
  }
};

// GET /api/events - Show organizer's events with stats
export const getOrganizerEvents = async (req, res) => {
  try {
    // Get organizer from JWT token, not query parameter
    const organizer_id = req.user.user_id;
    
    const result = await pool.query(
      `SELECT e.*,
              COUNT(DISTINCT r.user_id) AS reg_count,
              COUNT(DISTINCT va.user_id) AS vol_count
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.event_id
       LEFT JOIN volunteer_applications va ON va.event_id = e.event_id
       WHERE e.created_by = $1 AND e.deadline > NOW()
       GROUP BY e.event_id
       ORDER BY e.date ASC`,
      [organizer_id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Fetch Events Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// GET /api/events/:id/report - Get event summary
export const getEventReport = async (req, res) => {
  const { id } = req.params; // Event ID from URL

  try {
    const result = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT r.user_id) AS total_attendees,
        COUNT(DISTINCT CASE WHEN va.status = 'accepted' THEN va.user_id END) AS total_volunteers
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id
      LEFT JOIN volunteer_applications va ON e.event_id = va.event_id
      WHERE e.event_id = $1
      `,
      [id] // ✅ PostgreSQL uses $1 here
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      data: result.rows[0] // Return the first row
    });
  } catch (error) {
    console.error('Error generating event report:', error.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// GET /api/events/:id- Get event by id
export const getEventByID = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM events
       WHERE event_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const event = result.rows[0];
    res.json({ success: true, data: event });
  } catch (err) {
    console.error(`Error fetching event ${id}:`, err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
