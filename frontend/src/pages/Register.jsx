import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, User, Mail, Lock, Phone, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'guest',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/guest/dashboard');
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div className="bg-primary text-white p-3 rounded-circle d-inline-flex mb-2 shadow-sm">
                  <Hotel size={28} />
                </div>
                <h3 className="fw-bold mb-1">Create HotelPro Account</h3>
                <p className="text-muted small">Register to unlock seamless reservations and guest services</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <User size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      className="form-control border-start-0"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Mail size={16} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Phone size={16} className="text-muted" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control border-start-0"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Account Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="guest">Guest / Traveler</option>
                    <option value="staff">Hotel Staff / Operations</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Password (min. 6 chars)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control border-start-0"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm mb-3"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>

                <div className="text-center small text-muted">
                  Already registered?{' '}
                  <Link to="/login" className="text-primary fw-bold text-decoration-none">
                    Sign In Here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
