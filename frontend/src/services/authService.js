import api from './api.js';

// Authentication service - connects to your backend
const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.token) {
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true, data: response };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token; // Returns true if token exists, false if not
  }
};

export default authService;