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
      max_participants
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
        max_participants: max_participants || 100
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
    
    // First get events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', organizer_id)
      .order('date', { ascending: true });

    if (eventsError) throw eventsError;

    // Then get stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const [registrations, volunteers] = await Promise.all([
          supabase
            .from('registrations')
            .select('user_id', { count: 'exact' })
            .eq('event_id', event.event_id),
          supabase
            .from('volunteer_applications')
            .select('user_id', { count: 'exact' })
            .eq('event_id', event.event_id)
        ]);

        return {
          ...event,
          reg_count: registrations.count || 0,
          vol_count: volunteers.count || 0
        };
      })
    );

    res.json({ events: eventsWithStats });
  } catch (error) {
    console.error('Fetch Events Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Event summary report
export const getEventReport = async (req, res) => {
  const { id } = req.params;
  try {
    const [attendees, volunteers] = await Promise.all([
      supabase
        .from('registrations')
        .select('user_id', { count: 'exact' })
        .eq('event_id', id),
      supabase
        .from('volunteer_applications')
        .select('user_id', { count: 'exact' })
        .eq('event_id', id)
        .eq('status', 'accepted')
    ]);

    const reportData = {
      total_attendees: attendees.count || 0,
      total_volunteers: volunteers.count || 0
    };

    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error('Error generating event report:', error.message);
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
    // Check if event exists
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

    // Update event
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
    // Check if event exists
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

    // Delete related records first (cascade delete)
    await Promise.all([
      supabase.from('registrations').delete().eq('event_id', id),
      supabase.from('volunteer_applications').delete().eq('event_id', id)
    ]);

    // Delete the event
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

// ==============================
// Student Controllers
// ==============================

// Get all events (for students) — supports ?upcoming=true and ?category=...
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

    res.json({ events: data });
  } catch (err) {
    console.error('getAllEvents error:', err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};