import { supabase } from '../config/supabaseClient.js';

// ==============================
// Student Registrations
// ==============================

// Register student for an event
export const register = async (req, res) => {
  try {
    const user_id = req.user.user_id; // from auth middleware
    const { id: eventId } = req.params;

    // 1. Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('deadline, max_participants')
      .eq('event_id', eventId)
      .single();

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found' });
      }
      throw eventError;
    }

    // 2. Deadline check
    if (event.deadline && new Date(event.deadline) < new Date()) {
      return res.status(400).json({ error: 'Registration deadline passed' });
    }

    // 3. Already registered?
    const { data: existing, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user_id);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // 3.1. Check if already applied as volunteer for this event
    const { data: volunteerApp, error: volunteerError } = await supabase
      .from('volunteer_applications')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user_id);

    if (volunteerError) throw volunteerError;

    if (volunteerApp && volunteerApp.length > 0) {
      return res.status(400).json({ error: 'Cannot register for event - you have already applied as a volunteer for this event' });
    }

    // 4. Capacity check
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId);

    if (countError) throw countError;

    if (count >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // 5. Get user's current semester
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('semester')
      .eq('user_id', user_id)
      .single();

    if (userError) throw userError;

    if (!user.semester) {
      return res.status(400).json({ error: 'User semester not found' });
    }

    // 6. Insert registration with semester
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        user_id: user_id,
        semester: user.semester
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      message: 'Registered successfully',
      registration
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

    const { data, error } = await supabase
      .from('registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user_id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
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

    // First get registrations
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('reg_id, status, registration_date, event_id, semester')
      .eq('user_id', userId)
      .order('registration_date', { ascending: false });

    if (regError) throw regError;

    if (!registrations || registrations.length === 0) {
      return res.json({ success: true, registrations: [] });
    }

    // Get event IDs
    const eventIds = registrations.map(reg => reg.event_id);

    // Then get event details separately
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('event_id, name, date, venue')
      .in('event_id', eventIds);

    if (eventsError) throw eventsError;

    // Create a map for faster lookup
    const eventMap = {};
    events.forEach(event => {
      eventMap[event.event_id] = event;
    });

    // Combine the data and sort by event date
    const combinedRegistrations = registrations.map(reg => ({
      reg_id: reg.reg_id,
      status: reg.status,
      registration_date: reg.registration_date,
      event_id: reg.event_id,
      semester: reg.semester,
      name: eventMap[reg.event_id]?.name || 'Unknown Event',
      date: eventMap[reg.event_id]?.date || null,
      venue: eventMap[reg.event_id]?.venue || 'Unknown Venue'
    }));

    // Sort by event date (most recent first)
    combinedRegistrations.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, registrations: combinedRegistrations });
  } catch (err) {
    console.error('getRegistrationsForUser error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
