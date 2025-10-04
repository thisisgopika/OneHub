import React, { useEffect, useState } from 'react';
import AdminSidebarNav from './AdminSidebarNav';
import authService from '../../services/authService';
import API from "../../services/api.js";
import "../../styles/StudentDashboard.css";

export default function AdminDashboard() {
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Performance dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserName(user.username || user.name);
      setUserEmail(user.email);
      setUserId(user.user_id);
    }

    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/dashboard');
      setPerformanceData(response.data);
    } catch (err) {
      console.error('Performance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (rate) => {
    if (rate >= 70) return '#22c55e';
    if (rate >= 40) return '#eab308';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <AdminSidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const { overview, classPerformance, semesterComparison, topPerformers, lowPerformers } = performanceData || {};

  return (
    <div className="student-dashboard">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <AdminSidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {userName}!</h1>
          <p className="dashboard-subtitle">Class & Semester Performance Analysis</p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #333' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'overview' ? '#ff3c1f' : '#888',
              borderBottom: activeTab === 'overview' ? '3px solid #ff3c1f' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'rankings' ? '#ff3c1f' : '#888',
              borderBottom: activeTab === 'rankings' ? '3px solid #ff3c1f' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Rankings
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'trends' ? '#ff3c1f' : '#888',
              borderBottom: activeTab === 'trends' ? '3px solid #ff3c1f' : 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Trends
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div className="stat-title">Total Classes</div>
                <div className="stat-value">{overview?.total_classes || 0}</div>
                <div className="stat-description">Tracked</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Students</div>
                <div className="stat-value">{overview?.total_students || 0}</div>
                <div className="stat-description">Across campus</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Avg Engagement</div>
                <div className="stat-value" style={{ color: '#ff3c1f' }}>{overview?.avg_engagement || 0}%</div>
                <div className="stat-description">Campus-wide</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Active Semesters</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{overview?.active_semesters || 'N/A'}</div>
                <div className="stat-description">Currently</div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Semester-wise Performance</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {semesterComparison?.map((sem) => (
                  <div key={sem.semester} className="stat-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Semester {sem.semester}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Total: </span>
                        <strong>{sem.total_students}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Active: </span>
                        <strong>{sem.active_students}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Engagement: </span>
                        <strong style={{ color: '#ff3c1f' }}>{sem.engagement_rate}%</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Avg Events: </span>
                        <strong>{sem.avg_events_per_student}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Detailed Class Performance</h2>
              <div style={{ background: '#252525', borderRadius: '8px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a1a1a' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Class</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Sem</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Students</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Active</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Engagement</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Events</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Avg/Std</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Vol</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'white' }}>Categories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classPerformance?.map((cls, index) => (
                      <tr key={index} style={{ borderTop: '1px solid #333' }}>
                        <td style={{ padding: '1rem', fontWeight: '500', color: 'white' }}>{cls.class}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{cls.semester}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{cls.total_students}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{cls.active_students}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            background: `${getEngagementColor(cls.engagement_rate)}20`,
                            color: getEngagementColor(cls.engagement_rate)
                          }}>
                            {cls.engagement_rate}%
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'white' }}>{cls.total_registrations}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{cls.avg_events_per_student}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{cls.volunteer_count}</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'white' }}>
                          T:{cls.technical_events} C:{cls.cultural_events} S:{cls.sports_events} W:{cls.workshop_events}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>T=Technical, C=Cultural, S=Sports, W=Workshop</p>
            </div>
          </>
        )}

        {/* Rankings Tab */}
        {activeTab === 'rankings' && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'white' }}>Top 10 Most Engaged Classes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topPerformers?.map((cls, index) => (
                  <div key={index} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', width: '4rem', textAlign: 'center' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{cls.class} (Semester {cls.semester})</h3>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
                        <span style={{ color: '#ff3c1f', fontWeight: 'bold' }}>{cls.engagement_rate}% Engagement</span>
                        <span>{cls.total_registrations} Total Events</span>
                        <span>{cls.active_students}/{cls.total_students} students active</span>
                        <span>{cls.volunteer_count} volunteers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {lowPerformers && lowPerformers.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'white' }}>Classes Needing Attention (Below 50%)</h2>
                <div className="stat-card">
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lowPerformers.map((cls, index) => (
                      <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                        <span style={{ color: 'white' }}>{cls.class} (Sem {cls.semester}): {cls.engagement_rate}%</span>
                        <span style={{ color: '#888' }}>Only {cls.active_students}/{cls.total_students} active</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ color: '#888', marginTop: '1rem' }}>Recommendation: Schedule engagement meeting</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'white' }}>Semester-wise Engagement Trends</h2>
            <div className="stat-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {semesterComparison?.map((sem) => (
                  <div key={sem.semester}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '500', color: 'white' }}>Semester {sem.semester}</span>
                      <span style={{ color: '#ff3c1f', fontWeight: 'bold' }}>{sem.engagement_rate}%</span>
                    </div>
                    <div style={{ width: '100%', background: '#444', borderRadius: '1rem', height: '1.5rem', overflow: 'hidden' }}>
                      <div style={{
                        background: '#ff3c1f',
                        height: '100%',
                        width: `${sem.engagement_rate}%`,
                        transition: 'width 0.5s',
                        borderRadius: '1rem'
                      }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                      {sem.active_students}/{sem.total_students} students active | Avg {sem.avg_events_per_student} events/student
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}