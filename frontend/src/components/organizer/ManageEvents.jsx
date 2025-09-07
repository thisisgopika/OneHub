import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService.js'; // Import your eventService

export default function ManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events on mount
  useEffect(() => {
    const getOrganizerEvents = async () => {
      setLoading(true);
      try {
        const response = await eventService.getOrganizerEvents();
        if (response.success) {
          setEvents(response.data || []); // adjust based on your API shape
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

  // Handle Edit button click
  const handleDetails = (eventId) => {
    navigate(`/dashboard/organizer/events/${eventId}`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <h2>Manage Events</h2>
      <hr style={{ margin: '30px 0' }} />
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && events.length === 0 && <p>No events found.</p>}

      {!loading && !error && events.length > 0 && (
        <table style={{ margin: '20px auto', borderCollapse: 'collapse', width: '80%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Deadline</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Registrations</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Volunteers</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.event_id}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(event.deadline).toLocaleString()}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.reg_count}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.vol_count}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  <button
                    onClick={() => handleDetails(event.event_id)}
                    style={{
                      padding: '5px 30px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
