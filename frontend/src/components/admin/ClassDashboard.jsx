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
  const [promoting, setPromoting] = useState(false);

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

  const handlePromote = async (promotionType) => {
    if (!window.confirm(`Are you sure you want to promote all students in ${decodeURIComponent(className)} to the next ${promotionType}?`)) {
      return;
    }

    setPromoting(true);
    try {
      const response = await API.post(`/admin/classes/${className}/promote`, {
        promotionType
      });
      
      alert(`Successfully promoted ${response.promotedStudents} students to the next ${promotionType}!`);
      
      // Refresh stats after promotion
      const updatedResponse = await API.get(`/admin/classes/${className}/dashboard`);
      setStats(updatedResponse || {});
    } catch (err) {
      console.error('Promotion error:', err);
      alert(err.response?.data?.error || 'Failed to promote students. Please try again.');
    } finally {
      setPromoting(false);
    }
  };

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
                <div className="section-title">Class Promotion</div>
                <div className="section-subtitle">Promote all students to the next semester</div>
              </div>
              
              <div className="promotion-info">
                <div className="info-item">
                  <span className="info-label">📚</span>
                  <span className="info-text">This will advance all students in this class by one semester (e.g., S5 → S6)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">⚠️</span>
                  <span className="info-text">This action cannot be undone. Please verify before proceeding.</span>
                </div>
              </div>
              
              <div className="quick-actions">
                <button 
                  onClick={() => handlePromote('semester')}
                  disabled={promoting}
                  className="action-button promote-semester"
                >
                  {promoting ? 'Promoting...' : 'Promote to Next Semester'}
                </button>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">Actions</div>
              </div>
              
              <div className="quick-actions">
                <Link to={`/admin/classes/${className}/report`} className="action-button">
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