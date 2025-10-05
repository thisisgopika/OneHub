

--Content is user-generated and unverified.
--6
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
    status VARCHAR(20) DEFAULT 'registered',
    semester INTEGER NOT NULL
);

-- 4. Volunteer Applications table
CREATE TABLE volunteer_applications (
    app_id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
    user_id VARCHAR(20) REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    applied_date TIMESTAMP DEFAULT NOW(),
    decision_date TIMESTAMP,
    decided_by VARCHAR(20) REFERENCES users(user_id),
    semester INTEGER
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
('S101', '$2b$10$LyY7XnBW.u0py2AQ6AHv8.vu0PjzEbYvp20pH8aSEhXe9FjM0uRlK', 'John Doe', 'john.doe@college.edu', 'student', 'S5 CS', 5),
('S102', '$2b$10$LyY7XnBW.u0py2AQ6AHv8.vu0PjzEbYvp20pH8aSEhXe9FjM0uRlK', 'Alice Smith', 'alice.smith@college.edu', 'student', 'S4 IT', 4),
('S103', '$2b$10$LyY7XnBW.u0py2AQ6AHv8.vu0PjzEbYvp20pH8aSEhXe9FjM0uRlK', 'Bob Johnson', 'bob.johnson@college.edu', 'student', 'S5 CS', 5),
('O101', '$2b$10$LyY7XnBW.u0py2AQ6AHv8.vu0PjzEbYvp20pH8aSEhXe9FjM0uRlK', 'Prof. Jane Wilson', 'jane.wilson@college.edu', 'organizer', NULL, NULL),
('O102', '$2b$10$LyY7XnBW.u0py2AQ6AHv8.vu0PjzEbYvp20pH8aSEhXe9FjM0uRlK', 'Dr. Mike Brown', 'mike.brown@college.edu', 'organizer', NULL, NULL),
('A101', '$2b$10$LyY7XnBW.u0py2AQ6AHv8.vu0PjzEbYvp20pH8aSEhXe9FjM0uRlK', 'Admin User', 'admin@college.edu', 'admin', NULL, NULL);

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

CREATE OR REPLACE VIEW organizer_event_summary AS
SELECT
    e.event_id,
    e.name,
    e.description,
    e.date,
    e.deadline,
    e.venue,
    e.category,
    e.created_by,
    e.created_at,
    e.max_participants,
    e.volunteer_calls_enabled,
    e.registrations_enabled,
    COUNT(DISTINCT r.reg_id) as registered_count,
    (e.max_participants - COUNT(DISTINCT r.reg_id)) as available_slots,
    COUNT(DISTINCT v.app_id) as total_volunteer_applications,
    COUNT(DISTINCT CASE WHEN v.status = 'pending' THEN v.app_id END) as pending_volunteers,
    COUNT(DISTINCT CASE WHEN v.status = 'accepted' THEN v.app_id END) as accepted_volunteers,
    COUNT(DISTINCT CASE WHEN v.status = 'rejected' THEN v.app_id END) as rejected_volunteers,
    CASE
        WHEN e.deadline < CURRENT_DATE THEN 'Closed'
        WHEN COUNT(DISTINCT r.reg_id) >= e.max_participants THEN 'Full'
        ELSE 'Open'
    END as registration_status,
    (e.deadline - CURRENT_DATE) as days_until_deadline
FROM events e
LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'registered'
LEFT JOIN volunteer_applications v ON e.event_id = v.event_id
GROUP BY e.event_id, e.name, e.description, e.date, e.deadline, e.venue, e.category, e.created_by, e.created_at, e.max_participants, e.volunteer_calls_enabled, e.registrations_enabled;



CREATE OR REPLACE VIEW class_semester_performance AS
SELECT
    u.class,
    u.semester,
    -- Student counts
    COUNT(DISTINCT u.user_id) as total_students,
    COUNT(DISTINCT r.user_id) as active_students,

    -- Registration metrics
    COUNT(r.reg_id) as total_registrations,
    ROUND(
        COALESCE(
            (COUNT(r.reg_id)::DECIMAL / NULLIF(COUNT(DISTINCT u.user_id), 0)),
            0
        ),
        2
    ) as avg_events_per_student,

    -- Engagement rate
    ROUND(
        CASE
            WHEN COUNT(DISTINCT u.user_id) > 0
            THEN (COUNT(DISTINCT r.user_id)::DECIMAL / COUNT(DISTINCT u.user_id) * 100)
            ELSE 0
        END,
        1
    ) as engagement_rate,

    -- Volunteer participation
    COUNT(DISTINCT va.user_id) FILTER (WHERE va.status = 'accepted') as volunteer_count,

    -- Category breakdown
    COUNT(DISTINCT CASE WHEN e.category = 'Technical' THEN r.reg_id END) as technical_events,
    COUNT(DISTINCT CASE WHEN e.category = 'Cultural' THEN r.reg_id END) as cultural_events,
    COUNT(DISTINCT CASE WHEN e.category = 'Sports' THEN r.reg_id END) as sports_events,
    COUNT(DISTINCT CASE WHEN e.category = 'Workshop' THEN r.reg_id END) as workshop_events,
    COUNT(DISTINCT CASE WHEN e.category = 'Educational' THEN r.reg_id END) as educational_events

FROM users u
LEFT JOIN registrations r ON u.user_id = r.user_id AND r.status = 'registered'
LEFT JOIN events e ON r.event_id = e.event_id
LEFT JOIN volunteer_applications va ON u.user_id = va.user_id

WHERE u.role = 'student'
  AND u.class IS NOT NULL
  AND u.semester IS NOT NULL
GROUP BY u.class, u.semester
ORDER BY engagement_rate DESC;


CREATE OR REPLACE VIEW semester_comparison AS
SELECT
    u.semester,
    COUNT(DISTINCT u.user_id) as total_students,
    COUNT(DISTINCT r.user_id) as active_students,
    COUNT(r.reg_id) as total_registrations,
    ROUND(
        CASE
            WHEN COUNT(DISTINCT u.user_id) > 0
            THEN (COUNT(DISTINCT r.user_id)::DECIMAL / COUNT(DISTINCT u.user_id) * 100)
            ELSE 0
        END,
        1
    ) as engagement_rate,
    ROUND(
        COALESCE(
            (COUNT(r.reg_id)::DECIMAL / NULLIF(COUNT(DISTINCT u.user_id), 0)),
            0
        ),
        2
    ) as avg_events_per_student,
    COUNT(DISTINCT va.user_id) FILTER (WHERE va.status = 'accepted') as volunteer_count
FROM users u
LEFT JOIN registrations r ON u.user_id = r.user_id AND r.status = 'registered'
LEFT JOIN volunteer_applications va ON u.user_id = va.user_id
WHERE u.role = 'student' AND u.semester IS NOT NULL
GROUP BY u.semester
ORDER BY u.semester;


CREATE OR REPLACE VIEW top_performing_classes AS
SELECT
    class,
    semester,
    total_students,
    active_students,
    engagement_rate,
    total_registrations,
    avg_events_per_student,
    volunteer_count,
    RANK() OVER (ORDER BY engagement_rate DESC) as engagement_rank,
    RANK() OVER (ORDER BY total_registrations DESC) as activity_rank
FROM class_semester_performance
WHERE class IS NOT NULL AND semester IS NOT NULL
ORDER BY engagement_rate DESC
LIMIT 10;
