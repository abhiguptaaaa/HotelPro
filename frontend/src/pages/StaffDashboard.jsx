import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import {
  ConciergeBell,
  Users,
  CheckCircle,
  LogIn,
  LogOut,
  Sparkles,
  Wrench,
  Clock,
  Shield,
  Key,
} from 'lucide-react';

const StaffDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checkin');

  // Check-In modal state
  const [checkInModalBooking, setCheckInModalBooking] = useState(null);
  const [keyCardNumber, setKeyCardNumber] = useState('');
  const [idProofType, setIdProofType] = useState('Passport');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [depositPaid, setDepositPaid] = useState('0');

  // Check-Out modal state
  const [checkOutModalBooking, setCheckOutModalBooking] = useState(null);
  const [roomCondition, setRoomCondition] = useState('Good');

  const fetchStaffData = async () => {
    try {
      const [overviewRes, bookingsRes, roomsRes, servicesRes] = await Promise.all([
        API.get('/operations/overview'),
        API.get('/bookings'),
        API.get('/rooms'),
        API.get('/services'),
      ]);
      setOverview(overviewRes.data.overview);
      setBookings(bookingsRes.data.bookings || []);
      setRooms(roomsRes.data.rooms || []);
      setServices(servicesRes.data.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Handle Check-In Submission
  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!checkInModalBooking) return;

    try {
      await API.post('/operations/check-in', {
        bookingId: checkInModalBooking._id,
        keyCardNumber,
        idProofType,
        idProofNumber,
        depositPaid: Number(depositPaid),
      });

      toast.success(`Guest checked into Room #${checkInModalBooking.room?.roomNumber}! Keycard ${keyCardNumber} issued.`);
      setCheckInModalBooking(null);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  // Handle Check-Out Submission
  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    if (!checkOutModalBooking) return;

    try {
      await API.post('/operations/check-out', {
        bookingId: checkOutModalBooking._id,
        roomConditionOnCheckOut: roomCondition,
      });

      toast.success(`Guest checked out! Room #${checkOutModalBooking.room?.roomNumber} marked for cleaning.`);
      setCheckOutModalBooking(null);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Check-out failed');
    }
  };

  // Update room status (Housekeeping)
  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await API.put(`/operations/room/${roomId}/status`, { status: newStatus });
      toast.success(`Room status updated to '${newStatus}'`);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Failed to update room status');
    }
  };

  // Update service request status
  const handleServiceStatusChange = async (serviceId, newStatus) => {
    try {
      await API.put(`/services/${serviceId}`, { status: newStatus });
      toast.success(`Service status set to '${newStatus}'`);
      fetchStaffData();
    } catch (err) {
      toast.error(err.message || 'Failed to update service request');
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Operations Overview Banner */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0">Hotel Operations & Front Desk Hub</h3>
            <p className="text-muted small">Daily check-in, check-out, room inventory, and guest service dispatch</p>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold">
            <ConciergeBell size={16} className="me-1 inline" /> Staff Duty Mode
          </span>
        </div>

        {/* Operational KPI Metric Cards */}
        {overview && (
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                <div className="text-muted small fw-bold text-uppercase">Active Check-Ins</div>
                <div className="fs-3 fw-bold text-primary">{overview.activeCheckIns}</div>
                <div className="small text-muted">Guests on property</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                <div className="text-muted small fw-bold text-uppercase">Today's Arrivals</div>
                <div className="fs-3 fw-bold text-success">{overview.todayArrivals}</div>
                <div className="small text-muted">Expected check-ins</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                <div className="text-muted small fw-bold text-uppercase">Rooms in Cleaning</div>
                <div className="fs-3 fw-bold text-warning">{overview.roomsCleaning}</div>
                <div className="small text-muted">Housekeeping active</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                <div className="text-muted small fw-bold text-uppercase">Live Occupancy</div>
                <div className="fs-3 fw-bold text-info">{overview.occupancyRate}%</div>
                <div className="small text-muted">Of total capacity</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-2">
          <ul className="nav nav-pills nav-fill gap-2">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'checkin' ? 'active' : ''}`}
                onClick={() => setActiveTab('checkin')}
              >
                <LogIn size={16} className="me-1 inline" /> Check-In Desk
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'checkout' ? 'active' : ''}`}
                onClick={() => setActiveTab('checkout')}
              >
                <LogOut size={16} className="me-1 inline" /> Check-Out Desk
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                <Sparkles size={16} className="me-1 inline" /> Housekeeping Board
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <ConciergeBell size={16} className="me-1 inline" /> Guest Requests ({services.filter((s) => s.status !== 'completed').length})
              </button>
            </li>
          </ul>
        </div>

        {/* Tab 1: Check-In Desk */}
        {activeTab === 'checkin' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">Reservations Awaiting Arrival & Check-In</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Booking Ref</th>
                    <th>Guest Details</th>
                    <th>Room Assigned</th>
                    <th>Dates</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter((b) => b.bookingStatus === 'confirmed')
                    .map((b) => (
                      <tr key={b._id}>
                        <td>
                          <span className="badge bg-dark font-monospace">{b.bookingNumber}</span>
                        </td>
                        <td>
                          <div className="fw-bold">{b.guest?.name}</div>
                          <div className="text-muted small">{b.guest?.phone || b.guest?.email}</div>
                        </td>
                        <td>
                          <strong>#{b.room?.roomNumber}</strong> - {b.room?.title}
                        </td>
                        <td>
                          <div className="small">In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                          <div className="small text-muted">Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success">
                            {b.paymentStatus?.toUpperCase()} (₹{b.totalAmount?.toLocaleString('en-IN')})
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setCheckInModalBooking(b);
                              setKeyCardNumber(`KC-${b.room?.roomNumber}-${Math.floor(10 + Math.random() * 90)}`);
                            }}
                            className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                          >
                            <Key size={14} /> Check In Guest
                          </button>
                        </td>
                      </tr>
                    ))}
                  {bookings.filter((b) => b.bookingStatus === 'confirmed').length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No pending arrivals waiting for check-in today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Check-Out Desk */}
        {activeTab === 'checkout' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">Currently Checked-In Guests</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Guest Name</th>
                    <th>Booking Ref</th>
                    <th>Check-Out Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter((b) => b.bookingStatus === 'checked-in')
                    .map((b) => (
                      <tr key={b._id}>
                        <td>
                          <strong className="fs-6 text-primary">#{b.room?.roomNumber}</strong>
                          <div className="small text-muted">{b.room?.title}</div>
                        </td>
                        <td>
                          <div className="fw-bold">{b.guest?.name}</div>
                          <div className="text-muted small">{b.guest?.email}</div>
                        </td>
                        <td>
                          <span className="badge bg-dark font-monospace">{b.bookingNumber}</span>
                        </td>
                        <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => setCheckOutModalBooking(b)}
                            className="btn btn-warning btn-sm text-dark rounded-pill fw-semibold"
                          >
                            <LogOut size={14} className="me-1 inline" /> Check Out Guest
                          </button>
                        </td>
                      </tr>
                    ))}
                  {bookings.filter((b) => b.bookingStatus === 'checked-in').length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No guests currently checked in.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Housekeeping Board */}
        {activeTab === 'rooms' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Room Status & Housekeeping Roster</h5>
              <span className="text-muted small">Update room statuses as rooms are sanitized and prepared.</span>
            </div>

            <div className="row g-3">
              {rooms.map((r) => (
                <div key={r._id} className="col-md-4 col-sm-6">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-0">Room #{r.roomNumber}</h5>
                        <span className="text-muted small">{r.category?.name || 'Standard'} &bull; Floor {r.floor}</span>
                      </div>
                      <span
                        className={`badge rounded-pill px-3 py-1 ${
                          r.status === 'available'
                            ? 'bg-success'
                            : r.status === 'booked'
                            ? 'bg-primary'
                            : r.status === 'cleaning'
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {r.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-top">
                      <label className="form-label small fw-bold text-muted mb-1">Update Status:</label>
                      <select
                        className="form-select form-select-sm"
                        value={r.status}
                        onChange={(e) => handleRoomStatusChange(r._id, e.target.value)}
                      >
                        <option value="available">Available (Cleaned & Inspected)</option>
                        <option value="cleaning">Cleaning (Housekeeping in progress)</option>
                        <option value="maintenance">Maintenance (Repairs needed)</option>
                        <option value="booked">Booked (Occupied)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Service Requests */}
        {activeTab === 'services' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">Guest Service Requests Queue</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Room</th>
                    <th>Guest</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <span className="badge bg-warning-subtle text-dark border">{s.type}</span>
                      </td>
                      <td>
                        <strong>#{s.room?.roomNumber}</strong>
                      </td>
                      <td>{s.guest?.name}</td>
                      <td>
                        <div className="small text-secondary">{s.description}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.priority === 'urgent'
                              ? 'bg-danger'
                              : s.priority === 'high'
                              ? 'bg-warning text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {s.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.status === 'completed'
                              ? 'bg-success'
                              : s.status === 'in-progress'
                              ? 'bg-info text-dark'
                              : 'bg-light text-dark border'
                          }`}
                        >
                          {s.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {s.status !== 'in-progress' && s.status !== 'completed' && (
                            <button
                              onClick={() => handleServiceStatusChange(s._id, 'in-progress')}
                              className="btn btn-outline-info btn-sm"
                            >
                              Start
                            </button>
                          )}
                          {s.status !== 'completed' && (
                            <button
                              onClick={() => handleServiceStatusChange(s._id, 'completed')}
                              className="btn btn-success btn-sm"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No service requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Check-In Modal */}
      {checkInModalBooking && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <LogIn size={20} className="text-primary" /> Process Guest Check-In
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCheckInModalBooking(null)}
                ></button>
              </div>

              <form onSubmit={handleCheckInSubmit}>
                <div className="modal-body p-4">
                  <div className="bg-light p-3 rounded mb-3 small">
                    <div><strong>Guest:</strong> {checkInModalBooking.guest?.name}</div>
                    <div><strong>Room:</strong> #{checkInModalBooking.room?.roomNumber} ({checkInModalBooking.room?.title})</div>
                    <div><strong>Booking Ref:</strong> {checkInModalBooking.bookingNumber}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Assigned Keycard / RFID Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={keyCardNumber}
                      onChange={(e) => setKeyCardNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">ID Proof Type</label>
                      <select
                        className="form-select"
                        value={idProofType}
                        onChange={(e) => setIdProofType(e.target.value)}
                      >
                        <option value="Passport">Passport</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="National ID">National ID</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">ID Number / Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. A1234567"
                        value={idProofNumber}
                        onChange={(e) => setIdProofNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Security Deposit Paid (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={depositPaid}
                      onChange={(e) => setDepositPaid(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCheckInModalBooking(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">
                    Confirm & Complete Check-In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Check-Out Modal */}
      {checkOutModalBooking && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <LogOut size={20} className="text-warning" /> Confirm Guest Check-Out
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCheckOutModalBooking(null)}
                ></button>
              </div>

              <form onSubmit={handleCheckOutSubmit}>
                <div className="modal-body p-4">
                  <p>
                    Are you ready to check out <strong>{checkOutModalBooking.guest?.name}</strong> from{' '}
                    <strong>Room #{checkOutModalBooking.room?.roomNumber}</strong>?
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Room Condition Inspection</label>
                    <select
                      className="form-select"
                      value={roomCondition}
                      onChange={(e) => setRoomCondition(e.target.value)}
                    >
                      <option value="Excellent">Excellent (No issues)</option>
                      <option value="Good">Good (Normal wear)</option>
                      <option value="Requires Deep Cleaning">Requires Deep Cleaning</option>
                      <option value="Damaged">Damage Noted (Report to Manager)</option>
                    </select>
                  </div>

                  <div className="alert alert-info small mb-0">
                    💡 This will return the guest's deposit (if any) and automatically change the room's status to <strong>Cleaning</strong> for the housekeeping team.
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCheckOutModalBooking(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning btn-sm text-dark px-4 fw-bold">
                    Complete Check-Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
