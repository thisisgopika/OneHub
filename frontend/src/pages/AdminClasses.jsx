// frontend/src/pages/AdminClasses.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService.js';
import DashboardLayout from '../components/common/DashboardLayout'; // 👈 NEW IMPORT

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(''); // State for layout
  
  const navigate = useNavigate();
  
  // --- Define Theme Constants ---
  const BACKGROUND_COLOR = 'rgba(20, 20, 25, 1)';
  const TEXT_COLOR = '#ffffff';
  const SUBTLE_TEXT_COLOR = 'rgba(255, 255, 255, 0.7)';
  const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
  const BORDER_RADIUS = '12px';
  const ACCENT_COLOR = '#ff3c1f';
  
  const SEMESTERS_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8']; 
  const BRANCHES = ['CS', 'DS', 'AI/ML', 'EC', 'EEE', 'Mech', 'Civil', 'IT']; 
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  // ------------------------------

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
  
  // Existing useEffect (fetching user info and checking classes)
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setUserName(user.username || 'Admin');

    const fetchClasses = async () => {
      try {
        const token = authService.getToken();
        // The API call to get all classes is still useful for initial checks
        await axios.get( 'http://localhost:5000/api/admin/classes', { headers: { Authorization: `Bearer ${token}` } } );
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);


  const selectStyle = {
    padding: '10px',
    borderRadius: BORDER_RADIUS,
    backgroundColor: 'rgba(30, 30, 35, 0.9)',
    color: TEXT_COLOR,
    border: `1px solid ${BORDER_COLOR}`,
    fontSize: '16px',
    cursor: 'pointer',
    marginRight: '15px'
  };
  
  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: ACCENT_COLOR,
    color: TEXT_COLOR,
    border: 'none',
    borderRadius: BORDER_RADIUS,
    cursor: 'pointer'
  };


  if (loading) return <div style={{ backgroundColor: BACKGROUND_COLOR, color: TEXT_COLOR, padding: '30px', minHeight: '100vh' }}>Loading...</div>;
  if (error) return <div style={{ backgroundColor: BACKGROUND_COLOR, color: TEXT_COLOR, padding: '30px', minHeight: '100vh' }}>{error}</div>;


  return (
    <DashboardLayout userType="admin" userName={userName}>
        <div 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center content horizontally
          }}
        >
          <h1 
            style={{ 
              textAlign: 'center', 
              textDecoration: 'underline', 
              color: TEXT_COLOR,
              marginBottom: '30px'
            }}
          >
            Admin: Class Selection
          </h1>
          
          <p style={{ color: SUBTLE_TEXT_COLOR, marginBottom: '25px' }}>
            Select a combination of semester and branch to view the class dashboard and reports.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            
            {/* SEMESTER FILTER */}
            <select 
              style={selectStyle}
              onChange={(e) => setSelectedSemester(e.target.value)}
              value={selectedSemester}
            >
              <option value="" disabled>Select Semester</option>
              {SEMESTERS_OPTIONS.map(sem => (
                <option key={sem} value={sem} style={{ backgroundColor: 'rgba(20, 20, 25, 0.9)' }}>
                  Semester {sem}
                </option>
              ))}
            </select>

            {/* BRANCH FILTER */}
            <select 
              style={selectStyle}
              onChange={(e) => setSelectedBranch(e.target.value)}
              value={selectedBranch}
            >
              <option value="" disabled>Select Branch</option>
              {BRANCHES.map(branch => (
                <option key={branch} value={branch} style={{ backgroundColor: 'rgba(20, 20, 25, 0.9)' }}>
                  {branch}
                </option>
              ))}
            </select>
            
            {/* VIEW REPORT BUTTON */}
            <button 
              style={buttonStyle}
              onClick={handleViewReport}
            >
              View Report
            </button>
          </div>
          
        </div>
    </DashboardLayout>
  );
}

export default AdminClasses;