import API from "../api.js";

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await API.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post("/auth/login", credentials);

      // ✅ Try to extract token + user safely
      const token = response.data?.token;
      const user = response.data?.user || response.data?.data || null;

      if (token && user) {
        // Save both token and user together
        localStorage.setItem("user", JSON.stringify({ ...user, token }));
        return { success: true, data: { ...user, token } };
      } else {
        return { success: false, error: "Invalid login response from server" };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Get token only
  getToken: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).token : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  },
};

export default authService;
