// frontend/src/pages/SystemOverview.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService.js';
import DashboardLayout from '../components/common/DashboardLayout'; // 👈 NEW IMPORT

function SystemOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(''); // State for layout

  // --- Define Theme Colors ---
  const TEXT_COLOR = '#ffffff';
  const SUBTLE_TEXT_COLOR = 'rgba(255, 255, 255, 0.7)';
  const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
  const BORDER_RADIUS = '12px';
  const ACCENT_COLOR = '#ff3c1f';
  // ---------------------------

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setUserName(user.username || 'Admin');

    const fetchStats = async () => {
      try {
        const token = authService.getToken();
        const response = await axios.get(
          'http://localhost:5000/api/admin/system-stats',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch system stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Style for all messages (Loading, Error, No Data)
  const messageContent = (
    loading ? <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading system statistics...</div>
    : error ? <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Error: {error}</div>
    : !stats ? <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>No system statistics available.</div>
    : null
  );

  if (loading || error || !stats) {
    return <DashboardLayout userType="admin" userName={userName}>{messageContent}</DashboardLayout>;
  }

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
          System Overview
        </h1>
        
        <hr style={{ borderColor: BORDER_COLOR, width: '80%', maxWidth: '600px', margin: '20px 0 40px 0' }} />
        
        {/* Table for System Stats */}
        <table 
          style={{
            width: '80%',
            maxWidth: '600px',
            margin: '0 auto', // Center the table
            borderCollapse: 'collapse',
            borderRadius: BORDER_RADIUS,
            overflow: 'hidden',
            border: `1px solid ${BORDER_COLOR}`
          }}
        >
          <thead>
            <tr>
              <th 
                style={{ 
                  backgroundColor: ACCENT_COLOR, 
                  color: TEXT_COLOR, 
                  padding: '15px', 
                  textAlign: 'left',
                  fontSize: '1.1em'
                }}
              >
                Metric
              </th>
              <th 
                style={{ 
                  backgroundColor: ACCENT_COLOR, 
                  color: TEXT_COLOR, 
                  padding: '15px', 
                  textAlign: 'right',
                  fontSize: '1.1em'
                }}
              >
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
                Total Users
              </td>
              <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
                {stats.totalUsers}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
                Total Events
              </td>
              <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
                {stats.totalEvents}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
                Total Registrations
              </td>
              <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
                {stats.totalRegistrations}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
                Total Volunteers
              </td>
              <td style={{ padding: '10px 15px', color: TEXT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
                {stats.totalVolunteers}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default SystemOverview;