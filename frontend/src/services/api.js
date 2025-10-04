const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta?.env?.PROD ? 'https://onehub-backend-wqbd.onrender.com/api' : 'http://localhost:5000/api');

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
    
    const result = await response.json();
    
    // If response is not ok, throw an error with the server's error message
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    
    return result;
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
    
    const result = await response.json();
    
    // If response is not ok, throw an error with the server's error message
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  },

  // PUT request
  put: async (endpoint, data = {}, token = null) => {
    const headers = { 'Content-Type': 'application/json' };

    // Automatically get token if not provided
    if (!token) {
      token = authService.getToken();
    }

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    // If response is not ok, throw an error with the server's error message
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return result;
  },

  // DELETE request
  delete: async (endpoint, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Automatically get token if not provided
    if (!token) {
      token = authService.getToken();
    }

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();
    
    // If response is not ok, throw an error with the server's error message
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return result;
  },

};

export default api;