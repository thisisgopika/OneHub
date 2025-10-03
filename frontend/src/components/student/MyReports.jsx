import { useEffect, useState } from "react";
import API from "../../services/api.js";
import SidebarNav from "./SidebarNav";
import "../../styles/StudentDashboard.css";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  const fetchReports = async () => {
    try {
      if (!userId) return;

      const url = semester
        ? `/users/${userId}/reports?semester=${semester}`
        : `/users/${userId}/reports`;

      const response = await API.get(url);
      setReports(response.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester]);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
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
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Participation Reports</h1>
          <p className="dashboard-subtitle">Track your event participation history</p>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Filter Reports</div>
          </div>
          
          <div className="report-controls">
            <label htmlFor="semester" className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>
              Filter by Semester
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="select-control"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-title">Participation History</div>
          </div>
          
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No Participation Records</div>
              <div className="empty-description">
                No participation records found for the selected semester.
              </div>
            </div>
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.reg_id}>
                      <td>{r.name}</td>
                      <td>{r.date}</td>
                      <td>{r.category}</td>
                      <td>{r.registration_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
