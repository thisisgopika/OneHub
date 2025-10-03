import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from "../../services/api.js";
import authService from '../../services/authService.js';
import AdminSidebarNav from './AdminSidebarNav';
import "../../styles/StudentDashboard.css";

function ClassDashboard() {
  const { className } = useParams();
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
        const response = await API.get(`/admin/classes/${className}/dashboard`);
        setStats(response || {});
      } catch (err) {
        setError("Failed to fetch class dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    if (className) {
      fetchStats();
    }
  }, [className]);

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
          <h1 className="dashboard-title">Class Dashboard</h1>
          <p className="dashboard-subtitle">{decodeURIComponent(className)}</p>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading class dashboard for {decodeURIComponent(className)}...</p>
          </div>
        ) : error || !stats ? (
          <div className="empty-state">
            <div className="empty-title">Unable to Load Data</div>
            <div className="empty-description" style={{ color: '#ef4444' }}>
              {error || "No dashboard data available for this class."}
            </div>
            <div className="back-link" style={{ marginTop: '1rem' }}>
              <Link to="/admin/classes" className="action-button">
                ← Back to Classes
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">Class Statistics</div>
              </div>
              
              <div className="stats-table">
                <div className="stats-table-row">
                  <div className="stats-table-label">Total Students</div>
                  <div className="stats-table-value">{stats.totalStudents || 'N/A'}</div>
                </div>
                <div className="stats-table-row">
                  <div className="stats-table-label">Event Participation</div>
                  <div className="stats-table-value">{stats.eventParticipation || 'N/A'}</div>
                </div>
                <div className="stats-table-row">
                  <div className="stats-table-label">Volunteer Participation</div>
                  <div className="stats-table-value">{stats.volunteerParticipation || 'N/A'}</div>
                </div>
                <div className="stats-table-row">
                  <div className="stats-table-label">Total Activities</div>
                  <div className="stats-table-value">{stats.totalActivities || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">Actions</div>
              </div>
              
              <div className="quick-actions">
                <Link to={`/admin/classes/${className}/report`} className="action-button">
                  <span className="action-icon">📊</span>
                  View Detailed Report
                </Link>
                <Link to="/admin/classes" className="action-button">
                  <span className="action-icon">←</span>
                  Back to Classes
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ClassDashboard;