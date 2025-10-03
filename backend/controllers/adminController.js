import { supabase } from '../config/supabaseClient.js';

export const getClassList = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('class')
      .eq('role', 'student')
      .order('class');

    if (error) throw error;

    // Extract unique classes
    const uniqueClasses = [...new Set(data.map(row => row.class))].map(cls => ({ class: cls }));
    
    res.json(uniqueClasses);
  } catch (error) {
    console.error("Error in getClassList:", error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const getClassDashboard = async (req, res) => {
  try {
    const { class_name } = req.params;

    // Get total events participated by class
    const { data: eventsData, error: eventsError } = await supabase
      .from('registrations')
      .select(`
        event_id,
        users!inner (
          class
        )
      `)
      .eq('users.class', class_name);

    if (eventsError) throw eventsError;

    const totalEventsParticipated = new Set(eventsData.map(r => r.event_id)).size;

    // Get total volunteers from class
    const { count: totalVolunteers, error: volunteersError } = await supabase
      .from('volunteer_applications')
      .select(`
        user_id,
        users!inner (
          class
        )
      `, { count: 'exact' })
      .eq('status', 'accepted')
      .eq('users.class', class_name);

    if (volunteersError) throw volunteersError;

    // Get active students (those who registered for events)
    const { data: activeStudentsData, error: activeStudentsError } = await supabase
      .from('registrations')
      .select(`
        user_id,
        users!inner (
          class
        )
      `)
      .eq('users.class', class_name);

    if (activeStudentsError) throw activeStudentsError;

    const activeStudents = new Set(activeStudentsData.map(r => r.user_id)).size;

    const stats = {
      totalEventsParticipated,
      totalVolunteers: totalVolunteers || 0,
      activeStudents,
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

    // Get users of the specified class
    let userQuery = supabase
      .from('users')
      .select('name, user_id, semester')
      .eq('class', class_name);

    if (semester) {
      userQuery = userQuery.eq('semester', semester);
    }

    const { data: users, error: userError } = await userQuery;
    if (userError) throw userError;

    if (!users || users.length === 0) {
      return res.json([]);
    }

    const userIds = users.map(user => user.user_id);

    // Get registrations for these users
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('user_id, event_id')
      .in('user_id', userIds);

    if (regError) throw regError;

    // Get volunteer applications for these users
    const { data: volunteers, error: volError } = await supabase
      .from('volunteer_applications')
      .select('user_id, event_id, status')
      .in('user_id', userIds)
      .eq('status', 'accepted');

    if (volError) throw volError;

    // Get all event IDs
    const regEventIds = registrations.map(reg => reg.event_id);
    const volEventIds = volunteers.map(vol => vol.event_id);
    const allEventIds = [...new Set([...regEventIds, ...volEventIds])];

    // Get event details
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('event_id, name, date')
      .in('event_id', allEventIds);

    if (eventError) throw eventError;

    // Create maps for faster lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    const eventMap = {};
    events.forEach(event => {
      eventMap[event.event_id] = event;
    });

    // Build the report
    const report = [];

    // Add registrations
    registrations.forEach(reg => {
      const user = userMap[reg.user_id];
      const event = eventMap[reg.event_id];
      if (user && event) {
        report.push({
          name: user.name,
          user_id: user.user_id,
          semester: user.semester,
          event_name: event.name,
          participation_type: 'Attendee',
          date: event.date
        });
      }
    });

    // Add volunteer applications
    volunteers.forEach(vol => {
      const user = userMap[vol.user_id];
      const event = eventMap[vol.event_id];
      if (user && event) {
        report.push({
          name: user.name,
          user_id: user.user_id,
          semester: user.semester,
          event_name: event.name,
          participation_type: 'Volunteer',
          date: event.date
        });
      }
    });

    // Sort by date
    report.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(report);
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
    const [users, events, registrations, volunteers] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('events').select('*', { count: 'exact' }),
      supabase.from('registrations').select('*', { count: 'exact' }),
      supabase.from('volunteer_applications').select('*', { count: 'exact' }).eq('status', 'accepted')
    ]);

    const stats = {
      totalUsers: users.count || 0,
      totalEvents: events.count || 0,
      totalRegistrations: registrations.count || 0,
      totalVolunteers: volunteers.count || 0
    };
    res.json(stats);
  } catch (error) {
    console.error("Error in getSystemStats:", error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};