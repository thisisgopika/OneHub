import { useEffect, useState } from 'react';
import OrganizerSidebarNav from './OrganizerSidebarNav';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import API from "../../services/api.js";
import '../../styles/StudentDashboard.css';
import '../../styles/OrganizerDashboard.css';

export default function EventReport() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [report, setReport] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState('registrations');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrganizerEvents = async () => {
    try {
      const user = authService.getCurrentUser();
      const organizerId = user?.user_id;

      if (!organizerId) {
        setError('Organizer ID missing. Please log in.');
        return;
      }

      setLoading(true);
      const response = await eventService.getOrganizerEvents(organizerId);

      if (response.success && Array.isArray(response.data)) {
        setEvents(response.data);
        setError(null);
      } else {
        setError('Failed to fetch events.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching events.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventReport = async (eventId) => {
    if (!eventId) return;

    setLoading(true);
    try {
      const result = await eventService.getEventReport(eventId);
      if (result.success && result.data) {
        setReport(result.data);
      }

      const volunteersRes = await API.get(`/events/${eventId}/volunteers`);
      setVolunteers(volunteersRes.volunteers || []);

      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong while fetching the report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventReport(selectedEventId);
    } else {
      setReport(null);
      setVolunteers([]);
    }
  }, [selectedEventId]);

  return (
    <div className="student-dashboard">
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <OrganizerSidebarNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Event Reports</h1>
          <p className="dashboard-subtitle">Detailed participation breakdown</p>
        </div>

        <div className="dashboard-section">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {error && (
            <div className="empty-state">
              <div className="empty-description" style={{ color: '#ef4444' }}>{error}</div>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Select Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEventId && report && (
                <>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#1e1e1e', borderRadius: '8px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{report.event?.name}</h3>
                    <p style={{ color: '#888' }}>{report.event?.date ? new Date(report.event.date).toLocaleDateString() : ''}</p>
                  </div>

                  <div className="report-stats-grid">
                    <div className="stat-card">
                      <div className="stat-title">Total Attendees</div>
                      <div className="stat-value">{report.stats?.total_attendees ?? 0}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Total Volunteers</div>
                      <div className="stat-value">{report.stats?.total_volunteers ?? 0}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Available Slots</div>
                      <div className="stat-value">{report.stats?.available_slots ?? 0}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #333' }}>
                      <button 
                        onClick={() => setActiveTab('registrations')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: activeTab === 'registrations' ? '#ff3c1f' : 'transparent',
                          color: '#fff',
                          border: 'none',
                          borderBottom: activeTab === 'registrations' ? '2px solid #ff3c1f' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Registered ({report.stats?.total_attendees ?? 0})
                      </button>
                      <button 
                        onClick={() => setActiveTab('volunteers')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: activeTab === 'volunteers' ? '#ff3c1f' : 'transparent',
                          color: '#fff',
                          border: 'none',
                          borderBottom: activeTab === 'volunteers' ? '2px solid #ff3c1f' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Volunteers ({volunteers.length})
                      </button>
                    </div>

                    {activeTab === 'registrations' && (
                      <div>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Registered Students</h3>
                        {!report.registrations || report.registrations.length === 0 ? (
                          <div className="empty-state">
                            <div className="empty-description">No registrations yet</div>
                          </div>
                        ) : (
                          <div className="events-table-container">
                            <table className="events-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>User ID</th>
                                  <th>Class</th>
                                  <th>Semester</th>
                                  <th>Registered On</th>
                                </tr>
                              </thead>
                              <tbody>
                                {report.registrations.map((reg) => (
                                  <tr key={reg.reg_id}>
                                    <td className="event-name-cell">{reg.users?.name || 'N/A'}</td>
                                    <td>{reg.users?.user_id || 'N/A'}</td>
                                    <td>{reg.users?.class || 'N/A'}</td>
                                    <td>{reg.users?.semester || 'N/A'}</td>
                                    <td>{reg.registration_date ? new Date(reg.registration_date).toLocaleDateString() : 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'volunteers' && (
                      <div>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Volunteer Applications</h3>
                        {volunteers.length === 0 ? (
                          <div className="empty-state">
                            <div className="empty-description">No volunteer applications</div>
                          </div>
                        ) : (
                          <div className="events-table-container">
                            <table className="events-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>User ID</th>
                                  <th>Class</th>
                                  <th>Semester</th>
                                  <th>Status</th>
                                  <th>Applied On</th>
                                </tr>
                              </thead>
                              <tbody>
                                {volunteers.map((volunteer) => (
                                  <tr key={volunteer.app_id}>
                                    <td className="event-name-cell">{volunteer.name}</td>
                                    <td>{volunteer.user_id}</td>
                                    <td>{volunteer.class}</td>
                                    <td>{volunteer.semester}</td>
                                    <td>
                                      <span className={`status-badge status-${volunteer.status}`}>
                                        {volunteer.status}
                                      </span>
                                    </td>
                                    <td>{volunteer.applied_date ? new Date(volunteer.applied_date).toLocaleDateString() : 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="empty-state">
              <div className="empty-title">No Events Found</div>
              <div className="empty-description">Create events to view reports</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}