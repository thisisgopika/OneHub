import { useEffect, useState } from "react";
import OrganizerSidebarNav from "./OrganizerSidebarNav.jsx";
import EventCard from "../student/EventCard.jsx";
import "../../styles/StudentDashboard.css"; // Reuse student dashboard styles

import API from "../../services/api.js";
import authService from "../../services/authService";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    pendingVolunteers: 0,
    upcomingEvents: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsRes = await API.get("/events/organizer");
        setEvents(eventsRes.events || []);

        // For now, calculate stats from events data since we don't have a dedicated stats endpoint
        const now = new Date();
        const allEvents = eventsRes.events || [];
        const upcomingCount = allEvents.filter(e => new Date(e.date) > now).length;
        
        setStats({
          totalEvents: allEvents.length,
          upcomingEvents: upcomingCount,
        });
      } catch (err) {
        console.error("Error fetching organizer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="student-dashboard" style={{ minHeight: "100vh", background: "#1a1a1a" }}>
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar Navigation */}
      <OrganizerSidebarNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title" style={{ color: "#fff" }}>
            Welcome, {user?.name || "Organizer"}!
          </h1>
          <p className="dashboard-subtitle" style={{ color: "#ccc" }}>
            Manage your events and volunteers
          </p>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-title">Total Events</div>
              <div className="stat-value">{stats.totalEvents}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Registrations</div>
              <div className="stat-value">{stats.totalRegistrations}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Pending Volunteers</div>
              <div className="stat-value">{stats.pendingVolunteers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Upcoming Events</div>
              <div className="stat-value">{stats.upcomingEvents}</div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title" style={{ color: "#fff" }}>
              Your Events
            </div>
          </div>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p style={{ color: "#fff" }}>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title" style={{ color: "#fff" }}>No Events</div>
              <div className="empty-description" style={{ color: "#ccc" }}>
                Create a new event to get started!
              </div>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  isOrganizer={true}
                  // Add organizer-specific props/actions if needed
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}