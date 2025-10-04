import React from 'react';
import { NavLink } from 'react-router-dom';
import authService from '../../services/authService';
import './AdminSidebarNav.css';

const AdminSidebarNav = ({ isOpen, onClose }) => {
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
            Welcome back, {user?.name || user?.username || 'Admin'}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard/admin"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/system-stats"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            System Overview
          </NavLink>

          <NavLink
            to="/admin/classes"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Classes
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

export default AdminSidebarNav;