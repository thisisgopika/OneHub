import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerSidebarNav from '../OrganizerSidebarNav';
import eventService from '../../../services/eventService';
import '../../../styles/StudentDashboard.css';
import '../../../styles/OrganizerDashboard.css';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    deadline: '',
    max_participants: '',
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await eventService.deleteEvent(eventId);
      if (response.success) {
        alert('Event deleted successfully!');
        navigate('/dashboard/organizer/events');
      } else {
        alert(response.error || 'Failed to delete event');
      }
    } catch (err) {
      alert(err.message || 'Something went wrong while deleting');
    }
  };

  return (
    <div className="student-dashboard">
      <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      
      <OrganizerSidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{isEditing ? 'Edit Event' : event?.name || 'Event Details'}</h1>
          <p className="dashboard-subtitle">{isEditing ? 'Update event information' : 'View and manage event'}</p>
        </div>

        <div className="dashboard-section">
          {loading && <div className="loading-state"><div className="loading-spinner"></div><p>Loading...</p></div>}
          {error && <div className="empty-state"><div className="empty-description" style={{color: '#ef4444'}}>{error}</div></div>}

          {!loading && !error && event && (
            <>
              {!isEditing ? (
                <div className="event-form">
                  <div className="form-group">
                    <label>Description</label>
                    <p style={{color: 'rgba(255,255,255,0.8)'}}>{event.description || 'No description'}</p>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date</label>
                      <p style={{color: 'rgba(255,255,255,0.8)'}}>{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <div className="form-group">
                      <label>Deadline</label>
                      <p style={{color: 'rgba(255,255,255,0.8)'}}>{new Date(event.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Venue</label>
                      <p style={{color: 'rgba(255,255,255,0.8)'}}>{event.venue}</p>
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <p style={{color: 'rgba(255,255,255,0.8)'}}>{event.category || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Max Participants</label>
                    <p style={{color: 'rgba(255,255,255,0.8)'}}>{event.max_participants}</p>
                  </div>
                  <div className="form-actions">
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary">Edit Event</button>
                    <button onClick={handleDelete} className="btn btn-delete" style={{background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)'}}>Delete Event</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="event-form">
                  <div className="form-group">
                    <label>Event Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Deadline</label>
                      <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Venue</label>
                      <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input type="text" name="category" value={formData.category} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Max Participants</label>
                    <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} required />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}