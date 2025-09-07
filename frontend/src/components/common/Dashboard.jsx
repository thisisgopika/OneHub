import authService from '../../services/authService.js';

const Dashboard = () => {
    const user = authService.getCurrentUser();
    
    const handleLogout = () => {
      authService.logout();
      window.location.href = '/login';
    };
  
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Welcome to OneHub</h1>
        {user && (
          <div>
            <h3>Hello, {user.name}!</h3>
            <p>User ID: {user.user_id}</p>
            <p>Role: {user.role}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Logout
        </button>
      </div>
    );
  };

export default Dashboard;