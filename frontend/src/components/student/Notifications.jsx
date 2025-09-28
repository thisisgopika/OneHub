import { useEffect, useState } from "react";
import API from "../../api";
import SidebarNav from "./SidebarNav";
import NotificationItem from "./NotificationItem";
import "../../styles/StudentDashboard.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  const fetchNotifications = async () => {
    try {
      if (!userId) return;
      const { data } = await API.get(`/users/${userId}/notifications`);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await API.put(`/users/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notif_id === notifId ? { ...n, status: "read" } : n
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
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
        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Notifications</div>
            {notifications.filter(n => n.status === 'unread').length > 0 && (
              <div className="unread-badge">
                {notifications.filter(n => n.status === 'unread').length}
              </div>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No Notifications</div>
              <div className="empty-description">You're all caught up.</div>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.notif_id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
