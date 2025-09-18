import api from './api.js';

const volunteerService = {
  // 1️⃣ Get volunteers for a specific event
  getEventVolunteers: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/volunteers`);
      console.log('Backend response:', response);
      // Wrap in success object
      return { success: true, data: response.volunteers || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 2️⃣ Accept a volunteer
  acceptVolunteer: async (appId) => {
    try {
      const response = await api.put(`/events/volunteers/${appId}/accept`, {});
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 3️⃣ Reject a volunteer
  rejectVolunteer: async (appId) => {
    try {
      const response = await api.put(`/events/volunteers/${appId}/reject`, {});
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default volunteerService;
