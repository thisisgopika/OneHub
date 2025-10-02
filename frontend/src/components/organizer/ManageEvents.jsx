import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerSidebarNav from './OrganizerSidebarNav';
import eventService from '../../services/eventService';
import '../../styles/StudentDashboard.css';
import '../../styles/OrganizerDashboard.css';

export default function ManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOrganizerEvents = async () => {
      setLoading(true);
      try {
        const response = await eventService.getOrganizerEvents();
        if (response.success) {
          setEvents(response.data || []);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch events');
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    getOrganizerEvents();
  }, []);

  const handleDetails = (eventId) => {
    navigate(`/dashboard/organizer/events/${eventId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <h1 className="dashboard-title">Manage Events</h1>
          <p className="dashboard-subtitle">View and manage all your events</p>
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
              <div className="empty-title">Error</div>
              <div className="empty-description" style={{ color: '#ef4444' }}>
                {error}
              </div>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="empty-state">
              <div className="empty-title">No Events Found</div>
              <div className="empty-description">
                Create your first event to get started
              </div>
              <button
                onClick={() => navigate('/dashboard/organizer/create')}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Create Event
              </button>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="events-table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Deadline</th>
                    <th>Registrations</th>
                    <th>Volunteers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.event_id}>
                      <td className="event-name-cell">{event.name}</td>
                      <td>{formatDate(event.deadline)}</td>
                      <td>{event.reg_count || 0}</td>
                      <td>{event.vol_count || 0}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleDetails(event.event_id)}
                            className="btn-action btn-view"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
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