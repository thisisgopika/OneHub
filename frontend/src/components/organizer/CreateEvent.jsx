import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService.js';

const CreateEvent = () => {

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    deadline: '',
    max_participants: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await eventService.create(formData);

      if (result.success) {
        setSuccess('Event created successfully!');
        setFormData({
          name: '',
          description: '',
          date: '',
          venue: '',
          category: '',
          deadline: '',
          max_participants: ''
        });
        setTimeout(() => navigate('/dashboard/organizer'), 1500);
      } else {
        setError(result.error || 'Event creation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Create Event</h2>

      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid red' }}>
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e6ffe6', border: '1px solid green' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        

        {/* Event Name */}
        <div style={{ marginBottom: '15px' }}>
          <label>Event Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Enter event name"
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '15px' }}>
        <label>Description:</label>
        <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            style={{
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            resize: 'vertical', // allows user to resize manually
            }}
            placeholder="Enter detailed event description"
        />
        </div>


        {/* Date */}
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

        {/* Venue */}
        <div style={{ marginBottom: '15px' }}>
          <label>Venue:</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Enter event venue"
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ marginBottom: '15px' }}>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ width: '104%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">-- Select Category --</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
          </select>
        </div>

        {/* Deadline */}
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

        {/* Max Participants */}
        <div style={{ marginBottom: '15px' }}>
          <label>Max Participants:</label>
          <input
            type="number"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleChange}
            required
            min="1"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="Enter maximum participants"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '104%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
