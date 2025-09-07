import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Dashboard from '../common/Dashboard.jsx';
import eventService from '../../services/eventService.js'; // Import your eventService

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCreate = () => {
    navigate('/dashboard/organizer/create'); // relative path
  };

  const handleVolunteer = () =>{
    navigate('/dashboard/organizer/volunteer_approval');
  }

  const handleReports = () =>{
    navigate('/dashboard/organizer/event_report');
  }

  const handleEvents = () =>{
    navigate('/dashboard/organizer/events');
  }

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

  // Filter out events whose deadlines have passed
  const upcomingEvents = events.filter(event => new Date(event.deadline) >= new Date());


  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Organizer Dashboard</h1>
      <hr style={{ margin: '30px 0' }} />
      <Dashboard />
      <button
        onClick={handleCreate}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Create Event
      </button>
      <button
        onClick={handleEvents}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Manage Events
      </button>
      <button
        onClick={handleVolunteer}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Volunteers Approval
      </button>
      <button
        onClick={handleReports}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Reports
      </button>

      <hr style={{ margin: '30px 0' }} />

      <h2>Your Events</h2>
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && upcomingEvents.length === 0 && <p>No events found.</p>}

      {!loading && !error && upcomingEvents.length > 0 && (
        <table style={{ margin: '20px auto', borderCollapse: 'collapse', width: '80%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Deadline</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Registrations</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Volunteers</th>
            </tr>
          </thead>
          <tbody>
            {upcomingEvents.map((event) => (
              <tr key={event.event_id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.event_id}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(event.deadline).toLocaleString()}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.reg_count}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{event.vol_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
