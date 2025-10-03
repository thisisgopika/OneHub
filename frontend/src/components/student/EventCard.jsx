import React from 'react';
import './EventCard.css';

const EventCard = ({ event, onRegister, onVolunteer, isRegistered, isVolunteer }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.name}</h3>
        <div className="event-date-badge">
          <span className="date-icon">📅</span>
          <span>{formatDate(event.date)}</span>
        </div>
      </div>
      
      <p className="event-description">{event.description}</p>
      
      <div className="event-meta">
        <div className="event-date">
          <span className="meta-icon">🕒</span>
          <span>{formatTime(event.date)}</span>
        </div>
        <div className="event-venue">
          <span className="meta-icon">📍</span>
          <span>{event.venue}</span>
        </div>
        {event.capacity && (
          <div className="event-capacity">
            <span className="meta-icon">👥</span>
            <span>{event.registered_count || 0}/{event.capacity}</span>
          </div>
        )}
      </div>
      
      <div className="event-actions">
        {!isRegistered ? (
          <button
            onClick={() => onRegister(event.event_id)}
            className="btn btn-primary"
            disabled={isVolunteer}
            title={isVolunteer ? "Cannot register - you have applied as volunteer for this event" : "Register for this event"}
          >
            <span>Register</span>
          </button>
        ) : (
          <div className="registered-badge">
            <span className="check-icon">✓</span>
            <span>Registered</span>
          </div>
        )}
        
        {!isVolunteer ? (
          <button
            onClick={() => onVolunteer(event.event_id)}
            className="btn btn-secondary"
            disabled={isRegistered}
            title={isRegistered ? "Cannot apply as volunteer - you are already registered for this event" : "Apply as volunteer for this event"}
          >
            <span>Apply as Volunteer</span>
          </button>
        ) : (
          <div className="volunteer-applied-badge">
            <span className="check-icon">✓</span>
            <span>Volunteer Applied</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
