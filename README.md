# OneHub - Campus Event Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-15+-316192.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## Description

**OneHub** is a full-stack campus event management platform designed for colleges and universities. It helps with event organization, student participation tracking, volunteer management, and provides advanced analytics for accreditation and institutional reporting.

The system features multi-role dashboards (Student, Organizer, Admin), real-time notifications, and advanced database features including triggers, views, and constraints for optimal performance and data integrity.

### Key Features
- Multi-role system with separate dashboards
- Complete event lifecycle management
- Volunteer application and management
- Advanced analytics with class/semester performance tracking
- Real-time automated notifications
- Optimized PostgreSQL database with triggers and views
- JWT-based authentication with bcrypt encryption

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Database Architecture](#database-architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Credits](#credits)

## Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account
- Git

### Backend Setup

```bash
# Clone repository
git clone https://github.com/thisisgopika/OneHub.git
cd OneHub/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_secret_key
PORT=5000
EOF

# Start backend server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the schema from `schema/schema.sql` in Supabase SQL Editor
3. Database triggers and views are included in the schema
4. Update `.env` with your Supabase credentials

## Usage

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Default Test Users

**Admin**
- User ID: `ADM002`
- Password: `admin123`

**Organizer**
- User ID: `ORG002`
- Password: `testorganiser`

**Student**
- User ID: `STU001`
- Password: `student123`

### User Workflows

**As a Student:**
1. Login with student credentials
2. Browse available events by category
3. Register for events or apply as volunteer
4. View participation history and download reports
5. Receive notifications for updates

**As an Organizer:**
1. Login with organizer credentials
2. Create and manage events
3. Set capacity limits and registration deadlines
4. Review and approve volunteer applications
5. Access detailed event reports with statistics

**As an Admin:**
1. Login with admin credentials
2. View system-wide analytics dashboard
3. Monitor class and semester performance
4. Access top-performing and low-engagement classes
5. Generate reports for accreditation

## Database Architecture

### Core Tables (5)

- **users** - Students, organizers, and admins
- **events** - Campus events with details
- **registrations** - Event registration records
- **volunteer_applications** - Volunteer management
- **notifications** - User notification system

### Advanced DBMS Features

**Triggers (4)**
- Auto-update registration count
- Capacity enforcement (blocks when full)
- Deadline validation (blocks late registrations)
- Automatic notification creation

**Views (4)**
- `organizer_event_summary` - Pre-calculated event stats
- `class_semester_performance` - Class engagement analytics
- `semester_comparison` - Semester aggregates
- `top_performing_classes` - Rankings with RANK()

**Constraints (2)**
- `deadline_before_event` - Validates deadline ≤ event date
- `positive_capacity` - Ensures capacity > 0

**Indexes (5)**
- Optimized on frequently queried columns

**Performance Impact**
- 95% query reduction with views
- Denormalized counts eliminate COUNT(*) operations
- Database-level validation reduces app overhead

## Deployment

### Live Application
- **Frontend**: https://onehub-0l0j.onrender.com
- **Database**: Supabase (PostgreSQL)

### Deployment Stack
- **Frontend & Backend**: Render
- **Database**: Supabase
- **Version Control**: GitHub

### Environment Variables

**Production Backend**
```
SUPABASE_URL=<production_url>
SUPABASE_ANON_KEY=<production_key>
JWT_SECRET=<production_secret>
```

**Production Frontend**
```
VITE_API_URL=https://onehub-q86m.onrender.com/api
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ES6+ JavaScript standards
- Use meaningful variable names
- Comment complex logic
- Test all database triggers and constraints

## Credits

### Development Team

**[Gokul Santhosh]** - [@LostCres](https://github.com/LostCres)  
**[Gopika]** - [@thisisgopika](https://github.com/thisisgopika)  
**[Gregory Ajish]** - [@gregoryajish](https://github.com/gregoryajish)  
**[Haneen Muhammed]** - [@haneenmuhammed2005](https://github.com/haneenmuhammed2005)  


### Technologies Used
- React & Vite
- Node.js & Express
- PostgreSQL & Supabase
- JWT & Bcrypt
- Render (Deployment)

---

![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Maintenance](https://img.shields.io/badge/maintained-yes-brightgreen.svg)


**[⬆ Back to Top](#onehub---campus-event-management-system)**

---

*Replace `[Team Member X]` and `@github-username` with your actual team members' names and GitHub profiles.*
