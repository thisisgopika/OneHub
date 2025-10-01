import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import authService from '../services/authService.js';

function ClassDashboard() {
  const { className } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Define Theme Colors ---
  const BACKGROUND_COLOR = 'rgba(20, 20, 25, 1)';
  const ACCENT_COLOR = '#ff3c1f';
  const TEXT_COLOR = '#ffffff';
  const SUBTLE_TEXT_COLOR = 'rgba(255, 255, 255, 0.7)';
  const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
  const BORDER_RADIUS = '12px';
  // ---------------------------

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = authService.getToken();
        const response = await axios.get(
          `http://localhost:5000/api/admin/classes/${className}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(response.data);
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

  // Style for all messages (Loading, Error, No Data)
  const messageStyle = {
    backgroundColor: BACKGROUND_COLOR,
    color: TEXT_COLOR,
    padding: '30px',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2em'
  };

  if (loading) return <div style={messageStyle}>Loading dashboard stats for {className}...</div>;
  if (error) return <div style={messageStyle}>Error: {error}</div>;
  if (!stats) return <div style={messageStyle}>No stats available for this class.</div>;

  return (
    // Main container with dark theme
    <div 
      style={{ 
        padding: '30px', 
        backgroundColor: BACKGROUND_COLOR, 
        color: TEXT_COLOR, 
        minHeight: '100vh',
        borderRadius: BORDER_RADIUS,
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
        Dashboard for {decodeURIComponent(className)}
      </h1>

      <hr style={{ borderColor: BORDER_COLOR, width: '80%', maxWidth: '600px', margin: '20px 0 40px 0' }} />

      {/* Stats Table */}
      <table 
        style={{
          width: '80%',
          maxWidth: '600px',
          borderCollapse: 'collapse',
          borderRadius: BORDER_RADIUS,
          overflow: 'hidden',
          border: `1px solid ${BORDER_COLOR}`,
          marginBottom: '30px' // Space before the button
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
              Total Events Participated
            </td>
            <td style={{ padding: '15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: ACCENT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
              {stats.totalEventsParticipated}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
              Total Volunteers
            </td>
            <td style={{ padding: '15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: ACCENT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
              {stats.totalVolunteers}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '15px', color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
              Active Students
            </td>
            <td style={{ padding: '15px', color: ACCENT_COLOR, textAlign: 'right', fontWeight: 'bold' }}>
              {stats.activeStudents}
            </td>
          </tr>
        </tbody>
      </table>

      {/* View Report Button (Orange Accent) */}
      <Link to={`/admin/classes/${className}/report`}>
        <button 
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: ACCENT_COLOR, // Orange accent
            color: TEXT_COLOR,
            border: 'none',
            borderRadius: BORDER_RADIUS,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          View Report
        </button>
      </Link>
    </div>
  );
}

export default ClassDashboard;