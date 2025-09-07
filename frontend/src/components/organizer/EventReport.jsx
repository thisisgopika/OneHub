import React, { useEffect, useState } from 'react';
import eventService from '../../services/eventService.js';
import authService from '../../services/authService.js';

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
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <h2>Event Reports</h2>
      <hr style={{ margin: '30px 0' }} />
      {/* Loading and Error Handling */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Dropdown to select an event */}
      {events.length > 0 ? (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="eventSelect" style={{ display: 'block', marginBottom: '8px' }}>
            Select an Event:
          </label>
          <select
            id="eventSelect"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: 'white'
            }}
          >
            <option value="">-- Choose an Event --</option>
            {events.map((event) => (
              <option key={event.event_id} value={event.event_id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        !loading && <p>No events found.</p>
      )}

      {/* Display the report */}
      {selectedEventId && report && (
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Event Report</h3>
          <p><strong>Total Attendees:</strong> {report.total_attendees ?? 0}</p>
          <p><strong>Total Volunteers:</strong> {report.total_volunteers ?? 0}</p>
        </div>
      )}
    </div>
  );
}
