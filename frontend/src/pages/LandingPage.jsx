import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>OneHub</h2>
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="nav-btn secondary">Login</Link>
            <Link to="/register" className="nav-btn primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Streamline Your Campus Events with
              <span className="gradient-text"> OneHub</span>
            </h1>
            <p className="hero-description">
              The ultimate platform for managing campus events, student registrations, and volunteer coordination. 
              Connect students, organizers, and administrators in one seamless ecosystem.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn primary large">
                Join OneHub Today
              </Link>
              <Link to="/login" className="btn secondary large">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-features">
            <div className="feature-card">
              {/* <div className="card-icon">🎯</div> */}
              <h3>Event Management</h3>
              <p>Create, organize, and track campus events effortlessly</p>
            </div>
            <div className="feature-card">
              {/* <div className="card-icon">👥</div> */}
              <h3>Student Engagement</h3>
              <p>Connect students with exciting opportunities</p>
            </div>
            <div className="feature-card">
              {/* <div className="card-icon">📊</div> */}
              <h3>Analytics & Reports</h3>
              <p>Comprehensive insights for better decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose OneHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              {/*<div className="feature-icon">🎓</div>*/}
              <h3>For Students</h3>
              <p>Discover and register for exciting campus events, apply as volunteers, and track your participation history.</p>
              <ul>
                <li>Browse upcoming events</li>
                <li>Easy registration process</li>
                <li>Volunteer opportunities</li>
                <li>Personal event dashboard</li>
              </ul>
            </div>
            <div className="feature-card">
             {/* <div className="feature-icon">🎪</div> */}
              <h3>For Organizers</h3>
              <p>Create and manage events efficiently with powerful tools for participant management and volunteer coordination.</p>
              <ul>
                <li>Event creation & management</li>
                <li>Participant tracking</li>
                <li>Volunteer approval system</li>
                <li>Event analytics</li>
              </ul>
            </div>
            <div className="feature-card">
              {/* <div className="feature-icon">⚙️</div> */}
              <h3>For Administrators</h3>
              <p>Oversee the entire campus event ecosystem with comprehensive reporting and class-based analytics.</p>
              <ul>
                <li>System-wide overview</li>
                <li>Class-based reporting</li>
                <li>User management</li>
                <li>Performance metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account as a student, organizer, or administrator</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Explore</h3>
              <p>Browse events, create new ones, or manage your dashboard</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Engage</h3>
              <p>Register for events, volunteer, or organize amazing experiences</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Track</h3>
              <p>Monitor your progress and view comprehensive analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Campus Events?</h2>
            <p>Join thousands of students and organizers who are already using OneHub to create amazing campus experiences.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn primary large">
                Get Started Free
              </Link>
              <Link to="/login" className="btn outline large">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>OneHub</h3>
              <p>Streamlining campus events for better student engagement and community building.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 OneHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
