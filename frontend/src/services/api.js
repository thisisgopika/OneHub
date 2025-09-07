
// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create API client with default configuration
const api = {
  // GET request
  get: async (endpoint, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    return response.json();
  },
  
  // POST request
  post: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // PUT request
  put: async (endpoint, data = {}, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return response.json();
  },

};

export default api;
