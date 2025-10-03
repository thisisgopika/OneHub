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
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const user = authService.getCurrentUser();
  const userId = user?.user_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming events
        const eventsRes = await API.get("/events?upcoming=true");
        setEvents(eventsRes.events || []);

        // Fetch user registrations and volunteer applications
        if (userId) {
          const regRes = await API.get(`/users/${userId}/registrations`);
          setRegistrations(regRes.registrations || []);

          // Fetch volunteer applications
          const volunteerRes = await API.get(`/users/${userId}/volunteers`);
          setVolunteerApplications(volunteerRes.volunteers || []);

          // Fetch notifications
          const notifRes = await API.get(`/users/${userId}/notifications`);
          setNotifications(notifRes.notifications || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleRegister = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/register`);
      alert("✅ Registered successfully!");
      // Refresh data
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
      // Refresh data
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

  const getUnreadCount = () => {
    return notifications.filter(n => n.status === 'unread').length;
  };

  const getUpcomingEventsCount = () => {
    return events.length;
  };

  const getRegistrationsCount = () => {
    return registrations.length;
  };

  const isVolunteerApplied = (eventId) => {
    return volunteerApplications.some(app => app.event_id === eventId);
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar Navigation */}
      <SidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your events</p>
        </div>


        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Upcoming Events Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title">
                Upcoming Events
              </div>
            </div>
            
            {events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No Upcoming Events</div>
                <div className="empty-description">
                  Check back later for new events to register for!
                </div>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
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

          {/* Right Column */}
          <div className="dashboard-column">
            {/* My Registrations */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">
                  My Registrations
                </div>
              </div>
              <RegistrationStatus registrations={registrations.slice(0, 3)} />
            </div>

            {/* Notifications */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">
                  Recent Notifications
                </div>
              </div>
              
              {notifications.length === 0 ? (
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
