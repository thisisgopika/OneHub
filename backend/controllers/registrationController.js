import pool from '../config/database.js';

// ==============================
// Student Registrations
// ==============================

// Register student for an event
export const register = async (req, res) => {
  try {
    const user_id = req.user.user_id; // from auth middleware
    const { id: eventId } = req.params;

    // 1. Check if event exists
    const eventQ = 'SELECT deadline, max_participants FROM events WHERE event_id = $1';
    const { rows: eventRows } = await pool.query(eventQ, [eventId]);
    if (!eventRows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const event = eventRows[0];

    // 2. Deadline check
    if (event.deadline && new Date(event.deadline) < new Date()) {
      return res.status(400).json({ error: 'Registration deadline passed' });
    }

    // 3. Already registered?
    const checkQ = 'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2';
    const { rows: existing } = await pool.query(checkQ, [eventId, user_id]);
    if (existing.length) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // 4. Capacity check
    const countQ = 'SELECT COUNT(*) FROM registrations WHERE event_id = $1';
    const { rows: countRows } = await pool.query(countQ, [eventId]);
    if (parseInt(countRows[0].count) >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // 5. Insert registration
    const insertQ = 'INSERT INTO registrations (event_id, user_id) VALUES ($1, $2) RETURNING *';
    const { rows: regRows } = await pool.query(insertQ, [eventId, user_id]);

    res.status(201).json({
      message: 'Registered successfully',
      registration: regRows[0]
    });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel registration
export const cancel = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id: eventId } = req.params;

    const delQ = 'DELETE FROM registrations WHERE event_id = $1 AND user_id = $2 RETURNING *';
    const { rows } = await pool.query(delQ, [eventId, user_id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ success: true, message: 'Registration cancelled' });
  } catch (err) {
    console.error('cancel error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all registrations of a student
export const getRegistrationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const q = `
      SELECT r.reg_id, r.status, r.registration_date,
             e.event_id, e.name, e.date, e.venue
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      WHERE r.user_id = $1
      ORDER BY e.date DESC
    `;

    const { rows } = await pool.query(q, [userId]);
    res.json({ success: true, registrations: rows });
  } catch (err) {
    console.error('getRegistrationsForUser error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
