import pool from '../config/database.js';

export const getClassList = async (req, res) => {
  try {
    const query = "SELECT DISTINCT class FROM users WHERE role = 'student' ORDER BY class";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error in getClassList:", error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};


export const getClassDashboard = async (req, res) => {
  try {
    const { class_name } = req.params;

    const totalEventsQuery = "SELECT COUNT(DISTINCT r.event_id) FROM registrations r JOIN users u ON u.user_id = r.user_id WHERE u.class = $1";
    const totalVolunteersQuery = "SELECT COUNT(DISTINCT va.user_id) FROM volunteer_applications va JOIN users u ON u.user_id = va.user_id WHERE u.class = $1 AND va.status = 'accepted'";
    const activeStudentsQuery = "SELECT COUNT(DISTINCT u.user_id) FROM registrations r JOIN users u ON u.user_id = r.user_id WHERE u.class = $1"; // Fix here

    const [eventsResult, volunteersResult, studentsResult] = await Promise.all([
      pool.query(totalEventsQuery, [class_name]),
      pool.query(totalVolunteersQuery, [class_name]),
      pool.query(activeStudentsQuery, [class_name]),
    ]);

    const stats = {
      totalEventsParticipated: eventsResult.rows[0]?.count || 0,
      totalVolunteers: volunteersResult.rows[0]?.count || 0,
      activeStudents: studentsResult.rows[0]?.count || 0,
    };
    res.json(stats);
  } catch (error) {
    console.error("Error in getClassDashboard:", error);
    res.status(500).json({ error: 'Failed to fetch class dashboard' });
  }
};

export const getClassReport = async (req, res) => {
  try {
    const { class_name } = req.params;
    const { semester } = req.query;

    let query = `
      SELECT u.name, u.user_id, u.semester, e.name as event_name,
        CASE WHEN r.user_id IS NOT NULL THEN 'Attendee'
             WHEN va.status = 'accepted' THEN 'Volunteer' END as participation_type,
        e.date
      FROM users u
      LEFT JOIN registrations r ON u.user_id = r.user_id
      LEFT JOIN volunteer_applications va ON u.user_id = va.user_id AND va.status = 'accepted'
      LEFT JOIN events e ON (r.event_id = e.event_id OR va.event_id = e.event_id)
      WHERE u.class = $1
    `;

    const values = [class_name];

    if (semester) {
      query += ' AND u.semester = $2';
      values.push(semester);
    }

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Error in getClassReport:", error);
    res.status(500).json({ error: 'Report generation failed' });
  }
};

export const exportClassReport = async (req, res) => {
  try {
    res.json({ message: 'Export functionality is not yet implemented.' });
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsersQuery = 'SELECT COUNT(*) FROM users';
    const totalEventsQuery = 'SELECT COUNT(*) FROM events';
    const totalRegistrationsQuery = 'SELECT COUNT(*) FROM registrations';
    const totalVolunteersQuery = 'SELECT COUNT(*) FROM volunteer_applications WHERE status = \'accepted\'';

    const [users, events, registrations, volunteers] = await Promise.all([
      pool.query(totalUsersQuery),
      pool.query(totalEventsQuery),
      pool.query(totalRegistrationsQuery),
      pool.query(totalVolunteersQuery)
    ]);

    const stats = {
      totalUsers: users.rows[0].count,
      totalEvents: events.rows[0].count,
      totalRegistrations: registrations.rows[0].count,
      totalVolunteers: volunteers.rows[0].count
    };
    res.json(stats);
  } catch (error) {
    console.error("Error in getSystemStats:", error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};