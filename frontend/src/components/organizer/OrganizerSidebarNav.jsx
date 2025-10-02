import React from 'react';
import { NavLink } from 'react-router-dom';
import authService from '../../services/authService';
import './OrganizerSidebarNav.css';

const OrganizerSidebarNav = ({ isOpen, onClose }) => {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">OneHub</div>
          <div className="sidebar-user">
            Welcome back, {user?.name || 'Organizer'}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard/organizer"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/organizer/create"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Create Event
          </NavLink>

          <NavLink
            to="/dashboard/organizer/events"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Manage Events
          </NavLink>

          <NavLink
            to="/dashboard/organizer/volunteer_approval"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Volunteers
          </NavLink>

          <NavLink
            to="/dashboard/organizer/event_report"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Reports
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

export default OrganizerSidebarNav;