import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService.js'; // Import authService

function ReportsTable() {
  const { className } = useParams();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = authService.getToken(); // Get the token from authService
        const response = await axios.get(
          `http://localhost:5000/api/admin/classes/${className}/report`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Attach the token to the header
            },
          }
        );
        setReportData(response.data);
      } catch (err) {
        setError("Failed to fetch report data.");
      } finally {
        setLoading(false);
      }
    };
    if (className) {
      fetchReport();
    }
  }, [className]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Report for {className}</h1>
      {reportData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>User ID</th>
              <th>Event Name</th>
              <th>Participation Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                <td>{row.name}</td>
                <td>{row.user_id}</td>
                <td>{row.event_name}</td>
                <td>{row.participation_type}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No report data found.</p>
      )}
    </div>
  );
}

export default ReportsTable;