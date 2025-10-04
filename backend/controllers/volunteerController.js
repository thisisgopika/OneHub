import { supabase } from '../config/supabaseClient.js';

// ==============================
// Organizer Controllers
// ==============================

export const getEventVolunteers = async (req, res) => {
  try {
    const { id } = req.params; // id = event_id

    // First get volunteer applications
    const { data: applications, error: appError } = await supabase
      .from('volunteer_applications')
      .select('app_id, event_id, user_id, status, applied_date, semester')
      .eq('event_id', id)
      .order('applied_date', { ascending: true });

    if (appError) throw appError;

    if (!applications || applications.length === 0) {
      return res.json({ volunteers: [] });
    }

    // Get user IDs
    const userIds = applications.map(app => app.user_id);

    // Then get user details separately
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, name, class')
      .in('user_id', userIds);

    if (usersError) throw usersError;

    // Create a map for faster lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    // Combine the data
    const volunteers = applications.map(app => ({
      app_id: app.app_id,
      event_id: app.event_id,
      user_id: app.user_id,
      status: app.status,
      applied_date: app.applied_date,
      semester: app.semester, // Use semester from application
      name: userMap[app.user_id]?.name || 'Unknown',
      class: userMap[app.user_id]?.class || 'Unknown'
    }));

    res.json({ volunteers });
  } catch (error) {
    console.error('Get Event Volunteers Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

export const acceptVolunteer = async (req, res) => {
  try {
    const { id } = req.params; // app_id

    // Update volunteer application
    const { data: updateData, error: updateError } = await supabase
      .from('volunteer_applications')
      .update({
        status: 'accepted',
        decision_date: new Date().toISOString()
      })
      .eq('app_id', id)
      .select('event_id, user_id')
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Volunteer application not found' });
      }
      throw updateError;
    }

    const { event_id, user_id } = updateData;

    // Get event name
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('name')
      .eq('event_id', event_id)
      .single();

    if (eventError) throw eventError;

    const eventName = eventData?.name || 'the event';

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id,
        message: `You are selected as Volunteer for ${eventName}`,
        status: 'unread',
        created_at: new Date().toISOString()
      });

    res.json({ message: 'Volunteer accepted successfully' });
  } catch (error) {
    console.error('Accept Volunteer Error:', error.message);
    res.status(500).json({ error: 'Failed to accept volunteer' });
  }
};

export const rejectVolunteer = async (req, res) => {
  try {
    const { id } = req.params; // app_id

    // Update volunteer application
    const { data: updateData, error: updateError } = await supabase
      .from('volunteer_applications')
      .update({
        status: 'rejected',
        decision_date: new Date().toISOString()
      })
      .eq('app_id', id)
      .select('user_id')
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Volunteer application not found' });
      }
      throw updateError;
    }

    const { user_id } = updateData;

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id,
        message: `Your volunteer request was rejected`,
        status: 'unread',
        created_at: new Date().toISOString()
      });

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
    const { data: existing, error: checkError } = await supabase
      .from('volunteer_applications')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user_id);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Already applied as volunteer' });
    }

    // Check if already registered for this event
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user_id);

    if (regError) throw regError;

    if (registration && registration.length > 0) {
      return res.status(400).json({ error: 'Cannot apply as volunteer - you are already registered for this event' });
    }

    // Get max app_id
    const { data: maxIdData, error: maxIdError } = await supabase
      .from('volunteer_applications')
      .select('app_id')
      .order('app_id', { ascending: false })
      .limit(1);

    if (maxIdError) throw maxIdError;

    const maxId = maxIdData.length > 0 ? maxIdData[0].app_id : 0;
    const newAppId = maxId + 1;

    // Get user's current semester
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('semester')
      .eq('user_id', user_id)
      .single();

    if (userError) throw userError;

    if (!user.semester) {
      return res.status(400).json({ error: 'User semester not found' });
    }

    // Insert application with semester
    const { data, error } = await supabase
      .from('volunteer_applications')
      .insert({
        app_id: newAppId,
        event_id: eventId,
        user_id: user_id,
        status: 'pending',
        semester: user.semester
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Volunteer application submitted',
      application: data
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

    // First get volunteer applications
    const { data: applications, error: appError } = await supabase
      .from('volunteer_applications')
      .select('app_id, status, applied_date, event_id, semester')
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (appError) throw appError;

    if (!applications || applications.length === 0) {
      return res.json({ success: true, volunteers: [] });
    }

    // Get event IDs
    const eventIds = applications.map(app => app.event_id);

    // Then get event details separately
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('event_id, name, date')
      .in('event_id', eventIds);

    if (eventsError) throw eventsError;

    // Create a map for faster lookup
    const eventMap = {};
    events.forEach(event => {
      eventMap[event.event_id] = event;
    });

    // Combine the data
    const volunteers = applications.map(app => ({
      app_id: app.app_id,
      status: app.status,
      applied_date: app.applied_date,
      event_id: app.event_id,
      semester: app.semester,
      event_name: eventMap[app.event_id]?.name || 'Unknown Event',
      date: eventMap[app.event_id]?.date || null
    }));

    res.json({ success: true, volunteers });
  } catch (error) {
    console.error('getVolunteersByUser error:', error.message);
    res.status(500).json({ error: 'Failed to fetch volunteer applications' });
  }
};
