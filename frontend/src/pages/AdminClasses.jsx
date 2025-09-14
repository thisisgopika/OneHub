import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 👈 Import the hook
import authService from '../services/authService.js';

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate(); // 👈 Initialize the hook

  // This function handles the dropdown change
  const handleSelectChange = (event) => {
    const selectedClass = event.target.value;
    if (selectedClass) {
      // Navigate to the dashboard URL with the selected class
      navigate(`/admin/classes/${selectedClass}/dashboard`);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = authService.getToken();
        const response = await axios.get(
          'http://localhost:5000/api/admin/classes',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClasses(response.data);
      } catch (err) {
        setError("Failed to fetch classes.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Admin: Class Selection</h1>
      <p>Select a class to view its dashboard and reports.</p>
      {classes.length > 0 ? (
        // Add the onChange event handler to the select tag
        <select onChange={handleSelectChange} defaultValue="">
          <option value="" disabled>Select a Class</option>
          {classes.map(c => (
            <option key={c.class} value={c.class}>{c.class}</option>
          ))}
        </select>
      ) : (
        <p>No classes found.</p>
      )}
    </div>
  );
}

export default AdminClasses;