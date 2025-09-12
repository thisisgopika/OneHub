import pool from '../config/database.js';

// ==============================
// Organizer Controllers
// ==============================

export const getEventVolunteers = async (req, res) => {
  try {
    const { id } = req.params; // id = event_id

    const result = await pool.query(
      `SELECT va.app_id, va.event_id, va.user_id, va.status, va.applied_date, 
              u.name, u.class, u.semester
       FROM volunteer_applications va
       JOIN users u ON va.user_id = u.user_id
       WHERE va.event_id = $1
       ORDER BY va.applied_date ASC`,
      [id]
    );

    res.json({ volunteers: result.rows });
  } catch (error) {
    console.error('Get Event Volunteers Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

export const acceptVolunteer = async (req, res) => {
  try {
    const { id } = req.params; // app_id

    const update = await pool.query(
      `UPDATE volunteer_applications
       SET status = 'accepted', decision_date = NOW()
       WHERE app_id = $1
       RETURNING event_id, user_id`,
      [id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer application not found' });
    }

    const { event_id, user_id } = update.rows[0];

    const eventRes = await pool.query(
      'SELECT name FROM events WHERE event_id = $1',
      [event_id]
    );
    const eventName = eventRes.rows[0]?.name || 'the event';

    await pool.query(
      `INSERT INTO notifications (user_id, message, status, created_at)
       VALUES ($1, $2, 'unread', NOW())`,
      [user_id, `You are selected as Volunteer for ${eventName}`]
    );

    res.json({ message: 'Volunteer accepted successfully' });
  } catch (error) {
    console.error('Accept Volunteer Error:', error.message);
    res.status(500).json({ error: 'Failed to accept volunteer' });
  }
};

export const rejectVolunteer = async (req, res) => {
  try {
    const { id } = req.params; // app_id

    const update = await pool.query(
      `UPDATE volunteer_applications
       SET status = 'rejected', decision_date = NOW()
       WHERE app_id = $1
       RETURNING user_id`,
      [id]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer application not found' });
    }

    const { user_id } = update.rows[0];

    await pool.query(
      `INSERT INTO notifications (user_id, message, status, created_at)
       VALUES ($1, $2, 'unread', NOW())`,
      [user_id, `Your volunteer request was rejected`]
    );

    res.json({ message: 'Volunteer rejected successfully' });
  } catch (error) {
    console.error('Reject Volunteer Error:', error.message);
    res.status(500).json({ error: 'Failed to reject volunteer' });
  }
};

// ==============================
// Student Controllers
// ==============================

// Apply as volunteer
export const applyVolunteer = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { id: eventId } = req.params;

    // Already applied?
    const check = await pool.query(
      'SELECT * FROM volunteer_applications WHERE event_id = $1 AND user_id = $2',
      [eventId, user_id]
    );
    if (check.rows.length) {
      return res.status(400).json({ error: 'Already applied as volunteer' });
    }

    const insert = await pool.query(
      'INSERT INTO volunteer_applications (event_id, user_id) VALUES ($1, $2) RETURNING *',
      [eventId, user_id]
    );

    res.status(201).json({
      message: 'Volunteer application submitted',
      application: insert.rows[0]
    });
  } catch (error) {
    console.error('applyVolunteer error:', error.message);
    res.status(500).json({ error: 'Failed to apply as volunteer' });
  }
};

// Get volunteer applications of a student
export const getVolunteersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const q = `
      SELECT v.app_id, v.status, v.applied_date,
             e.event_id, e.name AS event_name, e.date
      FROM volunteer_applications v
      JOIN events e ON v.event_id = e.event_id
      WHERE v.user_id = $1
      ORDER BY v.applied_date DESC
    `;

    const { rows } = await pool.query(q, [userId]);
    res.json({ success: true, volunteers: rows });
  } catch (error) {
    console.error('getVolunteersByUser error:', error.message);
    res.status(500).json({ error: 'Failed to fetch volunteer applications' });
  }
};
