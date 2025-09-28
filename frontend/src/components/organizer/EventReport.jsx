import React, { useEffect, useState } from 'react';
import eventService from '../../services/eventService.js';
import authService from '../../services/authService.js';
import '../../styles/Reports.css';

export default function EventReport() {
  const [events, setEvents] = useState([]);          // Organizer's events
  const [selectedEventId, setSelectedEventId] = useState(''); // Selected event
  const [report, setReport] = useState(null);        // Report data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch all events created by the logged-in organizer */
  const fetchOrganizerEvents = async () => {
    try {
      const user = authService.getCurrentUser(); // Logged-in organizer
      const organizerId = user?.user_id;

      if (!organizerId) {
        setError('Organizer ID missing. Please log in.');
        return;
      }

      setLoading(true);
      const response = await eventService.getOrganizerEvents(organizerId);
      console.log('Fetched Events Response:', response);

      // Response should be { success: true, data: [events] }
      if (response.success && Array.isArray(response.data)) {
        setEvents(response.data);
        setError(null);
      } else {
        setError('Failed to fetch events.');
      }
    } catch (err) {
      console.error('Error fetching organizer events:', err);
      setError(err.message || 'Something went wrong while fetching events.');
    } finally {
      setLoading(false);
    }
  };

  /** Fetch report for a selected event */
  const fetchEventReport = async (eventId) => {
    if (!eventId) return;

    setLoading(true);
    try {
      const result = await eventService.getEventReport(eventId);
      console.log('Event Report Response:', result);

      if (result.success && result.data) {
        setReport(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching event report:', err);
      setError(err.message || 'Something went wrong while fetching the report.');
    } finally {
      setLoading(false);
    }
  };

  /** Fetch events on component mount */
  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  /** Fetch report whenever a new event is selected */
  useEffect(() => {
    if (selectedEventId) {
      fetchEventReport(selectedEventId);
    } else {
      setReport(null); // Clear when no event is selected
    }
  }, [selectedEventId]);

  return (
    <div className="reports-page">
      <div className="reports-container">
        <div className="reports-header">
          <h2 className="reports-title">Event Reports</h2>
          <p className="reports-subtitle">Review participation and volunteer stats for your events.</p>
        </div>

        {loading && <p className="text-muted">Loading...</p>}
        {error && <p className="text-error">{error}</p>}

        {events.length > 0 ? (
          <div className="report-card">
            <div className="report-card-header">
              <div className="report-card-title">Select an Event</div>
              <div className="accent-badge">{events.length} available</div>
            </div>
            <div className="report-controls">
              <label htmlFor="eventSelect" className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>
                Event
              </label>
              <select
                id="eventSelect"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="select-control"
              >
                <option value="">-- Choose an Event --</option>
                {events.map((event) => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          !loading && <p className="text-muted">No events found.</p>
        )}

        {selectedEventId && report && (
          <div className="report-card">
            <div className="report-card-header">
              <div className="report-card-title">Overview</div>
            </div>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-number">{report.total_attendees ?? 0}</div>
                <div className="kpi-label">Total Attendees</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-number">{report.total_volunteers ?? 0}</div>
                <div className="kpi-label">Total Volunteers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
