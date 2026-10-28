import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Mail, Lock, LogIn, Sparkles, Shield, UserCheck, Briefcase } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate(redirectPath === '/' ? '/guest/dashboard' : redirectPath);
      }
    }
  };

  const fillDemoAccount = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
              {/* Brand Header */}
              <div className="text-center mb-4">
                <div className="bg-primary text-white p-3 rounded-circle d-inline-flex mb-2 shadow-sm">
                  <Hotel size={28} />
                </div>
                <h3 className="fw-bold mb-1">Welcome to HotelPro</h3>
                <p className="text-muted small">Sign in to manage your bookings and hospitality services</p>
              </div>

              {/* 1-Click Demo Credential Buttons for Reviewers */}
              <div className="bg-light p-3 rounded-3 mb-4 border">
                <div className="d-flex align-items-center gap-1 text-primary small fw-bold mb-2">
                  <Sparkles size={15} /> 1-Click Demo Profiles (For Evaluator & Placement Demo)
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@hotelpro.com', 'admin123')}
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 flex-grow-1"
                  >
                    <Shield size={14} /> Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('staff@hotelpro.com', 'staff123')}
                    className="btn btn-outline-warning btn-sm text-dark d-flex align-items-center gap-1 flex-grow-1"
                  >
                    <Briefcase size={14} /> Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('guest@hotelpro.com', 'guest123')}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 flex-grow-1"
                  >
                    <UserCheck size={14} /> Guest
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Mail size={16} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm mb-3"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="text-center small text-muted">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-bold text-decoration-none">
                    Create Guest Account
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

export default Login;
