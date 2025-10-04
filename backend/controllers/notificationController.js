import { supabase } from '../config/supabaseClient.js';

// ==============================
// Utility Functions
// ==============================

// Create notification for all students when a new event is created
export const notifyAllStudentsNewEvent = async (eventData) => {
  try {
    // Get all students from the users table
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('user_id')
      .eq('role', 'student');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return;
    }

    if (!students || students.length === 0) {
      console.log('No students found to notify');
      return;
    }

    // Create notification message
    const message = `New event added: ${eventData.name}`;

    // Prepare notifications for all students
    const notifications = students.map(student => ({
      user_id: student.user_id,
      message: message,
      status: 'unread'
    }));

    // Insert all notifications at once
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      return;
    }

  } catch (error) {
    console.error('Error in notifyAllStudentsNewEvent:', error);
  }
};

// ==============================
// Student Notifications
// ==============================

// Get all notifications for a student
export const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .select('notif_id, user_id, message, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, notifications: data });
  } catch (error) {
    console.error('getNotificationsByUser error:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params; // notif_id

    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('notif_id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Notification not found' });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: data
    });
  } catch (error) {
    console.error('markNotificationRead error:', error.message);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};
