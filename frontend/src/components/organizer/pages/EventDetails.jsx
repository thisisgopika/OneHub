import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../../../services/eventService.js';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await eventService.getEventById(eventId);
        if (response.success) setEvent(response.data);
        else setError(response.error || 'Failed to fetch event');
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!event) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
      <h2>Event Details : {event.name}</h2>
      <hr style={{ margin: '30px 0' }} />
      <p><strong>Description:</strong> {event.description || 'No description'}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p><strong>Category:</strong> {event.category || 'N/A'}</p>
      <p><strong>Created By:</strong> {event.created_by}</p>
      <p><strong>Deadline:</strong> {new Date(event.deadline).toLocaleDateString()}</p>
      <p><strong>Max Participants:</strong> {event.max_participants}</p>
      <p><strong>Created At:</strong> {new Date(event.created_at).toLocaleString()}</p>
    </div>
  );
}
