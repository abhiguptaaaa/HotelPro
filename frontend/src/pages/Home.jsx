import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Calendar,
  Users,
  Search,
  Star,
  ShieldCheck,
  Coffee,
  Wifi,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Building,
  Bed,
  Check,
  Waves,
  Utensils,
  Sun,
  Briefcase,
  Mountain,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search widget state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Live Auto-Complete Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, catRes] = await Promise.all([
          API.get('/rooms'),
          API.get('/hotel/categories').catch(() => ({ data: { categories: [] } })),
        ]);
        setFeaturedRooms(roomsRes.data.rooms?.slice(0, 3) || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch search suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await API.get(`/hotel/suggestions?q=${encodeURIComponent(searchKeyword)}`);
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        // silently fallback
      }
    };

    const timer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Click outside listener for suggestions popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const queryParams = new URLSearchParams();
    if (searchKeyword.trim()) queryParams.append('search', searchKeyword.trim());
    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (guests && guests !== 'any') queryParams.append('capacity', guests);
    navigate(`/rooms?${queryParams.toString()}`);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchKeyword(suggestion.query);
    setShowSuggestions(false);
    navigate(`/rooms?search=${encodeURIComponent(suggestion.query)}`);
  };

  // 6 Interactive Resort Facilities
  const resortFacilities = [
    {
      title: 'Infinity Sky Pool',
      desc: 'Temperature-controlled rooftop pool with panoramic skyline & sunset vistas and swim-up bar.',
      keyword: 'Pool',
      img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
      badge: 'Rooftop Oasis',
    },
    {
      title: 'Wellness Spa & Jacuzzi',
      desc: 'Holistic rejuvenation therapies, Ayurvedic massages, heated stone baths, and herbal steam sauna.',
      keyword: 'Spa',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      badge: 'Rejuvenation',
    },
    {
      title: 'Michelin Star Dining',
      desc: 'Curated multi-cuisine culinary experiences with celebrated chefs preparing authentic gourmet menus.',
      keyword: 'Dining',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      badge: 'Fine Dining',
    },
    {
      title: 'Private Beach Access',
      desc: 'Golden sun-kissed sand, private beachfront cabanas, sunset cocktail lounges, and water sports.',
      keyword: 'Beach',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      badge: 'Coastal Retreat',
    },
    {
      title: 'Executive Business Lounge',
      desc: 'Ultra-fast gigabit fiber, ergonomic private workstations, meeting suites, and concierge services.',
      keyword: 'Business',
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      badge: 'Corporate Elite',
    },
    {
      title: 'Himalayan Alpine Sanctuary',
      desc: 'Cozy wooden chalets, cedar wood fireplaces, guided snow peak treks, and mountain view decks.',
      keyword: 'Mountain',
      img: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80',
      badge: 'Scenic Getaway',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        className="position-relative text-white py-5 d-flex align-items-center"
        style={{
          minHeight: '88vh',
          background: `linear-gradient(rgba(9, 30, 26, 0.75), rgba(9, 30, 26, 0.88)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat`,
        }}
      >
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge bg-primary text-white px-3 py-2 rounded-pill mb-3 fw-semibold text-uppercase tracking-wider">
                <Sparkles size={14} className="me-1 inline" /> Premier Luxury Hospitality & Suites
              </span>
              <h1 className="display-4 fw-bold lh-sm mb-3">
                Experience Unrivaled Luxury Across India's Finest Destinations.
              </h1>
              <p className="lead text-light opacity-90 mb-4">
                From Goa's beachfront cabanas and Delhi's grand palaces to Jaipur's royal havelis and Manali's alpine peaks, discover handpicked suites crafted for unforgettable stays.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/rooms" className="btn btn-primary btn-lg px-4 rounded-pill fw-semibold shadow">
                  Explore All Suites <ArrowRight size={18} className="ms-1 inline" />
                </Link>
                <Link to="/rooms?search=Goa" className="btn btn-outline-light btn-lg px-4 rounded-pill fw-semibold">
                  🌴 Goa Beachfront
                </Link>
                <Link to="/rooms?search=Jaipur" className="btn btn-outline-warning btn-lg px-4 rounded-pill fw-semibold text-white">
                  👑 Jaipur Palaces
                </Link>
              </div>
            </div>

            {/* Quick Reservation Search Card with Interactive Autocomplete */}
            <div className="col-lg-5">
              <div className="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
                <h4 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                  <Calendar size={22} /> Find Available Rooms & Hotels
                </h4>

                <form onSubmit={handleSearch}>
                  {/* Destination / Hotel Search with Live Suggestions */}
                  <div className="mb-3 position-relative" ref={searchContainerRef}>
                    <label className="form-label small fw-bold text-muted">
                      Destination, Hotel or Amenity
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Search size={16} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 fs-6"
                        placeholder="e.g. Goa, Delhi, Jaipur, Pool, Spa..."
                        value={searchKeyword}
                        onChange={(e) => {
                          setSearchKeyword(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                      />
                      {searchKeyword && (
                        <button
                          type="button"
                          className="btn btn-light border border-start-0 text-muted"
                          onClick={() => setSearchKeyword('')}
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    {/* Auto-Complete Suggestion Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div
                        className="position-absolute start-0 end-0 mt-1 bg-white rounded-3 shadow-lg border overflow-hidden"
                        style={{ zIndex: 1050, maxHeight: '280px', overflowY: 'auto' }}
                      >
                        <div className="p-2 bg-light border-bottom small fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                          Suggested Destinations & Hotels
                        </div>
                        {suggestions.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 px-3 border-bottom d-flex align-items-center justify-content-between hover-bg-light cursor-pointer"
                            style={{ cursor: 'pointer' }}
                            onMouseDown={() => handleSelectSuggestion(item)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {item.type === 'city' ? (
                                <MapPin size={16} className="text-danger flex-shrink-0" />
                              ) : item.type === 'hotel' ? (
                                <Building size={16} className="text-primary flex-shrink-0" />
                              ) : item.type === 'category' ? (
                                <Bed size={16} className="text-success flex-shrink-0" />
                              ) : (
                                <Sparkles size={16} className="text-warning flex-shrink-0" />
                              )}
                              <div>
                                <div className="fw-semibold text-dark small">{item.title}</div>
                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  {item.subtitle}
                                </div>
                              </div>
                            </div>
                            <span className="badge bg-light text-secondary border small text-uppercase" style={{ fontSize: '0.65rem' }}>
                              {item.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Check-In</label>
                      <input
                        type="date"
                        className="form-control fs-6"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Check-Out</label>
                      <input
                        type="date"
                        className="form-control fs-6"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Guests</label>
                      <select
                        className="form-select fs-6"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      >
                        <option value="any">Any Capacity</option>
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4+ Guests</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Room Type</label>
                      <select
                        className="form-select fs-6"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow">
                    <Search size={18} className="me-2 inline" /> Search Available Rooms
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Guarantees Row */}
      <section className="py-4 bg-light border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center gap-2">
                <ShieldCheck size={28} className="text-primary flex-shrink-0" />
                <div className="text-start">
                  <div className="fw-bold small">Best Rate Guarantee</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Direct booking perks</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Clock size={28} className="text-primary flex-shrink-0" />
                <div className="text-start">
                  <div className="fw-bold small">Flexible Cancellation</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Cancel up to 24h before</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Wifi size={28} className="text-primary flex-shrink-0" />
                <div className="text-start">
                  <div className="fw-bold small">Gigabit Wi-Fi</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Complimentary all areas</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Coffee size={28} className="text-primary flex-shrink-0" />
                <div className="text-start">
                  <div className="fw-bold small">Gourmet Breakfast</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Buffet with room bookings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Curated Collections</span>
              <h2 className="fw-bold mb-1">Featured Rooms & Signature Suites</h2>
              <p className="text-muted mb-0">Handpicked accommodations across premier destinations.</p>
            </div>
            <Link to="/rooms" className="btn btn-outline-primary mt-3 mt-md-0 rounded-pill px-4">
              View All Rooms <ArrowRight size={16} className="ms-1 inline" />
            </Link>
          </div>

          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Loading curated suites...</p>
              </div>
            ) : (
              featuredRooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all hover-shadow">
                    <div className="position-relative" style={{ height: '240px' }}>
                      <img
                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                        alt={room.title}
                        className="w-100 h-100 object-fit-cover"
                      />
                      <span className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill">
                        {room.hotel?.address?.city ? `📍 ${room.hotel.address.city}` : `Room #${room.roomNumber}`}
                      </span>
                      {room.discountPercent > 0 && (
                        <span className="position-absolute top-0 end-0 m-3 badge bg-danger px-3 py-2 rounded-pill">
                          {room.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">
                          {room.category?.name || 'Standard'}
                        </span>
                        <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
                          <Star size={16} fill="#f59e0b" />
                          <span>{room.rating || 4.8}</span>
                          <span className="text-muted">({room.numReviews || 0})</span>
                        </div>
                      </div>

                      <h5 className="card-title fw-bold text-dark mb-1">{room.title}</h5>
                      <div className="text-muted small mb-2">
                        {room.hotel?.name || 'HotelPro Luxury'}
                      </div>
                      <p className="card-text text-muted small line-clamp-2 mb-3">
                        {room.description}
                      </p>

                      <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                        <div>
                          <div className="text-muted small">Per Night</div>
                          <span className="fs-5 fw-bold text-primary">
                            ₹{room.pricePerNight?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Link to={`/rooms/${room._id}`} className="btn btn-primary rounded-pill px-3 btn-sm fw-semibold">
                          View & Book
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CLICKABLE 5-STAR FACILITIES SECTION */}
      <section className="py-5 bg-dark text-white">
        <div className="container py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="badge bg-primary text-white px-3 py-2 rounded-pill mb-2 fw-semibold text-uppercase">
              Resort Amenities
            </span>
            <h2 className="fw-bold mb-3">Unparalleled 5-Star Facilities</h2>
            <p className="text-light opacity-75">
              Click any facility below to browse suites and rooms tailored with these bespoke experiences.
            </p>
          </div>

          <div className="row g-4">
            {resortFacilities.map((facility, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div
                  className="card bg-secondary bg-opacity-25 border-0 rounded-4 overflow-hidden h-100 text-white cursor-pointer hover-shadow transition-all"
                  style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}
                  onClick={() => navigate(`/rooms?search=${encodeURIComponent(facility.keyword)}`)}
                >
                  <div className="position-relative" style={{ height: '220px' }}>
                    <img
                      src={facility.img}
                      alt={facility.title}
                      className="w-100 h-100 object-fit-cover"
                    />
                    <span className="position-absolute top-0 end-0 m-3 badge bg-primary px-3 py-2 rounded-pill shadow">
                      {facility.badge}
                    </span>
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <h5 className="fw-bold mb-2 text-white">{facility.title}</h5>
                    <p className="small text-light opacity-75 mb-3">{facility.desc}</p>
                    
                    <div className="mt-auto pt-2">
                      <Link
                        to={`/rooms?search=${encodeURIComponent(facility.keyword)}`}
                        className="btn btn-primary btn-sm rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Explore Suites with {facility.keyword} <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
