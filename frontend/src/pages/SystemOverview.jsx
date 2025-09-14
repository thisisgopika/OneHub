import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService.js'; // Import authService

function SystemOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = authService.getToken(); // Get the token from authService
        const response = await axios.get(
          'http://localhost:5000/api/admin/system-stats',
          {
            headers: {
              Authorization: `Bearer ${token}`, // Attach the token to the header
            },
          }
        );
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch system stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!stats) return <div>No stats available.</div>;

  return (
    <div>
      <h1>System Overview</h1>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Total Events: {stats.totalEvents}</p>
      <p>Total Registrations: {stats.totalRegistrations}</p>
      <p>Total Volunteers: {stats.totalVolunteers}</p>
    </div>
  );
}

export default SystemOverview;