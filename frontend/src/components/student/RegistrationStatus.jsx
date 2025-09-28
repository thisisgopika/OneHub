import React from 'react';
import './RegistrationStatus.css';

const RegistrationStatus = ({ registrations }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (registrations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <div className="empty-title">No Registrations Yet</div>
        <div className="empty-description">
          You haven't registered for any events yet. Browse upcoming events to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="registrations-list">
      {registrations.map((registration) => (
        <div key={registration.reg_id} className="registration-item">
          <div className="registration-header">
            <h4 className="registration-title">{registration.name}</h4>
            <div className={`status-badge ${getStatusColor(registration.status)}`}>
              <span className="status-icon">{getStatusIcon(registration.status)}</span>
              <span>{registration.status}</span>
            </div>
          </div>
          
          <div className="registration-meta">
            <div className="registration-date">
              <span className="meta-icon">📅</span>
              <span>{formatDate(registration.date)}</span>
            </div>
            <div className="registration-venue">
              <span className="meta-icon">📍</span>
              <span>{registration.venue}</span>
            </div>
          </div>
          
          {registration.status === 'pending' && (
            <div className="registration-note">
              <span className="note-icon">ℹ️</span>
              <span>Your registration is being reviewed</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RegistrationStatus;
