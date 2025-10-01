import React, { useEffect, useState } from 'react';
import DashboardLayout from '../common/DashboardLayout'; 
import authService from '../../services/authService';
import axios from 'axios';

export default function AdminDashboard() {
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [keyStats, setKeyStats] = useState({ totalUsers: '...', totalEvents: '...', totalVolunteers: '...' });
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Define Theme Colors ---
  const TEXT_COLOR = '#ffffff';
  const SUBTLE_TEXT_COLOR = 'rgba(255, 255, 255, 0.7)';
  const ACCENT_COLOR = '#ff3c1f';
  const CARD_BACKGROUND = 'rgba(30, 30, 35, 1)';
  const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
  const BORDER_RADIUS = '12px';
  // ---------------------------

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserName(user.username || 'Admin');
      setUserEmail(user.email || 'admintest@gmail.com');
      setUserId(user.user_id || 'HaneenAdmin');
    }

    // Fetch Key System Stats for the landing cards
    const fetchKeyStats = async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(
                'http://localhost:5000/api/admin/system-stats',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setKeyStats({
                totalUsers: response.data.totalUsers,
                totalEvents: response.data.totalEvents,
                totalVolunteers: response.data.totalVolunteers,
            });
        } catch (error) {
            setKeyStats({ totalUsers: 'N/A', totalEvents: 'N/A', totalVolunteers: 'N/A' });
        } finally {
            setLoadingStats(false);
        }
    };
    fetchKeyStats();
  }, []);

  // Component for a structured stat box
  const StatCard = ({ title, value, color }) => (
    <div 
      style={{
        backgroundColor: CARD_BACKGROUND,
        padding: '20px 25px',
        borderRadius: BORDER_RADIUS,
        flex: 1, // Ensures even spacing
        textAlign: 'left',
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <p style={{ color: SUBTLE_TEXT_COLOR, fontSize: '0.9em', margin: '0 0 5px 0' }}>{title}</p>
      <h2 style={{ color: color, fontSize: '2.0em', margin: '0', fontWeight: 'bold' }}>
        {loadingStats ? '...' : value}
      </h2>
    </div>
  );
  
  // Component for the dynamic content block (mimicking 'My Registrations')
  const DynamicBlock = ({ title, content, icon }) => (
    <div 
      style={{
        backgroundColor: CARD_BACKGROUND,
        padding: '25px',
        borderRadius: BORDER_RADIUS,
        flex: 1,
        minHeight: '250px',
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <h3 style={{ color: TEXT_COLOR, marginBottom: '20px', fontSize: '1.4em', fontWeight: 'bold' }}>
        {title}
      </h3>
      <div style={{ textAlign: 'center', color: SUBTLE_TEXT_COLOR, marginTop: '50px' }}>
        {icon}
        <p style={{ marginTop: '10px' }}>{content}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout userType="admin" userName={userName}>
      {/* 1. Large Welcome Message (Matching Student Dashboard Style) */}
      <h1 
        style={{ 
          color: TEXT_COLOR, 
          marginBottom: '5px',
          fontWeight: 'bold',
          fontSize: '2.5em',
          textAlign: 'left' // Align left to match student dashboard
        }}
      >
        Welcome back, <span style={{ color: ACCENT_COLOR }}>{userName}</span>!
      </h1>
      <p style={{ color: SUBTLE_TEXT_COLOR, marginBottom: '40px', fontSize: '1.1em', textAlign: 'left' }}>
        Here's what's happening in your administration ecosystem.
      </p>

      {/* 2. Main Stat Cards (Matching Student Dashboard Cards) */}
      <div style={{ display: 'flex', gap: '20px', width: '100%', marginBottom: '40px' }}>
        <StatCard 
          title="Total Registered Users" 
          value={keyStats.totalUsers} 
          color="#3498db" // Blue Accent
        />
        <StatCard 
          title="Total Events Hosted" 
          value={keyStats.totalEvents} 
          color="#2ecc71" // Green Accent
        />
        <StatCard 
          title="Total Volunteers" 
          value={keyStats.totalVolunteers} 
          color={ACCENT_COLOR} // Orange Accent
        />
      </div>

      {/* 3. Dynamic Blocks (Mimicking Registrations and Notifications) */}
      <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
        <DynamicBlock
          title="Admin Tasks"
          icon={<span style={{ fontSize: '3em', color: SUBTLE_TEXT_COLOR }}>⚙️</span>}
          content="Use the sidebar to view detailed statistics, manage reports, or check class data."
        />
        <DynamicBlock
          title="Current User"
          icon={<span style={{ fontSize: '3em', color: SUBTLE_TEXT_COLOR }}>👤</span>}
          content={
            <>
              User ID: <strong style={{ color: TEXT_COLOR }}>{userId}</strong><br/>
              Email: <strong style={{ color: TEXT_COLOR }}>{userEmail}</strong>
            </>
          }
        />
      </div>

    </DashboardLayout>
  );
}