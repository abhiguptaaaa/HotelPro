import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Hotel,
  Bell,
  User,
  LogOut,
  CalendarCheck,
  ShieldAlert,
  ConciergeBell,
  LayoutDashboard,
  CheckCircle,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await API.get('/notifications');
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2" style={{ backgroundColor: '#091e1a' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
            <Hotel size={22} />
          </div>
          <span className="tracking-wide">Hotel<span className="text-primary">Pro</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <Link className={`nav-link px-3 ${location.pathname === '/' ? 'active text-primary fw-semibold' : 'text-light'}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${location.pathname === '/rooms' ? 'active text-primary fw-semibold' : 'text-light'}`} to="/rooms">
                Rooms & Suites
              </Link>
            </li>

            {isAuthenticated && user?.role === 'guest' && (
              <li className="nav-item">
                <Link className={`nav-link px-3 ${location.pathname.startsWith('/guest') ? 'active text-primary fw-semibold' : 'text-light'}`} to="/guest/dashboard">
                  <CalendarCheck size={16} className="me-1" />
                  My Bookings
                </Link>
              </li>
            )}

            {isAuthenticated && (user?.role === 'staff' || user?.role === 'admin') && (
              <li className="nav-item">
                <Link className={`nav-link px-3 ${location.pathname.startsWith('/staff') ? 'active text-primary fw-semibold' : 'text-light'}`} to="/staff/dashboard">
                  <ConciergeBell size={16} className="me-1 text-warning" />
                  Staff Operations
                </Link>
              </li>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <li className="nav-item">
                <Link className={`nav-link px-3 ${location.pathname.startsWith('/admin') ? 'active text-primary fw-semibold' : 'text-light'}`} to="/admin/dashboard">
                  <LayoutDashboard size={16} className="me-1 text-info" />
                  Admin Analytics
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="dropdown position-relative">
                  <button
                    className="btn btn-outline-secondary text-light border-0 position-relative p-2 rounded-circle hover-bg-dark"
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      className="dropdown-menu dropdown-menu-end show shadow-lg border-0 p-0 mt-2"
                      style={{
                        width: '320px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        backgroundColor: '#0f2923',
                        color: '#f8fafc',
                        zIndex: 1050,
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
                        <h6 className="mb-0 fw-bold">Notifications</h6>
                        {unreadCount > 0 && (
                          <button
                            className="btn btn-link btn-sm text-info p-0 text-decoration-none"
                            onClick={handleMarkAllRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted small">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 border-bottom border-dark small ${n.isRead ? 'opacity-75' : 'bg-dark bg-opacity-50'}`}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="fw-semibold text-primary">{n.title}</span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mb-0 text-light opacity-90">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="rounded-circle border border-primary"
                    style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                  />
                  <div className="d-none d-md-block text-start me-2">
                    <div className="small fw-bold text-white lh-1">{user?.name}</div>
                    <span
                      className={`badge mt-1 ${
                        user?.role === 'admin'
                          ? 'bg-danger'
                          : user?.role === 'staff'
                          ? 'bg-warning text-dark'
                          : 'bg-primary'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
                    title="Logout"
                  >
                    <LogOut size={15} />
                    <span className="d-none d-sm-inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
