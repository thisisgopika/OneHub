import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService.js";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.login(formData);

      if (result.success) {
        const user = result.data; // ✅ already contains { user_id, role, name, email, token }
        console.log("Login successful:", user);

        // Redirect based on role
        switch (user.role) {
          case "admin":
            navigate("/dashboard/admin");
            break;
          case "student":
            navigate("/dashboard/student");
            break;
          case "organizer":
            navigate("/dashboard/organizer");
            break;
          default:
            navigate("/unauthorized");
        }
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-to-home">
        ← Back to Home
      </Link>
      
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="login-logo">
            OneHub
          </Link>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your OneHub account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">User ID</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your user ID (e.g., S101, O101)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
