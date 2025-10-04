import { useEffect, useState } from "react";
import OrganizerSidebarNav from "./OrganizerSidebarNav";
import "../../styles/StudentDashboard.css";
import "../../styles/OrganizerDashboard.css";
import API from "../../services/api.js";
import authService from "../../services/authService";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await API.get("/events/organizer");
        const myEvents = eventsRes.events || [];
        
        setEvents(myEvents);

        const now = new Date();
        const upcomingCount = myEvents.filter(e => new Date(e.date) > now).length;
        
        setStats({
          totalEvents: myEvents.length,
          upcomingEvents: upcomingCount,
        });
      } catch (err) {
        console.error("Error fetching organizer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id]);

  return (
    <div className="student-dashboard">
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <OrganizerSidebarNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome, {user?.name || "Organizer"}!
          </h1>
          <p className="dashboard-subtitle">
            Manage your events and volunteers
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Events</div>
            <div className="stat-value">{stats.totalEvents}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Upcoming Events</div>
            <div className="stat-value">{stats.upcomingEvents}</div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Your Events</div>
          </div>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No Events</div>
              <div className="empty-description">
                Create a new event to get started!
              </div>
            </div>
          ) : (
            <div className="events-grid">
             {events.map((event) => (
                <div key={event.event_id} className="event-card">
                  <div className="event-header">
                    <h3 className="event-title">{event.name}</h3>
                    <div className="event-date-badge">
                      <span>{new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-meta">
                    <div className="event-venue">
                      <span className="meta-icon">📍</span>
                      <span>{event.venue}</span>
                    </div>
                    <div className="event-capacity">
                      <span className="meta-icon">👥</span>
                      <span>{event.reg_count || 0} registered</span>
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = `/dashboard/organizer/events/${event.event_id}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}