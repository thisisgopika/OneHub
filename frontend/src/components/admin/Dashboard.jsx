import { Link } from 'react-router-dom';
import React from 'react';
import Dashboard from '../common/Dashboard.jsx'; // Make sure this path is correct

export default function AdminDashboard() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Admin Dashboard</h1>
      <hr style={{ margin: '30px 0' }} />
      
      {/* YOUR NAVIGATION LINKS HERE */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <Link to="/admin/system-stats">
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            System Stats
          </button>
        </Link>
        <Link to="/admin/classes">
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            Classes List
          </button>
        </Link>
      </div>

      <Dashboard />
    </div>
  );
}