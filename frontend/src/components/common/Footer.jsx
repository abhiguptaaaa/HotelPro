import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Phone, Mail, MapPin, ShieldCheck, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto border-top border-secondary" style={{ backgroundColor: '#061512' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                <Hotel size={20} />
              </div>
              <h5 className="mb-0 fw-bold text-white tracking-wide">
                Hotel<span className="text-primary">Pro</span>
              </h5>
            </div>
            <p className="text-secondary small leading-relaxed">
              HotelPro is an enterprise-grade Hotel Management and Reservation ecosystem engineered with modern MERN architecture, offering real-time room availability, seamless multi-role workflows, and secure payment processing.
            </p>
            <div className="d-flex gap-3 text-secondary small mt-3">
              <div className="d-flex align-items-center gap-1">
                <ShieldCheck size={16} className="text-success" />
                <span>PCI-DSS Compliant</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Award size={16} className="text-warning" />
                <span>5-Star Certified</span>
              </div>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li><Link to="/" className="text-secondary text-decoration-none hover-text-white">Home</Link></li>
              <li><Link to="/rooms" className="text-secondary text-decoration-none hover-text-white">Rooms & Suites</Link></li>
              <li><Link to="/rooms?category=Deluxe" className="text-secondary text-decoration-none hover-text-white">Deluxe Rooms</Link></li>
              <li><Link to="/rooms?category=Executive+Suite" className="text-secondary text-decoration-none hover-text-white">Executive Suites</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-text-white">Guest Sign In</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Hotel Services</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>24/7 Digital Concierge & Front Desk</li>
              <li>Luxury Spa & Wellness Sanctuary</li>
              <li>Multi-Cuisine Michelin Dining</li>
              <li>Executive Business & Event Suites</li>
              <li>Airport Shuttle & Chauffeur Service</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Contact Reservations</h6>
            <div className="small text-secondary d-flex flex-column gap-2">
              <div className="d-flex align-items-start gap-2">
                <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                <span>100 Marina Boulevard, Connaught Place, New Delhi, 110001</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span>reservations@hotelpro.com</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} HotelPro Hospitality Systems. Designed for Skill Wallet & Resume Placement Showcase.
          </div>
          <div className="d-flex gap-3">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Terms of Service</span>
            <span>&bull;</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
