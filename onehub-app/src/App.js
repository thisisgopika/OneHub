import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

// Simple icon components (replacing lucide-react)
const Calendar = () => <span>📅</span>;
const Users = () => <span>👥</span>;
const Bell = () => <span>🔔</span>;
const Plus = () => <span>➕</span>;
const Settings = () => <span>⚙️</span>;
const LogOut = () => <span>🚪</span>;
const User = () => <span>👤</span>;
const BookOpen = () => <span>📖</span>;
const Award = () => <span>🏆</span>;
const Clock = () => <span>🕐</span>;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Service
const API_BASE = 'http://localhost:5000/api';

const api = {
  login: (credentials) => 
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    }),
  
  register: (userData) =>
    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),
  
  logout: () =>
    fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    }),
  
  getEvents: () =>
    fetch(`${API_BASE}/events`, { credentials: 'include' }),
  
  createEvent: (eventData) =>
    fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(eventData)
    }),
  
  registerForEvent: (eventId) =>
    fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      credentials: 'include'
    }),
  
  unregisterFromEvent: (eventId) =>
    fetch(`${API_BASE}/events/${eventId}/unregister`, {
      method: 'DELETE',
      credentials: 'include'
    }),
  
  applyVolunteer: (eventId) =>
    fetch(`${API_BASE}/events/${eventId}/volunteer`, {
      method: 'POST',
      credentials: 'include'
    }),
  
  getMyRegistrations: () =>
    fetch(`${API_BASE}/my-registrations`, { credentials: 'include' }),
  
  getNotifications: () =>
    fetch(`${API_BASE}/notifications`, { credentials: 'include' }),
  
  markNotificationRead: (notifId) =>
    fetch(`${API_BASE}/notifications/${notifId}/read`, {
      method: 'PUT',
      credentials: 'include'
    }),
  
  getDashboardStats: () =>
    fetch(`${API_BASE}/dashboard/stats`, { credentials: 'include' }),
  
  getCurrentUser: () =>
    fetch(`${API_BASE}/me`, { credentials: 'include' })
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await api.login(credentials);
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.error };
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginForm = () => {
  const [formData, setFormData] = useState({ user_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(formData);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Campus Event Management
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Demo accounts: S101/password, O101/password, A101/password
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.getDashboardStats();
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatsCards = () => {
    if (user.role === 'student') {
      return [
        { label: 'Registered Events', value: stats.registered_events || 0, icon: BookOpen, color: 'blue' },
        { label: 'Volunteer Applications', value: stats.volunteer_applications || 0, icon: Award, color: 'green' },
        { label: 'Upcoming Events', value: stats.upcoming_events || 0, icon: Calendar, color: 'purple' },
        { label: 'Unread Notifications', value: stats.unread_notifications || 0, icon: Bell, color: 'red' }
      ];
    } else {
      return [
        { label: user.role === 'admin' ? 'Total Events' : 'My Events', value: stats.total_events || stats.my_events || 0, icon: Calendar, color: 'blue' },
        { label: 'Total Registrations', value: stats.total_registrations || 0, icon: Users, color: 'green' },
        { label: 'Pending Volunteers', value: stats.pending_volunteers || 0, icon: Clock, color: 'yellow' },
        { label: user.role === 'admin' ? 'Total Users' : 'Active Events', value: stats.total_users || stats.active_events || 0, icon: User, color: 'purple' }
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {user.name}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            yellow: 'bg-yellow-500',
            red: 'bg-red-500'
          };
          
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-8 w-8 p-2 rounded text-white ${colorClasses[stat.color]}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Events List Component
const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    if (user.role === 'student') {
      fetchMyRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await api.getEvents();
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const response = await api.getMyRegistrations();
      if (response.ok) {
        const data = await response.json();
        setMyRegistrations(data.map(reg => reg.event_id));
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await api.registerForEvent(eventId);
      if (response.ok) {
        setMyRegistrations([...myRegistrations, eventId]);
        alert('Registration successful!');
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('Registration failed');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const response = await api.unregisterFromEvent(eventId);
      if (response.ok) {
        setMyRegistrations(myRegistrations.filter(id => id !== eventId));
        alert('Unregistration successful!');
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('Unregistration failed');
    }
  };

  const handleVolunteer = async (eventId) => {
    try {
      const response = await api.applyVolunteer(eventId);
      if (response.ok) {
        alert('Volunteer application submitted!');
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('Application failed');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
      </div>
      
      <div className="grid gap-6">
        {events.map((event) => {
          const isRegistered = myRegistrations.includes(event.event_id);
          const isPastDeadline = new Date(event.deadline) < new Date();
          
          return (
            <div key={event.event_id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-gray-600 mt-1">{event.description}</p>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <Calendar /> {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div>
                      <Users /> {event.venue}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {event.category}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {new Date(event.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Created by: {event.creator_name}
                  </div>
                </div>
                
                {user.role === 'student' && (
                  <div className="flex gap-2 ml-4">
                    {!isPastDeadline && (
                      <>
                        {isRegistered ? (
                          <button
                            onClick={() => handleUnregister(event.event_id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Unregister
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(event.event_id)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Register
                          </button>
                        )}
                        <button
                          onClick={() => handleVolunteer(event.event_id)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Volunteer
                        </button>
                      </>
                    )}
                    {isPastDeadline && (
                      <span className="px-4 py-2 text-sm bg-gray-200 text-gray-600 rounded">
                        Deadline Passed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Create Event Component
const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    deadline: '',
    max_participants: 100
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.createEvent(formData);
      if (response.ok) {
        alert('Event created successfully!');
        setFormData({
          name: '',
          description: '',
          date: '',
          venue: '',
          category: '',
          deadline: '',
          max_participants: 100
        });
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Educational">Educational</option>
              <option value="Social">Social</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Participants</label>
          <input
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

// Notifications Component
const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      const response = await api.markNotificationRead(notifId);
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.notif_id === notifId ? { ...notif, status: 'read' } : notif
        ));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.notif_id}
              className={`p-4 rounded-lg border ${
                notif.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`${notif.status === 'unread' ? 'font-semibold' : ''}`}>
                    {notif.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {notif.status === 'unread' && (
                  <button
                    onClick={() => handleMarkRead(notif.notif_id)}
                    className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Settings },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    if (user.role === 'organizer' || user.role === 'admin') {
      commonItems.splice(2, 0, { id: 'create-event', label: 'Create Event', icon: Plus });
    }

    return commonItems;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Campus Events</h1>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {getNavItems().map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {user.name} ({user.role})
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <EventsList />;
      case 'create-event':
        return user.role === 'organizer' || user.role === 'admin' ? <CreateEvent /> : <EventsList />;
      case 'notifications':
        return <NotificationsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AuthContent />
      </div>
    </AuthProvider>
  );
};

const AuthContent = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <MainApp />;
};

export default App