import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import {
  DollarSign,
  TrendingUp,
  Users,
  BedDouble,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Shield,
  Activity,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0d9488', '#f59e0b', '#06b6d4', '#ef4444'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  // Add Room Modal State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    title: '',
    category: '',
    pricePerNight: '',
    discountPercent: '0',
    capacity: '2',
    floor: '1',
    description: '',
    amenities: 'High-Speed Wi-Fi, Air Conditioning, LED Smart TV, En-suite Bathroom',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  });

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, roomsRes, categoriesRes, bookingsRes, usersRes, logsRes] = await Promise.all([
        API.get('/admin/analytics'),
        API.get('/rooms'),
        API.get('/hotel/categories'),
        API.get('/bookings'),
        API.get('/auth/users'),
        API.get('/admin/logs'),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setRooms(roomsRes.data.rooms || []);
      setCategories(categoriesRes.data.categories || []);
      setBookings(bookingsRes.data.bookings || []);
      setUsers(usersRes.data.users || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Add Room
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArray = newRoom.amenities.split(',').map((item) => item.trim());
      await API.post('/rooms', {
        ...newRoom,
        pricePerNight: Number(newRoom.pricePerNight),
        discountPercent: Number(newRoom.discountPercent),
        capacity: Number(newRoom.capacity),
        floor: Number(newRoom.floor),
        amenities: amenitiesArray,
        images: [newRoom.image],
        hotel: rooms[0]?.hotel?._id || rooms[0]?.hotel,
      });

      toast.success(`Room #${newRoom.roomNumber} added to inventory!`);
      setShowAddRoomModal(false);
      setNewRoom({
        roomNumber: '',
        title: '',
        category: '',
        pricePerNight: '',
        discountPercent: '0',
        capacity: '2',
        floor: '1',
        description: '',
        amenities: 'High-Speed Wi-Fi, Air Conditioning, LED Smart TV, En-suite Bathroom',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      });
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to create room');
    }
  };

  // Handle Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete Room #${roomNumber}?`)) {
      return;
    }
    try {
      await API.delete(`/rooms/${roomId}`);
      toast.success(`Room #${roomNumber} deleted successfully`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete room');
    }
  };

  // Handle User Role Change
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/auth/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const pieData = analytics?.roomStatusCounts
    ? [
        { name: 'Available', value: analytics.roomStatusCounts.available },
        { name: 'Booked', value: analytics.roomStatusCounts.booked },
        { name: 'Cleaning', value: analytics.roomStatusCounts.cleaning },
        { name: 'Maintenance', value: analytics.roomStatusCounts.maintenance },
      ]
    : [];

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0">Executive Admin & Management Suite</h3>
            <p className="text-muted small">Financial analytics, room inventory control, and audit trail</p>
          </div>
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-1 shadow-sm px-3"
          >
            <Plus size={16} /> Add New Room
          </button>
        </div>

        {/* Top KPI Metric Cards */}
        {analytics && (
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Total Revenue</div>
                    <div className="fs-3 fw-bold text-success">
                      ₹{analytics.totalRevenue?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-2 bg-success-subtle text-success rounded-3">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="small text-muted mt-2">&uarr; 14% vs last cycle</div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Total Bookings</div>
                    <div className="fs-3 fw-bold text-primary">{analytics.totalBookings}</div>
                  </div>
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="small text-muted mt-2">All-time reservations</div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Occupancy Rate</div>
                    <div className="fs-3 fw-bold text-warning">{analytics.occupancyRate}%</div>
                  </div>
                  <div className="p-2 bg-warning-subtle text-warning rounded-3">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="small text-muted mt-2">{analytics.roomStatusCounts?.booked || 0} occupied rooms</div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Registered Guests</div>
                    <div className="fs-3 fw-bold text-info">{analytics.totalGuests}</div>
                  </div>
                  <div className="p-2 bg-info-subtle text-info rounded-3">
                    <Users size={20} />
                  </div>
                </div>
                <div className="small text-muted mt-2">Active customer profiles</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-2">
          <ul className="nav nav-pills nav-fill gap-2">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 size={16} className="me-1 inline" /> Business Analytics & Charts
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                <BedDouble size={16} className="me-1 inline" /> Room Inventory ({rooms.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <Calendar size={16} className="me-1 inline" /> All Bookings ({bookings.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={16} className="me-1 inline" /> Staff & Users ({users.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill fw-semibold ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('logs')}
              >
                <Activity size={16} className="me-1 inline" /> Audit Trail ({logs.length})
              </button>
            </li>
          </ul>
        </div>

        {/* Tab 1: Charts & Analytics */}
        {activeTab === 'analytics' && (
          <div className="row g-4">
            {/* Monthly Revenue Bar Chart */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h5 className="fw-bold mb-1">Monthly Revenue Performance</h5>
                <p className="text-muted small mb-3">Six-month financial progression in INR</p>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.revenueTrend || []}>
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        formatter={(val) => [`₹${val?.toLocaleString('en-IN')}`, 'Revenue']}
                        contentStyle={{ backgroundColor: '#0f2923', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Room Status Distribution Pie Chart */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h5 className="fw-bold mb-1">Room Status Distribution</h5>
                <p className="text-muted small mb-3">Live room allocation status</p>
                <div style={{ height: '260px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f2923', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Room Inventory */}
        {activeTab === 'rooms' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Rooms & Inventory Management</h5>
              <button
                onClick={() => setShowAddRoomModal(true)}
                className="btn btn-primary btn-sm rounded-pill"
              >
                <Plus size={14} className="me-1 inline" /> New Room
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Title & Category</th>
                    <th>Price / Night</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong className="fs-6">#{r.roomNumber}</strong>
                        <div className="small text-muted">Floor {r.floor}</div>
                      </td>
                      <td>
                        <div className="fw-bold">{r.title}</div>
                        <span className="badge bg-secondary-subtle text-secondary">{r.category?.name || 'Standard'}</span>
                      </td>
                      <td>
                        <strong>₹{r.pricePerNight?.toLocaleString('en-IN')}</strong>
                        {r.discountPercent > 0 && (
                          <span className="badge bg-danger ms-1">{r.discountPercent}% OFF</span>
                        )}
                      </td>
                      <td>{r.capacity} Guests</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
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
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                          className="btn btn-outline-danger btn-sm rounded-pill p-1 px-2"
                          title="Delete Room"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: All Bookings */}
        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">All Customer Bookings & Records</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Ref #</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <span className="badge bg-dark font-monospace">{b.bookingNumber}</span>
                      </td>
                      <td>
                        <div className="fw-bold">{b.guest?.name}</div>
                        <div className="small text-muted">{b.guest?.email}</div>
                      </td>
                      <td>
                        #{b.room?.roomNumber} - {b.room?.title}
                      </td>
                      <td>
                        <div className="small">{new Date(b.checkInDate).toLocaleDateString()} to {new Date(b.checkOutDate).toLocaleDateString()}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>({b.totalNights} nights)</div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: User Directory */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">Registered Users & Staff Permissions</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Registered</th>
                    <th>Manage Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="fw-bold">{u.name}</div>
                        <div className="small text-muted">{u.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'bg-danger'
                              : u.role === 'staff'
                              ? 'bg-warning text-dark'
                              : 'bg-primary'
                          }`}
                        >
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td>{u.department || 'Guest Services'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="form-select form-select-sm w-auto"
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                        >
                          <option value="guest">Guest</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">Security & Operations Audit Trail</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>User</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="small text-muted font-monospace">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-dark border">
                          {log.action}
                        </span>
                      </td>
                      <td><strong>{log.module}</strong></td>
                      <td>{log.user?.name || 'System Admin'}</td>
                      <td className="small text-secondary">{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <Plus size={20} className="text-primary" /> Add New Room to Inventory
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddRoomModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAddRoom}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Room Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 501"
                        value={newRoom.roomNumber}
                        onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Room Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Premier Panoramic Suite"
                        value={newRoom.title}
                        onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Category</label>
                      <select
                        className="form-select"
                        value={newRoom.category}
                        onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Price / Night (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="4999"
                        value={newRoom.pricePerNight}
                        onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Discount % (Optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={newRoom.discountPercent}
                        onChange={(e) => setNewRoom({ ...newRoom, discountPercent: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Max Guests Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Floor</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newRoom.floor}
                        onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Room highlights, view, ambience..."
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={newRoom.image}
                      onChange={(e) => setNewRoom({ ...newRoom, image: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Amenities (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newRoom.amenities}
                      onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddRoomModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">
                    Create & Publish Room
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

export default AdminDashboard;
