import pool from '../config/database.js';

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
  
      // 1. Update volunteer status to 'accepted'
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
  
      // 2. Get event name
      const eventRes = await pool.query(
        'SELECT name FROM events WHERE event_id = $1',
        [event_id]
      );
      const eventName = eventRes.rows[0]?.name || 'the event';
  
      // 3. Insert notification
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
  
      // 1. Update volunteer status to 'rejected'
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
  
      // 2. Insert notification
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
  
  