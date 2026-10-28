import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Star,
  Users,
  Wifi,
  Tv,
  Coffee,
  CheckCircle,
  Calendar,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Building,
} from 'lucide-react';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  // Booking form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [checkInDate, setCheckInDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(dayAfterTomorrow.toISOString().split('T')[0]);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);

  useEffect(() => {
    const fetchRoomAndReviews = async () => {
      try {
        const [roomRes, reviewsRes] = await Promise.all([
          API.get(`/rooms/${id}`),
          API.get(`/reviews/room/${id}`),
        ]);
        setRoom(roomRes.data.room);
        setSelectedImage(roomRes.data.room?.images?.[0] || '');
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        toast.error('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchRoomAndReviews();
  }, [id]);

  // Live price calculations
  const calculatePricing = () => {
    if (!room || !checkInDate || !checkOutDate) return { nights: 0, roomCharges: 0, taxAmount: 0, total: 0 };
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut - checkIn;
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    const effectivePrice = room.discountPercent > 0
      ? Math.round(room.pricePerNight * (1 - room.discountPercent / 100))
      : room.pricePerNight;

    const roomCharges = effectivePrice * nights;
    const taxAmount = Math.round(roomCharges * 0.12);
    const total = roomCharges + taxAmount;

    return { nights, roomCharges, taxAmount, total, effectivePrice };
  };

  const pricing = calculatePricing();

  const handleCheckAvailability = async () => {
    try {
      const res = await API.post(`/rooms/${id}/availability`, {
        checkInDate,
        checkOutDate,
      });
      setAvailabilityMessage(res.data);
      if (res.data.isAvailable) {
        toast.success(res.data.message);
      } else {
        toast.warning(res.data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Error checking availability');
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to complete your reservation.');
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }

    setBookingLoading(true);
    try {
      const res = await API.post('/bookings', {
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guestsCount: { adults, children: childrenCount },
        specialRequests,
        paymentMethod,
      });

      toast.success('🎉 Reservation confirmed! Booking details saved.');
      navigate('/guest/dashboard');
    } catch (err) {
      toast.error(err.message || 'Booking submission failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <h4>Room accommodation not found.</h4>
        <Link to="/rooms" className="btn btn-primary btn-sm rounded-pill mt-3">
          Back to Room Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="mb-3">
          <Link to="/rooms" className="btn btn-link text-decoration-none text-muted p-0 d-flex align-items-center gap-1 small">
            <ArrowLeft size={16} /> Back to Rooms & Suites
          </Link>
        </div>

        <div className="row g-4">
          {/* Left Column: Image Gallery, Room Info & Reviews */}
          <div className="col-lg-8">
            {/* Main Featured Photo */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div style={{ height: '420px' }}>
                <img
                  src={selectedImage || room.images?.[0]}
                  alt={room.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              {/* Thumbnails */}
              {room.images?.length > 1 && (
                <div className="card-body p-3 bg-white border-top d-flex gap-2">
                  {room.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Thumbnail"
                      className={`rounded-3 cursor-pointer object-fit-cover border ${
                        selectedImage === img ? 'border-primary border-3 shadow-sm' : 'border-light'
                      }`}
                      style={{ width: '80px', height: '60px', cursor: 'pointer' }}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 mb-2">
                    {room.category?.name || 'Standard'}
                  </span>
                  <h2 className="fw-bold text-dark mb-1">{room.title}</h2>
                  <div className="text-muted small">
                    Room #{room.roomNumber} &bull; Floor {room.floor} &bull; Max {room.capacity} Guests
                  </div>
                </div>
                <div className="d-flex align-items-center gap-1 bg-warning bg-opacity-25 text-dark px-3 py-1 rounded-pill fw-bold">
                  <Star size={18} fill="#f59e0b" className="text-warning" />
                  <span>{room.rating}</span>
                  <span className="text-muted small">({room.numReviews} reviews)</span>
                </div>
              </div>

              <hr className="my-3" />

              <h5 className="fw-bold mb-2">Room Description</h5>
              <p className="text-secondary leading-relaxed mb-4">{room.description}</p>

              <h5 className="fw-bold mb-3">Room Amenities & Facilities</h5>
              <div className="row g-3">
                {room.amenities?.map((amenity, idx) => (
                  <div key={idx} className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle size={18} className="text-success flex-shrink-0" />
                      <span className="text-secondary small fw-medium">{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Reviews Section */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <MessageSquare size={20} className="text-primary" /> Verified Guest Reviews ({reviews.length})
                </h5>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No reviews posted for this room yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-3 rounded-3 bg-light border">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.guest?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={rev.guest?.name}
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold small">{rev.guest?.name || 'Verified Guest'}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
                          <Star size={14} fill="#f59e0b" />
                          <span>{rev.rating}/5</span>
                        </div>
                      </div>

                      <h6 className="fw-bold mb-1 fs-6">{rev.title}</h6>
                      <p className="text-secondary small mb-2">{rev.comment}</p>

                      {/* Staff Response */}
                      {rev.staffResponse?.comment && (
                        <div className="bg-white p-2 rounded mt-2 border-start border-primary border-3 small">
                          <strong className="text-primary d-block">Hotel Response:</strong>
                          <span className="text-muted">{rev.staffResponse.comment}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reservation & Pricing Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top bg-white" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-3 pb-3 border-bottom">
                <div>
                  <div className="text-muted small">Price per night</div>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="fs-3 fw-bold text-primary">
                      ₹{pricing.effectivePrice?.toLocaleString('en-IN')}
                    </span>
                    {room.discountPercent > 0 && (
                      <span className="text-decoration-line-through text-muted small">
                        ₹{room.pricePerNight?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                {room.discountPercent > 0 && (
                  <span className="badge bg-danger rounded-pill px-3 py-1">
                    {room.discountPercent}% SAVINGS
                  </span>
                )}
              </div>

              <form onSubmit={handleBookNow}>
                {/* Dates Selection */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted">Check-In</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted">Check-Out</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-grid mb-3">
                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                  >
                    Check Availability for Dates
                  </button>
                  {availabilityMessage && (
                    <div className={`small mt-1 text-center ${availabilityMessage.isAvailable ? 'text-success' : 'text-danger'}`}>
                      {availabilityMessage.message}
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted">Adults</label>
                    <select
                      className="form-select"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-muted">Children</label>
                    <select
                      className="form-select"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                    >
                      <option value="0">0 Children</option>
                      <option value="1">1 Child</option>
                      <option value="2">2 Children</option>
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="credit_card">Credit / Debit Card</option>
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="cash_at_desk">Pay at Front Desk</option>
                  </select>
                </div>

                {/* Special Requests */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Special Requests (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Quiet room, late arrival, extra bed..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  ></textarea>
                </div>

                {/* Price Breakdown */}
                <div className="bg-light p-3 rounded-3 mb-4 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span>
                      ₹{pricing.effectivePrice?.toLocaleString('en-IN')} &times; {pricing.nights} Night(s)
                    </span>
                    <span>₹{pricing.roomCharges?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Hospitality GST (12%)</span>
                    <span>₹{pricing.taxAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between fw-bold fs-6 text-dark">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{pricing.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm"
                >
                  {bookingLoading ? 'Processing...' : 'Reserve & Confirm Booking'}
                </button>

                <div className="text-center text-muted small mt-2 d-flex align-items-center justify-content-center gap-1">
                  <ShieldCheck size={14} className="text-success" /> Free cancellation up to 24h before
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
