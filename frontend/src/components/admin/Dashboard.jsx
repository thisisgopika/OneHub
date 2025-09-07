import React from 'react';
import Dashboard from '../common/Dashboard.jsx'

export default function AdminDashboard() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Admin Dashboard</h1>
      <hr style={{ margin: '30px 0' }} />
      <Dashboard />
    </div>
  );
}
