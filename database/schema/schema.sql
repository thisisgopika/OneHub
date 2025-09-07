-- Campus Event Management System Database Setup
-- Run this in pgAdmin Query Tool

-- 1. Users table
CREATE TABLE users (
    user_id VARCHAR(20) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'organizer', 'admin')),
    class VARCHAR(20), -- For students like 'S5 CS', 'S4 IT'
    semester INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Events table
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    venue VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    created_by VARCHAR(20) REFERENCES users(user_id),
    deadline DATE NOT NULL,
    max_participants INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Registrations table
CREATE TABLE registrations (
    reg_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
    user_id VARCHAR(20) REFERENCES users(user_id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered'
);

-- 4. Volunteer Applications table
CREATE TABLE volunteer_applications (
    app_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
    user_id VARCHAR(20) REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    applied_date TIMESTAMP DEFAULT NOW(),
    decision_date TIMESTAMP,
    decided_by VARCHAR(20) REFERENCES users(user_id)
);

-- 5. Notifications table
CREATE TABLE notifications (
    notif_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Insert Sample Data for Testing

-- Sample Users
INSERT INTO users (user_id, password, name, email, role, class, semester) VALUES
('S101', '$2b$10$dummyhash1', 'John Doe', 'john.doe@college.edu', 'student', 'S5 CS', 5),
('S102', '$2b$10$dummyhash2', 'Alice Smith', 'alice.smith@college.edu', 'student', 'S4 IT', 4),
('S103', '$2b$10$dummyhash3', 'Bob Johnson', 'bob.johnson@college.edu', 'student', 'S5 CS', 5),
('O101', '$2b$10$dummyhash4', 'Prof. Jane Wilson', 'jane.wilson@college.edu', 'organizer', NULL, NULL),
('O102', '$2b$10$dummyhash5', 'Dr. Mike Brown', 'mike.brown@college.edu', 'organizer', NULL, NULL),
('A101', '$2b$10$dummyhash6', 'Admin User', 'admin@college.edu', 'admin', NULL, NULL);

-- Sample Events
INSERT INTO events (name, description, date, venue, category, created_by, deadline, max_participants) VALUES
('Coding Hackathon 2025', 'Annual coding competition for all students', '2025-09-20', 'Computer Lab 1', 'Technical', 'O101', '2025-09-15', 50),
('Cultural Fest', 'Inter-college cultural competition', '2025-10-05', 'Main Auditorium', 'Cultural', 'O102', '2025-09-30', 200),
('Tech Talk: AI & Future', 'Guest lecture on Artificial Intelligence', '2025-09-25', 'Seminar Hall', 'Educational', 'O101', '2025-09-22', 100),
('Sports Day', 'Annual sports competition', '2025-10-15', 'Sports Ground', 'Sports', 'O102', '2025-10-10', 150);

-- Sample Registrations
INSERT INTO registrations (event_id, user_id) VALUES
(1, 'S101'), -- John registered for Hackathon
(1, 'S102'), -- Alice registered for Hackathon  
(2, 'S101'), -- John registered for Cultural Fest
(3, 'S103'); -- Bob registered for Tech Talk

-- Sample Volunteer Applications
INSERT INTO volunteer_applications (event_id, user_id, status) VALUES
(1, 'S102', 'pending'),   -- Alice applied as volunteer for Hackathon
(2, 'S103', 'accepted'),  -- Bob accepted as volunteer for Cultural Fest
(3, 'S101', 'pending');   -- John applied as volunteer for Tech Talk

-- Sample Notifications
INSERT INTO notifications (user_id, message) VALUES
('S101', 'Successfully registered for Coding Hackathon 2025'),
('S102', 'Successfully registered for Coding Hackathon 2025'),
('S101', 'Successfully registered for Cultural Fest'),
('S103', 'You have been selected as volunteer for Cultural Fest'),
('S101', 'New event added: Tech Talk: AI & Future'),
('S102', 'New event added: Tech Talk: AI & Future'),
('S103', 'New event added: Tech Talk: AI & Future');

-- Create indexes for better performance
CREATE INDEX idx_events_deadline ON events(deadline);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Create a trigger function for automatic notifications
CREATE OR REPLACE FUNCTION notify_registration()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, message)
    VALUES (NEW.user_id, 'Successfully registered for ' || 
            (SELECT name FROM events WHERE event_id = NEW.event_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER registration_notification
    AFTER INSERT ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION notify_registration();

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
