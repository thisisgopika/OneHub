import { supabase } from '../config/supabaseClient.js';
import { notifyAllStudentsNewEvent } from './notificationController.js';

// ==============================
// Organizer Controllers
// ==============================

// Event creation controller
export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      venue,
      category,
      created_by,
      deadline,
      max_participants,
      registration_form_link
    } = req.body;

    if (!name || !date || !venue || !category || !created_by || !deadline) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const currentDate = new Date();
    const deadlineDate = new Date(deadline);

    if (deadlineDate <= currentDate) {
      return res.status(400).json({ error: "Deadline must be a future date" });
    }

    // Get max event_id
    const { data: maxIdData, error: maxIdError } = await supabase
      .from('events')
      .select('event_id')
      .order('event_id', { ascending: false })
      .limit(1);

    if (maxIdError) throw maxIdError;

    const maxId = maxIdData.length > 0 ? maxIdData[0].event_id : 0;
    const newEventId = maxId + 1;

    const { data, error } = await supabase
      .from('events')
      .insert({
        event_id: newEventId,
        name,
        description: description || '',
        date,
        venue,
        category,
        created_by,
        deadline,
        max_participants: max_participants || 100,
        registration_form_link: registration_form_link || null
      })
      .select()
      .single();

    if (error) throw error;

    // Send notifications to all students about the new event
    await notifyAllStudentsNewEvent(data);

    res.status(201).json({
      message: "Event created successfully",
      event: data
    });
  } catch (error) {
    console.error('Create Event Error:', error.message);
    res.status(500).json({ error: "Event creation failed" });
  }
};

// Organizer's events with stats
export const getOrganizerEvents = async (req, res) => {
  try {
    const organizer_id = req.user.user_id;
    
    const { data, error } = await supabase
      .from('organizer_event_summary')
      .select('*')
      .eq('created_by', organizer_id)
      .order('date', { ascending: true });

    if (error) throw error;

    const events = data.map(event => ({
      ...event,
      reg_count: event.registered_count,
      vol_count: event.total_volunteer_applications,
      volunteer_calls_enabled: event.volunteer_calls_enabled ?? true,
      registrations_enabled: event.registrations_enabled ?? true
    }));

    res.json({ events });
  } catch (error) {
    console.error('Fetch Events Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Event summary report
export const getEventReport = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: event } = await supabase
      .from('organizer_event_summary')
      .select('*')
      .eq('event_id', id)
      .single();

    const { data: registrations } = await supabase
      .from('registrations')
      .select('*, users(user_id, name, class, semester)')
      .eq('event_id', id);

    const { data: volunteers } = await supabase
      .from('volunteer_applications')
      .select('*, users(user_id, name, class, semester)')
      .eq('event_id', id);

    res.json({ 
      success: true, 
      data: {
        event: { name: event.name, date: event.date },
        stats: {
          total_attendees: event.registered_count || 0,
          total_volunteers: event.accepted_volunteers || 0,
          available_slots: event.available_slots || 0
        },
        registrations,
        volunteers
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Get event by ID
export const getEventByID = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(`Error fetching event ${id}:`, err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    date,
    venue,
    category,
    deadline,
    max_participants
  } = req.body;

  try {
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      throw checkError;
    }

    const { data, error } = await supabase
      .from('events')
      .update({
        name,
        description: description || '',
        date,
        venue,
        category,
        deadline,
        max_participants: max_participants || 100
      })
      .eq('event_id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Event updated successfully',
      data
    });
  } catch (error) {
    console.error('Update Event Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: eventCheck, error: checkError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      throw checkError;
    }

    await Promise.all([
      supabase.from('registrations').delete().eq('event_id', id),
      supabase.from('volunteer_applications').delete().eq('event_id', id)
    ]);

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('event_id', id);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete Event Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
};

// Toggle volunteer calls for an event
export const toggleVolunteerCalls = async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;

  try {
    const { data: eventCheck, error: checkError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', id)
      .eq('created_by', req.user.user_id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Event not found or not authorized' });
      }
      throw checkError;
    }

    const { data, error } = await supabase
      .from('events')
      .update({ volunteer_calls_enabled: enabled })
      .eq('event_id', id)
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes('volunteer_calls_enabled')) {
        return res.status(400).json({ 
          success: false, 
          error: 'Database migration required. Please run the add_event_controls.sql script first.' 
        });
      }
      throw error;
    }

    res.json({
      success: true,
      message: `Volunteer calls ${enabled ? 'enabled' : 'disabled'} successfully`,
      data
    });
  } catch (error) {
    console.error('Toggle Volunteer Calls Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update volunteer calls setting' });
  }
};

// Toggle registrations for an event
export const toggleRegistrations = async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;

  try {
    const { data: eventCheck, error: checkError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', id)
      .eq('created_by', req.user.user_id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Event not found or not authorized' });
      }
      throw checkError;
    }

    const { data, error } = await supabase
      .from('events')
      .update({ registrations_enabled: enabled })
      .eq('event_id', id)
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes('registrations_enabled')) {
        return res.status(400).json({ 
          success: false, 
          error: 'Database migration required. Please run the add_event_controls.sql script first.' 
        });
      }
      throw error;
    }

    res.json({
      success: true,
      message: `Registrations ${enabled ? 'enabled' : 'disabled'} successfully`,
      data
    });
  } catch (error) {
    console.error('Toggle Registrations Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update registrations setting' });
  }
};

// ==============================
// Student Controllers
// ==============================

// Get all events (for students)
export const getAllEvents = async (req, res) => {
  try {
    const { upcoming, category } = req.query;
    
    let query = supabase.from('events').select('*');

    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', today);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('date', { ascending: true });

    const { data, error } = await query;
    
    if (error) throw error;

    const eventsWithDefaults = data.map(event => ({
      ...event,
      volunteer_calls_enabled: event.volunteer_calls_enabled ?? true,
      registrations_enabled: event.registrations_enabled ?? true
    }));

    res.json({ events: eventsWithDefaults });
  } catch (err) {
    console.error('getAllEvents error:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};