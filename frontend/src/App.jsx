import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import authService from './services/authService.js';

import AdminDashboard from './components/admin/Dashboard.jsx';
import StudentDashboard from './components/student/Dashboard.jsx';
import OrganizerDashboard from './components/organizer/Dashboard.jsx';

import CreateEvent from './components/organizer/CreateEvent.jsx' ;
import VolunteerApproval from './components/organizer/VolunteerApproval.jsx';
import EventReport from './components/organizer/EventReport.jsx';
import ManageEvents from './components/organizer/ManageEvents.jsx';
import EventDetails from './components/organizer/pages/EventDetails.jsx';

// Simple Dashboard component for testing
/*
const Dashboard = () => {
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to OneHub Dashboard!</h1>
      {user && (
        <div>
          <h3>Hello, {user.name}!</h3>
          <p>User ID: {user.user_id}</p>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
      <button 
        onClick={handleLogout}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Logout
      </button>
    </div>
  );
}; */

// Unauthorized page
const Unauthorized = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <h2>403 - Unauthorized</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {

  const isAuthenticated = authService.isAuthenticated();

  const user = authService.getCurrentUser();
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
          {/* Role-Specific Dashboards */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute  allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/organizer"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          {/* Nested route for creating events */}
          <Route
            path="/dashboard/organizer/create"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          {/* Nested route for volunteer approval */}
          <Route
            path="/dashboard/organizer/volunteer_approval"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <VolunteerApproval />
              </ProtectedRoute>
            }
          />
          {/* Nested route for Event report */}
          <Route
            path="/dashboard/organizer/event_report"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <EventReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizer/events/:eventId"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <EventDetails />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default redirect */}
          <Route
            path="/"
            element={
              authService.isAuthenticated() ? (
                <Navigate to={`/dashboard/${authService.getCurrentUser().role}`} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;