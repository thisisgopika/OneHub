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
            disabled={isVolunteer || !event.registrations_enabled}
            title={
              !event.registrations_enabled 
                ? "Registrations are currently closed for this event"
                : isVolunteer 
                ? "Cannot register - you have applied as volunteer for this event" 
                : "Register for this event"
            }
          >
            <span>
              {event.registrations_enabled ? 'Register' : 'Registration Closed'}
            </span>
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
            disabled={isRegistered || !event.volunteer_calls_enabled}
            title={
              !event.volunteer_calls_enabled
                ? "Volunteer calls are currently closed for this event"
                : isRegistered 
                ? "Cannot apply as volunteer - you are already registered for this event" 
                : "Apply as volunteer for this event"
            }
          >
            <span>
              {event.volunteer_calls_enabled ? 'Apply as Volunteer' : 'Volunteer Calls Closed'}
            </span>
          </button>
        ) : (
          <div className="volunteer-applied-badge">
            <span className="check-icon">✓</span>
            <span>Volunteer Applied</span>
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="event-status">
        <div className={`status-indicator ${event.registrations_enabled ? 'open' : 'closed'}`}>
          <span className="status-dot"></span>
          <span>Registrations {event.registrations_enabled ? 'Open' : 'Closed'}</span>
        </div>
        <div className={`status-indicator ${event.volunteer_calls_enabled ? 'open' : 'closed'}`}>
          <span className="status-dot"></span>
          <span>Volunteer Calls {event.volunteer_calls_enabled ? 'Open' : 'Closed'}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
