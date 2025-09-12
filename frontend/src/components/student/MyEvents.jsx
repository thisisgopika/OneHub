import { useEffect, useState } from "react";
import API from "../../api";
import StudentNav from "./StudentNav";

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get userId from localStorage (set when logging in)
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        // Fetch registered events
        const regRes = await API.get(`/users/${userId}/registrations`);
        setRegistrations(regRes.data.registrations || []);

        // Fetch volunteer applications
        const volRes = await API.get(`/users/${userId}/volunteers`);
        setVolunteers(volRes.data.volunteers || []);
      } catch (err) {
        console.error("Error fetching My Events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Student Navigation at top */}
      <StudentNav />

      <h2>📌 My Registered Events</h2>
      {registrations.length === 0 ? (
        <p>You have not registered for any events yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {registrations.map((r) => (
            <li
              key={r.reg_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>{r.name}</h3>
              <p>
                {r.date} at {r.venue}
              </p>
              <p>
                Status: <strong>{r.status}</strong>
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "40px" }}>🙋 My Volunteer Applications</h2>
      {volunteers.length === 0 ? (
        <p>You have not applied as a volunteer yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {volunteers.map((v) => (
            <li
              key={v.app_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>{v.event_name}</h3>
              <p>Date: {v.date}</p>
              <p>
                Status: <strong>{v.status}</strong>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
