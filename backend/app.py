from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_, or_, desc
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import os
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 
    'postgresql://postgres:password@localhost:5432/campus_events')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(20), primary_key=True)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)
    class_ = db.Column('class', db.String(20))
    semester = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'class': self.class_,
            'semester': self.semester,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Event(db.Model):
    __tablename__ = 'events'
    
    event_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.Date, nullable=False)
    venue = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50))
    created_by = db.Column(db.String(20), db.ForeignKey('users.user_id'))
    deadline = db.Column(db.Date, nullable=False)
    max_participants = db.Column(db.Integer, default=100)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User', backref='created_events')
    
    def to_dict(self):
        return {
            'event_id': self.event_id,
            'name': self.name,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'venue': self.venue,
            'category': self.category,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'max_participants': self.max_participants,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Registration(db.Model):
    __tablename__ = 'registrations'
    
    reg_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id', ondelete='CASCADE'))
    user_id = db.Column(db.String(20), db.ForeignKey('users.user_id', ondelete='CASCADE'))
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='registered')
    
    event = db.relationship('Event', backref='registrations')
    user = db.relationship('User', backref='registrations')

class VolunteerApplication(db.Model):
    __tablename__ = 'volunteer_applications'
    
    app_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id', ondelete='CASCADE'))
    user_id = db.Column(db.String(20), db.ForeignKey('users.user_id', ondelete='CASCADE'))
    status = db.Column(db.String(20), default='pending')
    applied_date = db.Column(db.DateTime, default=datetime.utcnow)
    decision_date = db.Column(db.DateTime)
    decided_by = db.Column(db.String(20), db.ForeignKey('users.user_id'))
    
    event = db.relationship('Event', backref='volunteer_applications')
    user = db.relationship('User', foreign_keys=[user_id], backref='volunteer_applications')

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    notif_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(20), db.ForeignKey('users.user_id', ondelete='CASCADE'))
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='unread')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
    
    def to_dict(self):
        return {
            'notif_id': self.notif_id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Authentication required'}), 401
            
            user = User.query.get(session['user_id'])
            if not user or user.role not in roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Authentication Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')
    
    if not user_id or not password:
        return jsonify({'error': 'User ID and password required'}), 400
    
    user = User.query.get(user_id)
    if user and user.password == password:
        session['user_id'] = user.user_id
        session['role'] = user.role
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    session.pop('user_id', None)
    session.pop('role', None)
    return jsonify({'message': 'Logout successful'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.get(data.get('user_id')):
        return jsonify({'error': 'User ID already exists'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        user_id=data.get('user_id'),
        password=data.get('password'),
        name=data.get('name'),
        email=data.get('email'),
        role=data.get('role', 'student'),
        class_=data.get('class'),
        semester=data.get('semester')
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Registration successful'}), 201

# Event Routes
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events])

@app.route('/api/events', methods=['POST'])
@role_required(['organizer', 'admin'])
def create_event():
    data = request.get_json()
    
    event = Event(
        name=data.get('name'),
        description=data.get('description'),
        date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
        venue=data.get('venue'),
        category=data.get('category'),
        created_by=session['user_id'],
        deadline=datetime.strptime(data.get('deadline'), '%Y-%m-%d').date(),
        max_participants=data.get('max_participants', 100)
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({'message': 'Event created successfully', 'event_id': event.event_id}), 201

@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    # Get registration count
    reg_count = Registration.query.filter_by(event_id=event_id).count()
    
    event_data = event.to_dict()
    event_data['registered_count'] = reg_count
    
    return jsonify(event_data)

@app.route('/api/events/<int:event_id>', methods=['PUT'])
@role_required(['organizer', 'admin'])
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    # Check if user is the creator or admin
    if event.created_by != session['user_id'] and session.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    
    event.name = data.get('name', event.name)
    event.description = data.get('description', event.description)
    event.venue = data.get('venue', event.venue)
    event.category = data.get('category', event.category)
    event.max_participants = data.get('max_participants', event.max_participants)
    
    if data.get('date'):
        event.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
    if data.get('deadline'):
        event.deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%d').date()
    
    db.session.commit()
    
    return jsonify({'message': 'Event updated successfully'})

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@role_required(['organizer', 'admin'])
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    # Check if user is the creator or admin
    if event.created_by != session['user_id'] and session.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted successfully'})

# Registration Routes
@app.route('/api/events/<int:event_id>/register', methods=['POST'])
@login_required
def register_for_event(event_id):
    event = Event.query.get_or_404(event_id)
    user_id = session['user_id']
    
    # Check if deadline has passed
    if event.deadline < datetime.now().date():
        return jsonify({'error': 'Registration deadline has passed'}), 400
    
    # Check if already registered
    existing_reg = Registration.query.filter_by(event_id=event_id, user_id=user_id).first()
    if existing_reg:
        return jsonify({'error': 'Already registered for this event'}), 400
    
    # Check if event is full
    current_registrations = Registration.query.filter_by(event_id=event_id).count()
    if current_registrations >= event.max_participants:
        return jsonify({'error': 'Event is full'}), 400
    
    # Create registration
    registration = Registration(event_id=event_id, user_id=user_id)
    db.session.add(registration)
    db.session.commit()
    
    return jsonify({'message': 'Registration successful'})

@app.route('/api/events/<int:event_id>/unregister', methods=['DELETE'])
@login_required
def unregister_from_event(event_id):
    registration = Registration.query.filter_by(
        event_id=event_id, 
        user_id=session['user_id']
    ).first()
    
    if not registration:
        return jsonify({'error': 'Not registered for this event'}), 400
    
    db.session.delete(registration)
    db.session.commit()
    
    return jsonify({'message': 'Unregistration successful'})

@app.route('/api/my-registrations', methods=['GET'])
@login_required
def get_my_registrations():
    registrations = db.session.query(Registration, Event).join(Event).filter(
        Registration.user_id == session['user_id']
    ).all()
    
    result = []
    for reg, event in registrations:
        event_data = event.to_dict()
        event_data['registration_date'] = reg.registration_date.isoformat()
        event_data['status'] = reg.status
        result.append(event_data)
    
    return jsonify(result)

# Volunteer Routes
@app.route('/api/events/<int:event_id>/volunteer', methods=['POST'])
@login_required
def apply_volunteer(event_id):
    event = Event.query.get_or_404(event_id)
    user_id = session['user_id']
    
    # Check if already applied
    existing_app = VolunteerApplication.query.filter_by(
        event_id=event_id, 
        user_id=user_id
    ).first()
    
    if existing_app:
        return jsonify({'error': 'Already applied as volunteer'}), 400
    
    # Create application
    application = VolunteerApplication(event_id=event_id, user_id=user_id)
    db.session.add(application)
    db.session.commit()
    
    return jsonify({'message': 'Volunteer application submitted'})

@app.route('/api/volunteer-applications', methods=['GET'])
@role_required(['organizer', 'admin'])
def get_volunteer_applications():
    # Get applications for events created by current user (or all if admin)
    query = db.session.query(VolunteerApplication, Event, User).join(
        Event, VolunteerApplication.event_id == Event.event_id
    ).join(User, VolunteerApplication.user_id == User.user_id)
    
    if session.get('role') != 'admin':
        query = query.filter(Event.created_by == session['user_id'])
    
    applications = query.all()
    
    result = []
    for app, event, user in applications:
        result.append({
            'app_id': app.app_id,
            'event_name': event.name,
            'event_id': event.event_id,
            'user_name': user.name,
            'user_id': user.user_id,
            'status': app.status,
            'applied_date': app.applied_date.isoformat(),
            'decision_date': app.decision_date.isoformat() if app.decision_date else None
        })
    
    return jsonify(result)

@app.route('/api/volunteer-applications/<int:app_id>/decision', methods=['PUT'])
@role_required(['organizer', 'admin'])
def update_volunteer_decision(app_id):
    application = VolunteerApplication.query.get_or_404(app_id)
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['accepted', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    
    # Check permission
    event = Event.query.get(application.event_id)
    if event.created_by != session['user_id'] and session.get('role') != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
    
    application.status = status
    application.decision_date = datetime.utcnow()
    application.decided_by = session['user_id']
    
    db.session.commit()
    
    # Create notification
    message = f"Your volunteer application for {event.name} has been {status}"
    notification = Notification(user_id=application.user_id, message=message)
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'message': f'Application {status}'})

# Notification Routes
@app.route('/api/notifications', methods=['GET'])
@login_required
def get_notifications():
    notifications = Notification.query.filter_by(
        user_id=session['user_id']
    ).order_by(desc(Notification.created_at)).limit(50).all()
    
    return jsonify([notif.to_dict() for notif in notifications])

@app.route('/api/notifications/<int:notif_id>/read', methods=['PUT'])
@login_required
def mark_notification_read(notif_id):
    notification = Notification.query.filter_by(
        notif_id=notif_id,
        user_id=session['user_id']
    ).first()
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    notification.status = 'read'
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'})

# Dashboard Routes
@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    user_id = session['user_id']
    role = session['role']
    
    stats = {}
    
    if role == 'student':
        stats['registered_events'] = Registration.query.filter_by(user_id=user_id).count()
        stats['volunteer_applications'] = VolunteerApplication.query.filter_by(user_id=user_id).count()
        stats['upcoming_events'] = Event.query.filter(Event.date >= datetime.now().date()).count()
        stats['unread_notifications'] = Notification.query.filter_by(
            user_id=user_id, status='unread'
        ).count()
    
    elif role in ['organizer', 'admin']:
        if role == 'admin':
            stats['total_events'] = Event.query.count()
            stats['total_users'] = User.query.count()
            stats['total_registrations'] = Registration.query.count()
        else:
            stats['my_events'] = Event.query.filter_by(created_by=user_id).count()
            stats['total_registrations'] = db.session.query(Registration).join(Event).filter(
                Event.created_by == user_id
            ).count()
        
        stats['pending_volunteers'] = db.session.query(VolunteerApplication).join(Event).filter(
            and_(
                VolunteerApplication.status == 'pending',
                Event.created_by == user_id if role != 'admin' else True
            )
        ).count()
    
    return jsonify(stats)

@app.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    return jsonify(user.to_dict())

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)