import { NavLink } from "react-router-dom";
import "./StudentNav.css";

export default function StudentNav() {
  return (
    <nav className="student-nav">
      <NavLink
        to="/dashboard/student"
        end
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/dashboard/student/events"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        My Events
      </NavLink>
      <NavLink
        to="/dashboard/student/reports"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        My Reports
      </NavLink>
      <NavLink
        to="/dashboard/student/notifications"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        Notifications
      </NavLink>
    </nav>
  );
}
