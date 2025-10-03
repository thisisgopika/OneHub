import React, { useState, useEffect } from 'react';
import API from "../../services/api.js";
import authService from '../../services/authService.js';
import AdminSidebarNav from './AdminSidebarNav';
import "../../styles/StudentDashboard.css";

function SystemOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
  const user = authService.getCurrentUser();
  if (user) setUserName(user.username || user.name || 'Admin');

  const fetchStats = async () => {
    try {
      // Using centralized API instance; token is automatically attached
      const response = await API.get('/admin/system-stats');
      setStats(response || {});
    } catch (err) {
      setError("Failed to fetch system stats.");
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

  return (
    <div className="student-dashboard">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <AdminSidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">System Overview</h1>
          <p className="dashboard-subtitle">System statistics and metrics</p>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading system statistics...</p>
          </div>
        ) : error || !stats ? (
          <div className="empty-state">
            <div className="empty-title">Unable to Load Data</div>
            <div className="empty-description">
              {error || "No system statistics available."}
            </div>
          </div>
        ) : (
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title">System Statistics</div>
            </div>
            
            <div className="stats-table">
              <div className="stats-table-row">
                <div className="stats-table-label">Total Users</div>
                <div className="stats-table-value">{stats.totalUsers || 'N/A'}</div>
              </div>
              <div className="stats-table-row">
                <div className="stats-table-label">Total Events</div>
                <div className="stats-table-value">{stats.totalEvents || 'N/A'}</div>
              </div>
              <div className="stats-table-row">
                <div className="stats-table-label">Total Volunteers</div>
                <div className="stats-table-value">{stats.totalVolunteers || 'N/A'}</div>
              </div>
              <div className="stats-table-row">
                <div className="stats-table-label">Total Registrations</div>
                <div className="stats-table-value">{stats.totalRegistrations || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemOverview;