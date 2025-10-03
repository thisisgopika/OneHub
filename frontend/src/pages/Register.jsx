import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService.js';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'student',
    class: '',
    semester: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const SEMESTERS_OPTIONS = ['1','2','3','4','5','6','7','8'];
  const BRANCHES = ['CS','DS','AI&ML','EC','EEE','Mech','Civil','IT'];

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle student-specific dropdown changes
  const handleStudentFieldChange = (field, value) => {
    const updated = { ...formData, [field]: value };

    if (field === 'semester') {
      updated.semester = value;
    }
    if (field === 'branch') {
      updated.branch = value;
    }

    // Build class only if both semester and branch are chosen
    if (updated.semester && updated.branch) {
      updated.class = `S${updated.semester} ${updated.branch}`;
    }

    setFormData(updated);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { confirmPassword, branch, ...registrationData } = formData;

    if (registrationData.semester) {
      registrationData.semester = parseInt(registrationData.semester);
    }

    try {
      const result = await authService.register(registrationData);

      if (result.success) {
        setSuccess('Registration successful! You can now login.');
        setFormData({
          user_id: '',
          password: '',
          confirmPassword: '',
          name: '',
          email: '',
          role: 'student',
          class: '',
          semester: '',
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <Link to="/" className="back-to-home">
        ← Back to Home
      </Link>

      <div className="register-container">
        <div className="register-header">
          <Link to="/" className="register-logo">OneHub</Link>
          <h1 className="register-title">Join OneHub</h1>
          <p className="register-subtitle">Create your account to get started</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">User ID</label>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="e.g., S101, O101, A101"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your email address"
            />
          </div>

          {formData.role === 'student' && (
            <div className="student-fields">
              <div className="student-fields-title">Student Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={(e) => handleStudentFieldChange('semester', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Choose Semester</option>
                    {SEMESTERS_OPTIONS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch || ''}
                    onChange={(e) => handleStudentFieldChange('branch', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Choose Branch</option>
                    {BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Create password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
