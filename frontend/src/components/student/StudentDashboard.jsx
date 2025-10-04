import { useEffect, useState } from "react";
import API from "../../services/api.js";
import SidebarNav from "./SidebarNav.jsx";
import EventCard from "./EventCard.jsx";
import RegistrationStatus from "./RegistrationStatus.jsx";
import NotificationItem from "./NotificationItem.jsx";
import authService from "../../services/authService";
import "../../styles/StudentDashboard.css";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const [errorEvents, setErrorEvents] = useState(null);
  const [errorRegistrations, setErrorRegistrations] = useState(null);
  const [errorNotifications, setErrorNotifications] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  const user = authService.getCurrentUser();
  const userId = user?.user_id;

  useEffect(() => {
    // Fetch upcoming events
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const eventsRes = await API.get("/events?upcoming=true");
        const fetchedEvents = eventsRes.events || [];
        setEvents(fetchedEvents);
        setErrorEvents(null);

        // Extract unique categories for filter dropdown
        const uniqueCategories = Array.from(new Set(fetchedEvents.map(e => e.category))).sort();
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching events:", err);
        setErrorEvents("Failed to load upcoming events.");
      } finally {
        setLoadingEvents(false);
      }
    };

    // Fetch user registrations and volunteer applications
    const fetchRegistrations = async () => {
      setLoadingRegistrations(true);
      try {
        if (userId) {
          const regRes = await API.get(`/users/${userId}/registrations`);
          setRegistrations(regRes.registrations || []);

          const volunteerRes = await API.get(`/users/${userId}/volunteers`);
          setVolunteerApplications(volunteerRes.volunteers || []);
        }
        setErrorRegistrations(null);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setErrorRegistrations("Failed to load registrations.");
      } finally {
        setLoadingRegistrations(false);
      }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        if (userId) {
          const notifRes = await API.get(`/users/${userId}/notifications`);
          setNotifications(notifRes.notifications || []);
        }
        setErrorNotifications(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setErrorNotifications("Failed to load notifications.");
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchEvents();
    fetchRegistrations();
    fetchNotifications();
  }, [userId]);

  const handleRegister = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/register`);
      alert("✅ Registered successfully!");
      // Refresh events and registrations
      window.location.reload();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "❌ Registration failed";
      alert(errorMessage);
    }
  };

  const handleVolunteer = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/volunteer`);
      alert("✅ Volunteer application submitted!");
      window.location.reload();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "❌ Application failed";
      alert(errorMessage);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await API.put(`/users/notifications/${notifId}/read`);
      setNotifications(prev =>
        prev.map(n => n.notif_id === notifId ? { ...n, status: 'read' } : n)
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const isVolunteerApplied = (eventId) => {
    return volunteerApplications.some(app => app.event_id === eventId);
  };

  // Filter events based on search term and category
  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="student-dashboard">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <SidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your events</p>
        </div>

        <div className="dashboard-grid">
          {/* Upcoming Events Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title">Upcoming Events</div>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search by event title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingEvents ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading upcoming events...</p>
              </div>
            ) : errorEvents ? (
              <div className="empty-state">
                <div className="empty-title">Error</div>
                <div className="empty-description" style={{ color: '#ef4444' }}>
                  {errorEvents}
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No Events Found</div>
                <div className="empty-description">
                  No events match your search or selected category.
                </div>
              </div>
            ) : (
              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    onRegister={handleRegister}
                    onVolunteer={handleVolunteer}
                    isRegistered={registrations.some(r => r.event_id === event.event_id)}
                    isVolunteer={isVolunteerApplied(event.event_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* My Registrations Section */}
          <div className="dashboard-column">
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">My Registrations</div>
              </div>

              {loadingRegistrations ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading your registrations...</p>
                </div>
              ) : errorRegistrations ? (
                <div className="empty-state">
                  <div className="empty-title">Error</div>
                  <div className="empty-description" style={{ color: '#ef4444' }}>
                    {errorRegistrations}
                  </div>
                </div>
              ) : (
                <RegistrationStatus registrations={registrations.slice(0, 3)} />
              )}
            </div>

            {/* Notifications Section */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">Recent Notifications</div>
              </div>

              {loadingNotifications ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : errorNotifications ? (
                <div className="empty-state">
                  <div className="empty-title">Error</div>
                  <div className="empty-description" style={{ color: '#ef4444' }}>
                    {errorNotifications}
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">No Notifications</div>
                  <div className="empty-description">
                    You're all caught up!
                  </div>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.slice(0, 3).map((notification) => (
                    <NotificationItem
                      key={notification.notif_id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
