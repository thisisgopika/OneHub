import pool from '../config/database.js';

// Event creation controller
export const createEvent = async (req, res) => {
  try {
    const {
      event_id,
      name,
      description,
      date,
      venue,
      category,
      created_by,
      deadline,
      max_participants
    } = req.body;

    // 1. Validate required fields
    if (!event_id || !name || !date || !venue || !category || !created_by || !deadline) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // 2. Ensure deadline is a future date
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);

    if (deadlineDate <= currentDate) {
      return res.status(400).json({ error: "Deadline must be a future date" });
    }

    // 3. Check if event already exists (using event_id)
    const existingEvent = await pool.query(
      'SELECT event_id FROM events WHERE event_id = $1',
      [event_id]
    );

    if (existingEvent.rows.length > 0) {
      return res.status(400).json({ error: "Event ID already exists" });
    }

    // 4. Insert into database
    const result = await pool.query(
      `INSERT INTO events 
        (event_id, name, description, date, venue, category, created_by, deadline, max_participants) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        event_id,
        name,
        description || '',
        date,
        venue,
        category,
        created_by,
        deadline,
        max_participants || null
      ]
    );

    const newEvent = result.rows[0];
    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });

  } catch (error) {
    console.error('Create Event Error:', error.message);
    res.status(500).json({ error: "Event creation failed" });
  }
};

// GET /api/events - Show organizer's events with stats
export const getOrganizerEvents = async (req, res) => {
  try {
    const organizer_id = req.query.organizer_id; // frontend passes ?organizer_id=O101

    const result = await pool.query(
      `SELECT e.*,
              COUNT(r.user_id) AS reg_count,
              COUNT(va.user_id) AS vol_count
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.event_id
       LEFT JOIN volunteer_applications va ON va.event_id = e.event_id
       WHERE e.created_by = $1
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
