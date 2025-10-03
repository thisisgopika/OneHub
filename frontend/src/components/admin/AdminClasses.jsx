import React, { useState, useEffect } from 'react';
import API from "../../services/api.js";
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService.js';
import AdminSidebarNav from './AdminSidebarNav';
import "../../styles/StudentDashboard.css";

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  
  const SEMESTERS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8']; 
  const BRANCHES = ['CS', 'DS', 'AI&ML', 'EC', 'EEE', 'Mech', 'Civil', 'IT']; 
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Handles the navigation
  const handleViewReport = () => {
    if (selectedSemester && selectedBranch) {
      const className = `S${selectedSemester} ${selectedBranch}`;
      const encodedClass = encodeURIComponent(className);
      navigate(`/admin/classes/${encodedClass}/report`);
    } else {
      alert('Please select both a Semester and a Branch.'); 
    }
  };
  
  // Fetch user info
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setUserName(user.username || user.name || 'Admin');
  }, []);

  // Fetch classes data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get('/admin/classes');
        setClasses(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setClassesError('Failed to load classes.');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
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
          <h1 className="dashboard-title">Classes Management</h1>
          <p className="dashboard-subtitle">View and manage class information across semesters</p>
        </div>

        {/* Generate Class Report Form - loads immediately */}
        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Generate Class Report</div>
          </div>
          
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Select Semester</label>
                <select 
                  className="form-select"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="">Choose Semester</option>
                  {SEMESTERS_OPTIONS.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Select Branch</label>
                <select 
                  className="form-select"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="">Choose Branch</option>
                  {BRANCHES.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn-primary"
              onClick={handleViewReport}
              disabled={!selectedSemester || !selectedBranch}
            >
              View Class Report
            </button>
          </div>
        </div>

        {/* Available Classes - only this section waits for API */}
        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Available Classes</div>
          </div>
          
          {loadingClasses ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading classes...</p>
            </div>
          ) : classesError ? (
            <div className="empty-state">
              <div className="empty-title">Unable to Load Classes</div>
              <div className="empty-description" style={{ color: '#ef4444' }}>
                {classesError}
              </div>
            </div>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No Classes Found</div>
              <div className="empty-description">
                No class data is currently available in the system.
              </div>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((classItem, index) => (
                <div key={index} className="class-card">
                  <div className="class-name">{classItem.class}</div>
                  <div className="class-description">
                    Class information and statistics
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminClasses;
