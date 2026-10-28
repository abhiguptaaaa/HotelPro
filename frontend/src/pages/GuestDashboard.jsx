import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import InvoiceModal from '../components/common/InvoiceModal';
import ReviewModal from '../components/common/ReviewModal';
import ServiceModal from '../components/common/ServiceModal';
import {
  CalendarCheck,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Star,
  ConciergeBell,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const GuestDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  // Modals state
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
  const [selectedServiceBooking, setSelectedServiceBooking] = useState(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const fetchGuestData = async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        API.get('/bookings/my'),
        API.get('/services/my'),
      ]);
      setBookings(bookingsRes.data.bookings || []);
      setServices(servicesRes.data.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund policy will be automatically applied.')) {
      return;
    }

    try {
      const res = await API.put(`/bookings/${bookingId}/cancel`, {
        reason: 'Guest cancelled from portal',
      });
      toast.success(res.data.message || 'Booking cancelled successfully');
      fetchGuestData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        {/* Guest Profile Banner */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={user?.name}
                className="rounded-circle border border-3 border-primary shadow-sm"
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
              />
              <div>
                <h4 className="fw-bold mb-0 text-dark">{user?.name}</h4>
                <div className="text-muted small">{user?.email} &bull; {user?.phone || 'No phone added'}</div>
                <span className="badge bg-primary-subtle text-primary mt-1">Verified Guest</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('bookings')}
              >
                <CalendarCheck size={16} className="me-1 inline" /> My Bookings ({bookings.length})
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'services' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('services')}
              >
                <ConciergeBell size={16} className="me-1 inline" /> Service Requests ({services.length})
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={16} className="me-1 inline" /> Profile Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div>
            <h5 className="fw-bold mb-3">Reservation History & Active Stays</h5>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <CalendarCheck size={48} className="text-muted mx-auto mb-3" />
                <h5 className="fw-bold mb-1">No reservations found</h5>
                <p className="text-muted small mb-3">You don't have any hotel bookings yet.</p>
                <div>
                  <a href="/rooms" className="btn btn-primary rounded-pill px-4 btn-sm">
                    Browse & Book Rooms
                  </a>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {bookings.map((b) => (
                  <div key={b._id} className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <span className="badge bg-dark px-3 py-1 rounded-pill mb-1">
                            Ref: {b.bookingNumber}
                          </span>
                          <h5 className="fw-bold text-dark mb-0">
                            {b.room?.title || 'Luxury Suite'}
                          </h5>
                          <div className="text-muted small">
                            Room #{b.room?.roomNumber} &bull; {b.room?.category?.name || 'Standard'}
                          </div>
                        </div>

                        <span
                          className={`badge px-3 py-2 rounded-pill ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-success'
                              : b.bookingStatus === 'checked-in'
                              ? 'bg-primary'
                              : b.bookingStatus === 'checked-out'
                              ? 'bg-secondary'
                              : 'bg-danger'
                          }`}
                        >
                          {b.bookingStatus?.toUpperCase()}
                        </span>
                      </div>

                      <div className="bg-light p-3 rounded-3 mb-3 small">
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>Check-In:</strong>
                            <div>{new Date(b.checkInDate).toLocaleDateString()} (2:00 PM)</div>
                          </div>
                          <div className="col-6">
                            <strong>Check-Out:</strong>
                            <div>{new Date(b.checkOutDate).toLocaleDateString()} (11:00 AM)</div>
                          </div>
                          <div className="col-6 mt-2">
                            <strong>Duration:</strong> {b.totalNights} Night(s)
                          </div>
                          <div className="col-6 mt-2">
                            <strong>Total Paid:</strong>{' '}
                            <span className="fw-bold text-primary">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-auto pt-2 d-flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedInvoiceBookingId(b._id)}
                          className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                        >
                          <FileText size={14} /> Receipt / Invoice
                        </button>

                        {/* Request Room Service if checked in */}
                        {b.bookingStatus === 'checked-in' && (
                          <button
                            onClick={() => setSelectedServiceBooking(b)}
                            className="btn btn-outline-warning text-dark btn-sm rounded-pill d-flex align-items-center gap-1"
                          >
                            <ConciergeBell size={14} /> Request Service
                          </button>
                        )}

                        {/* Leave Review if completed or checked-in */}
                        {(b.bookingStatus === 'checked-out' || b.bookingStatus === 'checked-in') && (
                          <button
                            onClick={() => setSelectedReviewBooking(b)}
                            className="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-1"
                          >
                            <Star size={14} /> Write Review
                          </button>
                        )}

                        {/* Cancel Booking if confirmed */}
                        {b.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1"
                          >
                            <XCircle size={14} /> Cancel & Refund
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Service Requests */}
        {activeTab === 'services' && (
          <div>
            <h5 className="fw-bold mb-3">In-Room Dining & Housekeeping Requests</h5>
            {services.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <ConciergeBell size={48} className="text-muted mx-auto mb-3" />
                <h5 className="fw-bold mb-1">No service requests active</h5>
                <p className="text-muted small">
                  When you are checked into a room, you can request room dining, linen changes, or assistance here.
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {services.map((s) => (
                  <div key={s._id} className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="badge bg-warning-subtle text-dark border mb-1">
                            {s.type}
                          </span>
                          <h6 className="fw-bold mb-0">Room #{s.room?.roomNumber || 'Assigned'}</h6>
                        </div>
                        <span
                          className={`badge px-3 py-1 rounded-pill ${
                            s.status === 'completed'
                              ? 'bg-success'
                              : s.status === 'in-progress'
                              ? 'bg-info text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {s.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="small text-muted mb-2">{s.description}</p>
                      {s.staffNotes && (
                        <div className="bg-light p-2 rounded small text-secondary">
                          <strong>Staff Note:</strong> {s.staffNotes}
                        </div>
                      )}
                      <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
                        Requested: {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-3">Update Personal Details</h5>
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 btn-sm fw-bold">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceBookingId && (
        <InvoiceModal
          bookingId={selectedInvoiceBookingId}
          onClose={() => setSelectedInvoiceBookingId(null)}
        />
      )}

      {/* Review Modal */}
      {selectedReviewBooking && (
        <ReviewModal
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onSuccess={fetchGuestData}
        />
      )}

      {/* Service Request Modal */}
      {selectedServiceBooking && (
        <ServiceModal
          booking={selectedServiceBooking}
          onClose={() => setSelectedServiceBooking(null)}
          onSuccess={fetchGuestData}
        />
      )}
    </div>
  );
};

export default GuestDashboard;
