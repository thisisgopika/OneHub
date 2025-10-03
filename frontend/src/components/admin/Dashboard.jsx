import React, { useEffect, useState } from 'react';
import AdminSidebarNav from './AdminSidebarNav';
import authService from '../../services/authService';
import API from "../../services/api.js";
import "../../styles/StudentDashboard.css";

export default function AdminDashboard() {
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [keyStats, setKeyStats] = useState({ totalUsers: '...', totalEvents: '...', totalVolunteers: '...' });
  const [loadingStats, setLoadingStats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
  const user = authService.getCurrentUser();
  if (user) {
    setUserName(user.username || user.name);
    setUserEmail(user.email);
    setUserId(user.user_id);
  }

  // Fetch Key System Stats for the dashboard cards
  const fetchKeyStats = async () => {
    try {
      // Using centralized API instance; token is automatically attached
      const response = await API.get('/admin/system-stats');
      const data = response || {};
      setKeyStats({
        totalUsers: data.totalUsers,
        totalEvents: data.totalEvents,
        totalVolunteers: data.totalVolunteers,
      });
    } catch (error) {
      setKeyStats({ totalUsers: 'N/A', totalEvents: 'N/A', totalVolunteers: 'N/A' });
    } finally {
      setLoadingStats(false);
    }
  };

  fetchKeyStats();
}, []);

  if (loadingStats) {
    return (
      <div className="student-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar Navigation */}
      <AdminSidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {userName}!</h1>
          <p className="dashboard-subtitle">Here's what's happening in your administration ecosystem</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{keyStats.totalUsers}</div>
            <div className="stat-description">Registered users</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Events</div>
            <div className="stat-value">{keyStats.totalEvents}</div>
            <div className="stat-description">Events hosted</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Volunteers</div>
            <div className="stat-value">{keyStats.totalVolunteers}</div>
            <div className="stat-description">Active volunteers</div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Admin Tasks Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title">Admin Tasks</div>
            </div>
            
            <div className="admin-tasks">
              <div className="task-item">
                <div className="task-icon">⚙️</div>
                <div className="task-content">
                  <div className="task-title">System Management</div>
                  <div className="task-description">Use the sidebar to view detailed statistics and manage the platform</div>
                </div>
              </div>
              <div className="task-item">
                <div className="task-icon">📊</div>
                <div className="task-content">
                  <div className="task-title">View Reports</div>
                  <div className="task-description">Access system overview and class-specific reports</div>
                </div>
              </div>
              <div className="task-item">
                <div className="task-icon">🎓</div>
                <div className="task-content">
                  <div className="task-title">Manage Classes</div>
                  <div className="task-description">View and manage class information across semesters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-column">
            {/* Current User Info */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">Current User</div>
              </div>
              
              <div className="user-info">
                <div className="user-detail">
                  <div className="detail-label">User ID</div>
                  <div className="detail-value">{userId}</div>
                </div>
                <div className="user-detail">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{userEmail}</div>
                </div>
                <div className="user-detail">
                  <div className="detail-label">Role</div>
                  <div className="detail-value">Administrator</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">Quick Actions</div>
              </div>
              
              <div className="quick-actions">
                <a href="/admin/system-stats" className="action-button">
                  <span className="action-icon">�</span>
                  System Overview
                </a>
                <a href="/admin/classes" className="action-button">
                  <span className="action-icon">📚</span>
                  Manage Classes
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}