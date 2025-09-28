import React from 'react';
import './NotificationItem.css';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Icons removed to match clean theme without emojis
  const getNotificationIcon = () => null;

  const isUnread = notification.status === 'unread';

  return (
    <div className={`notification-item ${isUnread ? 'unread' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-icon" />
          <div className="notification-meta">
            <div className="notification-time">{formatDate(notification.created_at)}</div>
            {isUnread && (
              <div className="unread-indicator">
                <span className="unread-dot"></span>
              </div>
            )}
          </div>
        </div>
        
        <div className="notification-message">
          {notification.message}
        </div>
        
        {isUnread && (
          <div className="notification-actions">
            <button
              onClick={() => onMarkAsRead(notification.notif_id)}
              className="mark-read-btn"
            >
              <span>Mark as Read</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
