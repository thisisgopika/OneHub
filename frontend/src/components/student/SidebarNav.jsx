import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import authService from '../../services/authService';
import './SidebarNav.css';

const SidebarNav = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.status === 'unread').length;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">OneHub</div>
          <div className="sidebar-user">
            Welcome back, {user?.name || 'Student'}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard/student"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/student/events"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            My Events
          </NavLink>

          <NavLink
            to="/dashboard/student/reports"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            My Reports
          </NavLink>

          <NavLink
            to="/dashboard/student/notifications"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Notifications
            {getUnreadCount() > 0 && (
              <span className="nav-badge">{getUnreadCount()}</span>
            )}
          </NavLink>

          <div className="nav-divider" />

          <button
            onClick={handleLogout}
            className="nav-item logout-btn"
          >
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default SidebarNav;
