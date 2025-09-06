📝 AI-Friendly Authentication Reference
markdown# Authentication System Reference

## Available Components
- JWT middleware: `verifyToken` from `../middleware/auth.js`
- Auth service: `authService` from `../services/authService.js`
- User data available in `req.user` after using `verifyToken`

## Backend Integration
```javascript
// Import and use middleware
import { verifyToken } from '../middleware/auth.js';
router.post('/route', verifyToken, controller);

// Access current user in controllers
const user_id = req.user.user_id;     // Current user ID
const role = req.user.role;           // User role (student/organizer/admin)
const name = req.user.name;           // User name
Frontend Integration
javascript// Check authentication status
import authService from '../services/authService.js';
const isLoggedIn = authService.isAuthenticated();
const currentUser = authService.getCurrentUser();
const token = authService.getToken();
Database Schema Context

users table: user_id (PK), name, email, role, password, class, semester
events table: event_id (PK), name, created_by (FK to users.user_id)
registrations table: user_id (FK), event_id (FK), registration_date

Test Credentials

User ID: TEST001, Password: testpassword123
Backend: http://localhost:5000
Frontend: http://localhost:5173