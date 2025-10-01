// frontend/src/pages/ReportsTable.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService.js';
import DashboardLayout from '../components/common/DashboardLayout'; // 👈 NEW IMPORT

function ReportsTable() {
  const { className } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(''); // State for layout

  // --- Define Theme Colors ---
  const BACKGROUND_COLOR = 'rgba(20, 20, 25, 1)';
  const ACCENT_COLOR = '#ff3c1f';
  const TEXT_COLOR = '#ffffff';
  const SUBTLE_TEXT_COLOR = 'rgba(255, 255, 255, 0.7)';
  const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
  const BORDER_RADIUS = '12px';
  // ---------------------------

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setUserName(user.username || 'Admin');

    const fetchReport = async () => {
      try {
        const token = authService.getToken();
        const response = await axios.get(
          `http://localhost:5000/api/admin/classes/${className}/report`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReportData(response.data);
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

  // Style for all messages (Loading, Error, No Data)
  const messageContent = (
    loading ? <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Loading report data for {decodeURIComponent(className)}...</div>
    : error ? <div style={{ color: TEXT_COLOR, textAlign: 'center' }}>Error: {error}</div>
    : <div style={{ padding: '20px', backgroundColor: 'rgba(30, 30, 35, 0.9)', borderRadius: BORDER_RADIUS, textAlign: 'center', maxWidth: '400px' }}>
        <p style={{ color: SUBTLE_TEXT_COLOR, fontWeight: 'bold' }}>
          No report data found for this class combination.
        </p>
      </div>
  );

  if (loading || error || reportData.length === 0) {
    return <DashboardLayout userType="admin" userName={userName}>{messageContent}</DashboardLayout>;
  }

  return (
    <DashboardLayout userType="admin" userName={userName}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 
          style={{ 
            textAlign: 'center', 
            textDecoration: 'underline', 
            color: TEXT_COLOR,
            marginBottom: '30px'
          }}
        >
          Report for {decodeURIComponent(className)}
        </h1>

        <p style={{ color: SUBTLE_TEXT_COLOR, marginBottom: '20px' }}>
          Class participation details
        </p>

        <table 
          style={{
            width: '100%',
            maxWidth: '900px',
            borderCollapse: 'collapse',
            borderRadius: BORDER_RADIUS,
            overflow: 'hidden',
            border: `1px solid ${BORDER_COLOR}`,
            textAlign: 'left',
          }}
        >
          <thead>
            <tr>
              {['Name', 'User ID', 'Event Name', 'Participation Type', 'Date'].map(header => (
                <th 
                  key={header}
                  style={{ 
                    backgroundColor: ACCENT_COLOR,
                    color: TEXT_COLOR, 
                    padding: '12px 15px', 
                    fontSize: '1.0em',
                    fontWeight: 'bold'
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'rgba(30, 30, 35, 0.9)' : 'transparent' }}>
                <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR }}>{row.name}</td>
                <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR }}>{row.user_id}</td>
                <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR }}>{row.event_name}</td>
                <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR }}>{row.participation_type}</td>
                <td style={{ padding: '10px 15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_TEXT_COLOR }}>{new Date(row.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default ReportsTable;