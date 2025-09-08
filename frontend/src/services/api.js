const API_BASE_URL = 'http://localhost:5000/api';

import authService from './authService.js'; // Add this import

const api = {
  get: async (endpoint, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Automatically get token if not provided
    if (!token) {
      token = authService.getToken();
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    return response.json();
  },
  
  post: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Automatically get token if not provided
    if (!token) {
      token = authService.getToken();
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    return response.json();
  }
};

export default api;