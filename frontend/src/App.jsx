import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import authService from './services/authService.js';

// Dashboards
import AdminDashboard from './components/admin/Dashboard.jsx';
import StudentDashboard from './components/student/StudentDashboard.jsx';
import OrganizerDashboard from './components/organizer/OrganizerDashboard.jsx';

// admin new imports here
import AdminClasses from './components/admin/AdminClasses.jsx';
import ClassDashboard from './components/admin/ClassDashboard.jsx';
import ReportsTable from './components/admin/ReportsTable.jsx';
import SystemOverview from './components/admin/SystemOverview.jsx';

// Organizer
import CreateEvent from './components/organizer/CreateEvent.jsx' ;
import VolunteerApproval from './components/organizer/VolunteerApproval.jsx';
import EventReport from './components/organizer/EventReport.jsx';
import ManageEvents from './components/organizer/ManageEvents.jsx';
import EventDetails from './components/organizer/pages/EventDetails.jsx';

// Student pages
import MyEvents from './components/student/MyEvents.jsx';
import MyReports from './components/student/MyReports.jsx';
import Notifications from './components/student/Notifications.jsx';

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

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        
          {/* Admin Dashboard */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes/:className/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ClassDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes/:className/report"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system-stats"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemOverview />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/events"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/reports"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student/notifications"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Organizer Routes */}
          <Route
            path="/dashboard/organizer"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizer/create"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizer/volunteer_approval"
            element={
              <ProtectedRoute allowedRoles={['organizer','admin']}>
                <VolunteerApproval />
              </ProtectedRoute>
            }
          />
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

          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated user redirect */}
          <Route
            path="/home"
            element={
              authService.isAuthenticated() ? (
                <Navigate to={`/dashboard/${authService.getCurrentUser().role}`} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;