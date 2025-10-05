import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerSidebarNav from './OrganizerSidebarNav';
import API from "../../services/api.js";
import authService from '../../services/authService';
import '../../styles/StudentDashboard.css';
import '../../styles/OrganizerDashboard.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    deadline: '',
    capacity: '',
    registration_form_link: ''
  });

  const user = authService.getCurrentUser();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      created_by: user?.user_id
    };
    
    console.log('Submitting form data:', eventData);
    setLoading(true);

    try {
      await API.post('/events', eventData);
      alert('Event created successfully!');
      navigate('/dashboard/organizer');
    } catch (err) {
      console.log('Error response:', err.response?.data);
      alert(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
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
          <h1 className="dashboard-title">Create New Event</h1>
          <p className="dashboard-subtitle">Fill in the event details</p>
        </div>

        <div className="dashboard-section">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter event name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Event description"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Date</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    placeholder="Event venue"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    list="category-options"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Technical, Cultural"
                    autoComplete="off"
                  />
                  <datalist id="category-options">
                    <option value="Technical" />
                    <option value="Educational" />
                    <option value="Arts" />
                    <option value="Sports" />
                    <option value="Cultural" />
                  </datalist>
                </div>
              </div>

              <div className="form-group">
                <label>Max Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Maximum participants"
                />
              </div>

              <div className="form-group">
                <label>Registration Form Link (Optional)</label>
                <input
                  type="url"
                  name="registration_form_link"
                  value={formData.registration_form_link}
                  onChange={handleChange}
                  placeholder="https://forms.google.com/..."
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '0.5rem', 
                  color: '#888',
                  fontSize: '0.875rem' 
                }}>
                  Add Google Form link if external registration is required
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/organizer')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}