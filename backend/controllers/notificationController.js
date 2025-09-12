import pool from '../config/database.js';

// ==============================
// Student Notifications
// ==============================

// Get all notifications for a student
export const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const q = `
      SELECT notif_id, user_id, message, status, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(q, [userId]);
    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('getNotificationsByUser error:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params; // notif_id

    const updateQ = `
      UPDATE notifications
      SET status = 'read'
      WHERE notif_id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(updateQ, [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: rows[0]
    });
  } catch (error) {
    console.error('markNotificationRead error:', error.message);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};
