import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService.js'; // Import authService
import '../styles/Reports.css';

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

  if (loading) return <div className="reports-page"><div className="reports-container"><div className="text-muted">Loading...</div></div></div>;
  if (error) return <div className="reports-page"><div className="reports-container"><div className="text-error">{error}</div></div></div>;

  return (
    <div className="reports-page">
      <div className="reports-container">
        <div className="reports-header">
          <h1 className="reports-title">Report for {className}</h1>
          <p className="reports-subtitle">Class participation details</p>
        </div>
        <div className="report-card">
          {reportData.length > 0 ? (
            <div className="report-table-wrapper">
              <table className="report-table">
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
            </div>
          ) : (
            <p className="text-muted">No report data found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsTable;