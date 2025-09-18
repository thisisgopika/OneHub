import api from './api.js';
import authService from './authService.js';

const eventService = {
  create: async (eventcreate) => {
    try {
      const response = await api.post('/events', eventcreate);

      if (response.error) {
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getOrganizerEvents: async () => {
    try {
      //const user = authService.getCurrentUser();
      //const user_id = user.user_id;
      const response = await api.get(`/events/organizer`);
      console.log(response);
      // Make sure response.events exists
      return { success: true, data: response.events || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getEventReport: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/report`);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to fetch event report' };
      }
    } catch (error) {
      console.error('Error fetching event report:', error.message);
      return { success: false, error: error.message || 'Something went wrong' };
    }
  },

  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return { success: true, data: response.data }; // wrap in success
    } catch (err) {
      console.error(`Error fetching event ${eventId}:`, err);
      return { success: false, error: err.message };
    }
  },

  // Update Event
  updateEvent: async (event_id, eventUpdate) => {
    try {
      const response = await api.put(`/events/${event_id}`, eventUpdate);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error updating event ${event_id}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Delete Event
  deleteEvent: async (event_id) => {
    try {
      await api.delete(`/events/${event_id}`);
      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      console.error(`Error deleting event ${event_id}:`, error.message);
      return { success: false, error: error.message };
    }
  }
    
};

export default eventService;
