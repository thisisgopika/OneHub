import { useEffect, useState } from "react";
import API from "../../services/api.js";
import SidebarNav from "./SidebarNav";
import RegistrationStatus from "./RegistrationStatus";
import "../../styles/StudentDashboard.css";
import "./MyEvents.css";

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);

  const [errorRegistrations, setErrorRegistrations] = useState(null);
  const [errorVolunteers, setErrorVolunteers] = useState(null);

  const [activeTab, setActiveTab] = useState('registrations');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  useEffect(() => {
    if (!userId) {
      setErrorRegistrations('User not found');
      setErrorVolunteers('User not found');
      setLoadingRegistrations(false);
      setLoadingVolunteers(false);
      return;
    }

    const fetchRegistrations = async () => {
      setLoadingRegistrations(true);
      try {
        const res = await API.get(`/users/${userId}/registrations`);
        setRegistrations(res.registrations || []);
        setErrorRegistrations(null);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setErrorRegistrations(err.message || 'Failed to load registrations');
      } finally {
        setLoadingRegistrations(false);
      }
    };

    const fetchVolunteers = async () => {
      setLoadingVolunteers(true);
      try {
        const res = await API.get(`/users/${userId}/volunteers`);
        setVolunteers(res.volunteers || []);
        setErrorVolunteers(null);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
        setErrorVolunteers(err.message || 'Failed to load volunteer applications');
      } finally {
        setLoadingVolunteers(false);
      }
    };

    fetchRegistrations();
    fetchVolunteers();
  }, [userId]);

  return (
    <div className="student-dashboard my-events">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <SidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="my-events-container">
          <div className="my-events-header">
            <h1 className="my-events-title">My Events</h1>
            <p className="my-events-subtitle">Manage your registrations and volunteer applications</p>
          </div>

          <div className="dashboard-section">
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
              {/* Registrations Tab */}
              {activeTab === 'registrations' && (
                <div className="tab-panel">
                  {loadingRegistrations ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading your registrations...</p>
                    </div>
                  ) : errorRegistrations ? (
                    <div className="empty-state">
                      <div className="empty-title">Error</div>
                      <div className="empty-description" style={{ color: '#ef4444' }}>
                        {errorRegistrations}
                      </div>
                    </div>
                  ) : registrations.length === 0 ? (
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

              {/* Volunteers Tab */}
              {activeTab === 'volunteers' && (
                <div className="tab-panel">
                  {loadingVolunteers ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading your volunteer applications...</p>
                    </div>
                  ) : errorVolunteers ? (
                    <div className="empty-state">
                      <div className="empty-title">Error</div>
                      <div className="empty-description" style={{ color: '#ef4444' }}>
                        {errorVolunteers}
                      </div>
                    </div>
                  ) : volunteers.length === 0 ? (
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
    </div>
  );
}
