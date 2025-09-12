import { NavLink } from "react-router-dom";

export default function StudentNav() {
  const linkStyle = {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "6px",
    transition: "background 0.3s",
  };

  const activeStyle = {
    backgroundColor: "#007bff",
    color: "#fff",
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ddd",
        marginBottom: "20px",
      }}
    >
      <NavLink
        to="/dashboard/student"
        end   // ✅ exact match only
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Upcoming Events
      </NavLink>
      <NavLink
        to="/dashboard/student/events"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        My Events
      </NavLink>
      <NavLink
        to="/dashboard/student/reports"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        My Reports
      </NavLink>
      <NavLink
        to="/dashboard/student/notifications"
        style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
      >
        Notifications
      </NavLink>
    </nav>
  );
}
