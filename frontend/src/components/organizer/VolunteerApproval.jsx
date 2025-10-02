import { useEffect, useState } from 'react';
import OrganizerSidebarNav from './OrganizerSidebarNav';
import volunteerService from '../../services/volunteerService';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import '../../styles/StudentDashboard.css';
import '../../styles/OrganizerDashboard.css';

function VolunteerTable({ eventId }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await volunteerService.getEventVolunteers(eventId);
      if (response.success) {
        setVolunteers(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch volunteers');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId) => {
    await volunteerService.acceptVolunteer(appId);
    fetchVolunteers();
  };

  const handleReject = async (appId) => {
    await volunteerService.rejectVolunteer(appId);
    fetchVolunteers();
  };

  useEffect(() => {
    if (eventId) {
      fetchVolunteers();
    }
  }, [eventId]);

  if (loading) return <div className="loading-state"><p>Loading volunteers...</p></div>;
  if (error) return <div className="empty-state"><div className="empty-description" style={{ color: '#ef4444' }}>{error}</div></div>;
  if (volunteers.length === 0) return <div className="empty-state"><div className="empty-title">No Applications</div><div className="empty-description">No volunteer applications found for this event</div></div>;

  return (
    <div className="events-table-container">
      <table className="events-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((vol) => (
            <tr key={vol.app_id}>
              <td className="event-name-cell">{vol.name}</td>
              <td>{vol["class"]}</td>
              <td>{vol.semester}</td>
              <td>
                <span className={`status-badge status-${vol.status}`}>
                  {vol.status}
                </span>
              </td>
              <td>
                {vol.status === 'pending' ? (
                  <div className="action-buttons">
                    <button
                      onClick={() => handleAccept(vol.app_id)}
                      className="btn-action btn-approve"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(vol.app_id)}
                      className="btn-action btn-delete"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{vol.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VolunteerApproval() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizerEvents = async () => {
    try {
      const user = authService.getCurrentUser();
      const organizerId = user?.user_id;

      if (!organizerId) {
        setError('Organizer ID missing. Please log in.');
        setLoading(false);
        return;
      }

      const response = await eventService.getOrganizerEvents(organizerId);

      if (response.success && Array.isArray(response.data)) {
        setEvents(response.data);
        setError(null);
      } else {
        setError('Failed to fetch organizer events');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

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
          <h1 className="dashboard-title">Volunteer Management</h1>
          <p className="dashboard-subtitle">Review and approve volunteer applications</p>
        </div>

        <div className="dashboard-section">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
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

              {selectedEventId && <VolunteerTable eventId={selectedEventId} />}
            </>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="empty-state">
              <div className="empty-title">No Events Found</div>
              <div className="empty-description">Create events to manage volunteers</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}