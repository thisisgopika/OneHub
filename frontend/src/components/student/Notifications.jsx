import { useEffect, useState } from "react";
import API from "../../api";
import StudentNav from "./StudentNav";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Student Navigation at top */}
      <StudentNav />

      <h2>🔔 My Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((n) => (
            <li
              key={n.notif_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: n.status === "unread" ? "#f9f9f9" : "#fff",
              }}
            >
              <p>{n.message}</p>
              <small>
                {new Date(n.created_at).toLocaleString()} —{" "}
                <strong>{n.status}</strong>
              </small>
              {n.status === "unread" && (
                <div>
                  <button
                    style={{ marginTop: "10px" }}
                    onClick={() => markAsRead(n.notif_id)}
                  >
                    Mark as Read
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
