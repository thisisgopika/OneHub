import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../../../services/eventService.js';

export default function EventManage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    deadline: '',
    max_participants: '',
  });

  /** Fetch event details */
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await eventService.getEventById(eventId);
      if (response.success) {
        setEvent(response.data);
        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          date: response.data.date ? response.data.date.split('T')[0] : '',
          venue: response.data.venue || '',
          category: response.data.category || '',
          deadline: response.data.deadline ? response.data.deadline.split('T')[0] : '',
          max_participants: response.data.max_participants || '',
        });
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch event');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  /** Handle form changes */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Save updated event */
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await eventService.updateEvent(eventId, formData);
      if (response.success) {
        alert('Event updated successfully!');
        setIsEditing(false);
        fetchEvent();
      } else {
        alert(response.error || 'Failed to update event');
      }
    } catch (err) {
      alert(err.message || 'Something went wrong while updating');
    }
  };

  /** Delete event */
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      const response = await eventService.deleteEvent(eventId);
      if (response.success) {
        alert('Event deleted successfully!');
        navigate(-1); // Redirect after delete
      } else {
        alert(response.error || 'Failed to delete event');
      }
    } catch (err) {
      alert(err.message || 'Something went wrong while deleting');
    }
  };

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!event) return null;

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#f9f9f9',
      }}
    >
      <h2>{isEditing ? 'Edit Event' : `Event Details: ${event.name}`}</h2>
      <hr style={{ margin: '30px 0' }} />

      {/* VIEW MODE */}
      {!isEditing ? (
        <>
          <p><strong>Description:</strong> {event.description || 'No description'}</p>
          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Venue:</strong> {event.venue}</p>
          <p><strong>Category:</strong> {event.category || 'N/A'}</p>
          <p><strong>Deadline:</strong> {new Date(event.deadline).toLocaleDateString()}</p>
          <p><strong>Max Participants:</strong> {event.max_participants}</p>
          <p><strong>Created At:</strong> {new Date(event.created_at).toLocaleString()}</p>

          {/* Actions */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'right' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        /* EDIT MODE */
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '15px' }}>
            <label>Event Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Venue:</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Category:</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Deadline:</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Max Participants:</label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          {/* Form buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
