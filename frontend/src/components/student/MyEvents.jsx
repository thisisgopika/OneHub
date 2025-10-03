import { useEffect, useState } from "react";
import API from "../../services/api.js";
import SidebarNav from "./SidebarNav";
import RegistrationStatus from "./RegistrationStatus";
import "../../styles/StudentDashboard.css";
import "./MyEvents.css";

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get userId from localStorage (set when logging in)
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        // Fetch registered events
        const regRes = await API.get(`/users/${userId}/registrations`);
        setRegistrations(regRes.registrations || []);

        // Fetch volunteer applications
        const volRes = await API.get(`/users/${userId}/volunteers`);
        setVolunteers(volRes.volunteers || []);
      } catch (err) {
        console.error("Error fetching My Events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard my-events">
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
        <div className="my-events-container">
          <div className="my-events-header">
            <h1 className="my-events-title">My Events</h1>
            <p className="my-events-subtitle">Manage your registrations and volunteer applications</p>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('registrations')}
            >
              My Registrations
              <span className="tab-count">{registrations.length}</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'volunteers' ? 'active' : ''}`}
              onClick={() => setActiveTab('volunteers')}
            >
              Volunteer Applications
              <span className="tab-count">{volunteers.length}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'registrations' && (
              <div className="tab-panel">
                {registrations.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">No Registrations Yet</div>
                    <div className="empty-description">
                      You haven't registered for any events yet. Browse upcoming events to get started.
                    </div>
                  </div>
                ) : (
                  <RegistrationStatus registrations={registrations} />
                )}
              </div>
            )}

            {activeTab === 'volunteers' && (
              <div className="tab-panel">
                {volunteers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">No Volunteer Applications</div>
                    <div className="empty-description">
                      You have not applied as a volunteer yet.
                    </div>
                  </div>
                ) : (
                  <div className="registrations-list">
                    {volunteers.map((v) => (
                      <div key={v.app_id} className="registration-item">
                        <div className="registration-header">
                          <h4 className="registration-title">{v.event_name}</h4>
                          <div className={`status-badge ${
                            (v.status || '').toLowerCase() === 'approved' ? 'status-confirmed' :
                            (v.status || '').toLowerCase() === 'rejected' ? 'status-cancelled' :
                            'status-pending'
                          }`}>
                            <span>{v.status}</span>
                          </div>
                        </div>
                        <div className="registration-meta">
                          <div className="registration-date">
                            <span>{new Date(v.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
