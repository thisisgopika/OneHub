import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService.js';

function ClassDashboard() {
  const { className } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = authService.getToken();
        const response = await axios.get(
          `http://localhost:5000/api/admin/classes/${className}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch class dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    if (className) {
      fetchStats();
    }
  }, [className]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!stats) return <div>No stats available for this class.</div>;

  return (
    <div>
      <h1>Dashboard for {className}</h1>
      <p>Total Events Participated: {stats.totalEventsParticipated}</p>
      <p>Total Volunteers: {stats.totalVolunteers}</p>
      <p>Active Students: {stats.activeStudents}</p>

      {/* ADD YOUR NAVIGATION BUTTON HERE */}
      <div style={{ marginTop: '20px' }}>
        <Link to={`/admin/classes/${className}/report`}>
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            View Report
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ClassDashboard;