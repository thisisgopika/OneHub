import { useEffect, useState } from "react";
import API from "../../api";
import Dashboard from "../common/Dashboard.jsx";
import StudentNav from "./StudentNav";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get("/events?upcoming=true");
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/register`);
      alert("✅ Registered successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "❌ Registration failed");
    }
  };

  const handleVolunteer = async (eventId) => {
    try {
      await API.post(`/events/${eventId}/volunteer`);
      alert("✅ Volunteer application submitted!");
    } catch (err) {
      alert(err.response?.data?.error || "❌ Application failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Student Navigation at top */}
      <StudentNav />

      <div style={{ textAlign: "center" }}>
        <h1>Student Dashboard</h1>
        <hr style={{ margin: "30px 0" }} />

        {/* Common Dashboard content */}
        <Dashboard />

        {/* Upcoming Events Section */}
        <h2 style={{ marginTop: "40px" }}>📅 Upcoming Events</h2>
        {events.length === 0 && <p>No upcoming events</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {events.map((e) => (
            <li
              key={e.event_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                textAlign: "left",
              }}
            >
              <h3>{e.name}</h3>
              <p>{e.description}</p>
              <p>
                {e.date} at {e.venue}
              </p>
              <button onClick={() => handleRegister(e.event_id)}>
                Register
              </button>{" "}
              <button onClick={() => handleVolunteer(e.event_id)}>
                Apply as Volunteer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
