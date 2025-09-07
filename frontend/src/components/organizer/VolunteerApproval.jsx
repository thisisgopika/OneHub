import React, { useEffect, useState } from 'react';
import volunteerService from '../../services/volunteerService.js';
import eventService from '../../services/eventService.js';
import authService from '../../services/authService.js';

/** VolunteerTable component */
export function VolunteerTable({ eventId }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await volunteerService.getEventVolunteers(eventId);
      console.log('Volunteers response:', response);

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
    fetchVolunteers(); // refresh table
  };

  const handleReject = async (appId) => {
    await volunteerService.rejectVolunteer(appId);
    fetchVolunteers(); // refresh table
  };

  useEffect(() => {
    if (eventId) {
      fetchVolunteers();
    }
  }, [eventId]);

  if (loading) return <p>Loading volunteers...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (volunteers.length === 0) return <p style={{ textAlign: 'center' }}>No volunteer applications found.</p>;

  return (
    <div style = {{padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9'}}>
    <table style={{ margin: '20px auto', borderCollapse: 'collapse', width: '80%' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Class</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Semester</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
          <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {volunteers.map((vol) => (
          <tr key={vol.app_id}>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{vol.name}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{vol["class"]}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{vol.semester}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{vol.status}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
              {vol.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleAccept(vol.app_id)}
                    style={{ marginRight: '10px', padding: '5px 10px', background: 'green', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(vol.app_id)}
                    style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <span>{vol.status}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

/** OrganizerVolunteers component */
export default function OrganizerVolunteers() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Fetch organizer's events */
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
      console.log('Events response:', response);

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
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <h2>Volunteer Approval</h2>
      <hr style={{ margin: '30px 0' }} />
      {/* Loading and Error Messages */}
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Dropdown for selecting event */}
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
              backgroundColor: 'white',
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
        !loading && <p>No events found for this organizer.</p>
      )}

      {/* Show volunteers for selected event */}
      {selectedEventId && (
        <div style={{ marginTop: '30px' }}>
          <VolunteerTable eventId={selectedEventId} />
        </div>
      )}
    </div>
  );
}
