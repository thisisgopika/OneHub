import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from "../../services/api.js";
import authService from '../../services/authService.js';
import AdminSidebarNav from './AdminSidebarNav';
import "../../styles/StudentDashboard.css";

function ReportsTable() {
  const { className } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
  const user = authService.getCurrentUser();
  if (user) setUserName(user.username || user.name || 'Admin');

  const fetchReport = async () => {
    try {
      // Using centralized API instance; token is automatically attached
      const response = await API.get(`/admin/classes/${className}/report`);
      setReportData(Array.isArray(response) ? response : []);
    } catch (err) {
      setError("Failed to fetch report data. Check backend logs for SQL error."); 
    } finally {
      setLoading(false);
    }
  };

  if (className) {
    fetchReport();
  }
}, [className]);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading report data for {decodeURIComponent(className)}...</p>
        </div>
      </div>
    );
  }

  if (error || reportData.length === 0) {
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
            <h1 className="dashboard-title">Class Report</h1>
            <p className="dashboard-subtitle">{decodeURIComponent(className)} - Participation Details</p>
          </div>
          
          <div className="empty-state">
            <div className="empty-title">No Report Data</div>
            <div className="empty-description">
              {error || "No report data found for this class combination."}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="dashboard-title">Class Report</h1>
          <p className="dashboard-subtitle">{decodeURIComponent(className)} - Participation Details</p>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Participation Report</div>
          </div>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>User ID</th>
                  <th>Event Name</th>
                  <th>Participation Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name || 'N/A'}</td>
                    <td>{row.user_id || 'N/A'}</td>
                    <td>{row.event_name || 'N/A'}</td>
                    <td>{row.participation_type || 'N/A'}</td>
                    <td>{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsTable;