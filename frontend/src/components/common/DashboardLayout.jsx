// frontend/src/components/common/DashboardLayout.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService'; // Make sure path is correct

export default function DashboardLayout({ children, userType, userName }) {
  // --- Theme Colors ---
  const BACKGROUND_COLOR = 'rgba(20, 20, 25, 1)';
  const ACCENT_COLOR = '#ff3c1f';
  const TEXT_COLOR = '#ffffff';
  const SUBTLE_TEXT_COLOR = 'rgba(255, 255, 255, 0.7)';
  const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
  const BORDER_RADIUS = '12px';

  const location = useLocation(); // To highlight active link

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/'; // Redirect to login/home page
  };

  const navLinks = userType === 'admin' ? [
    { name: 'Dashboard', path: '/dashboard/admin' },
    { name: 'System Stats', path: '/admin/system-stats' },
    { name: 'Classes List', path: '/admin/classes' },
    // Add other admin links here if any
  ] : [
    { name: 'Dashboard', path: '/dashboard/student' },
    { name: 'My Events', path: '/student/events' }, // Example for student
    { name: 'My Reports', path: '/student/reports' }, // Example for student
    { name: 'Notifications', path: '/student/notifications' }, // Example for student
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: BACKGROUND_COLOR }}>
      {/* Sidebar */}
      <div 
        style={{ 
          width: '250px', 
          backgroundColor: 'rgba(25, 25, 30, 0.9)', // Slightly darker for sidebar
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: `1px solid ${BORDER_COLOR}`
        }}
      >
        <h2 style={{ color: ACCENT_COLOR, marginBottom: '30px', textAlign: 'center' }}>OneHub</h2>
        
        {/* User Info */}
        <div style={{ marginBottom: '40px', textAlign: 'center', paddingBottom: '20px', borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <p style={{ color: TEXT_COLOR, fontSize: '1.1em', fontWeight: 'bold' }}>
            Welcome back, {userName}!
          </p>
          <p style={{ color: SUBTLE_TEXT_COLOR, fontSize: '0.9em' }}>
            {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </p>
        </div>

        {/* Navigation Links */}
        <nav style={{ flexGrow: 1 }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              style={{
                display: 'block',
                padding: '12px 15px',
                marginBottom: '10px',
                borderRadius: BORDER_RADIUS,
                textDecoration: 'none',
                color: TEXT_COLOR,
                fontWeight: 'bold',
                backgroundColor: location.pathname === link.path ? ACCENT_COLOR : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: ACCENT_COLOR,
                }
              }}
              onMouseOver={(e) => { 
                if (location.pathname !== link.path) e.currentTarget.style.backgroundColor = 'rgba(255, 60, 31, 0.3)'; 
              }}
              onMouseOut={(e) => { 
                if (location.pathname !== link.path) e.currentTarget.style.backgroundColor = 'transparent'; 
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: ACCENT_COLOR,
            color: TEXT_COLOR,
            border: 'none',
            borderRadius: BORDER_RADIUS,
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '30px',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 60, 31, 0.8)',
            }
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, padding: '30px', color: TEXT_COLOR, overflowY: 'auto' }}>
        {children} {/* This is where the specific dashboard content will go */}
      </div>
    </div>
  );
}