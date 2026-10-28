import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import {
  Search,
  Filter,
  Star,
  Users,
  Wifi,
  Tv,
  Coffee,
  CheckCircle,
  Clock,
  RotateCcw,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';

const RoomList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [matchedHotels, setMatchedHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '100000');
  const [capacity, setCapacity] = useState(searchParams.get('capacity') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/hotel/categories');
        const catList = res.data.categories || [];
        setCategories(catList);

        // Map URL category name (e.g. 'Deluxe') to actual category _id
        const paramCat = searchParams.get('category');
        if (paramCat) {
          const matched = catList.find(
            (c) => c._id === paramCat || c.name.toLowerCase() === paramCat.toLowerCase()
          );
          if (matched) {
            setSelectedCategory(matched._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [searchParams]);

  // Live suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await API.get(`/hotel/suggestions?q=${encodeURIComponent(search)}`);
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        // ignore
      }
    };

    const timer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timer);
  }, [search]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch rooms with applied filters
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (capacity) params.append('capacity', capacity);
        if (status) params.append('status', status);
        if (sort) params.append('sort', sort);

        const res = await API.get(`/rooms?${params.toString()}`);
        setRooms(res.data.rooms || []);
        setMatchedHotels(res.data.hotels || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [search, selectedCategory, maxPrice, capacity, status, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMaxPrice('100000');
    setCapacity('');
    setStatus('');
    setSort('');
    setSearchParams({});
  };

  const handleResetFiltersKeepSearch = () => {
    setSelectedCategory('');
    setMaxPrice('100000');
    setCapacity('');
    setStatus('');
  };

  // 10 Premier Indian Destinations & Experiences
  const quickPills = [
    { label: 'All Destinations', query: '' },
    { label: '🌴 Goa', query: 'Goa' },
    { label: '👑 Jaipur', query: 'Jaipur' },
    { label: '🏙️ Mumbai', query: 'Mumbai' },
    { label: '❄️ Manali', query: 'Manali' },
    { label: '🏛️ New Delhi', query: 'New Delhi' },
    { label: '🛶 Udaipur', query: 'Udaipur' },
    { label: '🌿 Kerala', query: 'Kerala' },
    { label: '🛕 Varanasi', query: 'Varanasi' },
    { label: '🌸 Bengaluru', query: 'Bengaluru' },
    { label: '🌲 Shimla', query: 'Shimla' },
    { label: '🏊 Pool Suites', query: 'Pool' },
    { label: '💆 Spa Retreats', query: 'Spa' },
  ];

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        {/* Header Title */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Explore Available Rooms & Luxury Suites</h2>
          <p className="text-muted mb-3">
            Find the perfect accommodation tailored with modern amenities across 10 premier Indian destinations.
          </p>

          {/* Quick Destination & Experience Filter Pills */}
          <div className="d-flex flex-wrap gap-2">
            {quickPills.map((pill, idx) => {
              const isActive =
                (!pill.query && !search) ||
                (pill.query && search.toLowerCase().includes(pill.query.toLowerCase()));
              return (
                <button
                  key={idx}
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                    isActive ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => {
                    if (!pill.query) {
                      handleResetFilters();
                    } else {
                      setSearch(pill.query);
                    }
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Filter size={18} className="text-primary" /> Filters
                </h5>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center gap-1 text-muted"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              {/* Keyword Search with Suggestions */}
              <div className="mb-3 position-relative" ref={searchRef}>
                <label className="form-label small fw-bold text-muted">Destination / Keyword</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={16} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search city, hotel, pool..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {search && (
                    <button
                      className="btn btn-white border border-start-0 text-muted"
                      type="button"
                      onClick={() => setSearch('')}
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="position-absolute start-0 end-0 mt-1 bg-white rounded-3 shadow-lg border overflow-hidden"
                    style={{ zIndex: 1050, maxHeight: '240px', overflowY: 'auto' }}
                  >
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 px-3 border-bottom d-flex align-items-center justify-content-between hover-bg-light cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onMouseDown={() => {
                          setSearch(item.query);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {item.type === 'city' ? (
                            <MapPin size={15} className="text-danger flex-shrink-0" />
                          ) : item.type === 'hotel' ? (
                            <Building size={15} className="text-primary flex-shrink-0" />
                          ) : (
                            <Sparkles size={15} className="text-warning flex-shrink-0" />
                          )}
                          <div>
                            <div className="small fw-semibold">{item.title}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Room Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Price Slider */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-muted mb-0">Max Budget</label>
                  <span className="small fw-bold text-primary">₹{Number(maxPrice).toLocaleString('en-IN')}{Number(maxPrice) >= 100000 ? '+' : ''}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="2000"
                  max="25000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {/* Capacity Filter */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Min Guests Capacity</label>
                <select
                  className="form-select"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                >
                  <option value="">Any Capacity</option>
                  <option value="1">1+ Guest</option>
                  <option value="2">2+ Guests</option>
                  <option value="3">3+ Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* Availability Status */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Availability</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available Only</option>
                  <option value="booked">Booked</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="form-label small fw-bold text-muted">Sort By</label>
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="">Default (Room Number)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Guest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content: Matched Hotels & Room Listings */}
          <div className="col-lg-9">
            {/* 1. MATCHED HOTELS SECTION */}
            {matchedHotels.length > 0 && (
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Building size={20} className="text-primary" />
                  <h5 className="fw-bold mb-0">
                    Hotels & Resorts in {search ? `"${search}"` : 'Selected Destination'} ({matchedHotels.length})
                  </h5>
                </div>
                <div className="row g-3">
                  {matchedHotels.map((hotel) => (
                    <div key={hotel._id} className="col-12">
                      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3 hover-shadow transition-all">
                        <div className="row g-3 align-items-center">
                          <div className="col-md-4">
                            <img
                              src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                              alt={hotel.name}
                              className="rounded-3 w-100 object-fit-cover shadow-sm"
                              style={{ height: '170px' }}
                            />
                          </div>
                          <div className="col-md-8">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <div>
                                <span className="badge bg-primary-subtle text-primary mb-1">
                                  📍 {hotel.address?.city}, {hotel.address?.state}
                                </span>
                                <h5 className="fw-bold mb-1 text-dark">{hotel.name}</h5>
                                <div className="text-muted small mb-2">
                                  {hotel.address?.street}
                                </div>
                              </div>
                              <div className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold">
                                ★ {hotel.rating} ({hotel.totalReviews || 45}+ reviews)
                              </div>
                            </div>
                            <p className="small text-muted mb-2 line-clamp-2">{hotel.description}</p>
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {hotel.amenities?.slice(0, 5).map((a, i) => (
                                <span key={i} className="badge bg-light text-secondary border small">
                                  {a}
                                </span>
                              ))}
                            </div>
                            <div className="small text-secondary d-flex gap-3">
                              <span>📞 {hotel.phone}</span>
                              <span>✉️ {hotel.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MATCHED ROOMS & SUITES SECTION */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                Available Rooms & Suites ({rooms.length})
              </h5>
              {search && (
                <span className="badge bg-light text-secondary border px-3 py-1">
                  Filtering for: "{search}"
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Fetching room accommodations...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <h5 className="fw-bold mb-2">No rooms matched your strict filters</h5>
                <p className="text-muted mb-3">
                  {matchedHotels.length > 0
                    ? `We found ${matchedHotels.length} resort(s) in this destination, but your active budget (₹${Number(maxPrice).toLocaleString('en-IN')}) or capacity filter filtered out specific rooms.`
                    : `We couldn't find any rooms matching "${search || 'your active filters'}".`}
                </p>
                <div className="d-flex justify-content-center gap-2">
                  {matchedHotels.length > 0 && (
                    <button
                      onClick={handleResetFiltersKeepSearch}
                      className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold"
                    >
                      Show All Rooms in {search}
                    </button>
                  )}
                  <button onClick={handleResetFilters} className="btn btn-outline-secondary btn-sm rounded-pill px-4">
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {rooms.map((room) => (
                  <div key={room._id} className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column bg-white hover-shadow transition-all">
                      <div className="position-relative" style={{ height: '220px' }}>
                        <img
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                          alt={room.title}
                          className="w-100 h-100 object-fit-cover"
                        />
                        <span className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 text-white px-3 py-1 rounded-pill">
                          {room.hotel?.address?.city ? `📍 ${room.hotel.address.city}` : `Room #${room.roomNumber}`}
                        </span>

                        <span
                          className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-1 ${
                            room.status === 'available'
                              ? 'bg-success'
                              : room.status === 'booked'
                              ? 'bg-warning text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {room.status?.toUpperCase()}
                        </span>
                      </div>

                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">
                            {room.category?.name || 'Standard'}
                          </span>
                          <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
                            <Star size={15} fill="#f59e0b" />
                            <span>{room.rating || 4.8}</span>
                            <span className="text-muted">({room.numReviews || 0})</span>
                          </div>
                        </div>

                        <h5 className="card-title fw-bold text-dark mb-1">{room.title}</h5>

                        {/* Hotel Name & Destination Badge */}
                        <div className="text-muted small fw-medium mb-2 d-flex align-items-center gap-1">
                          <MapPin size={14} className="text-danger flex-shrink-0" />
                          <span>
                            {room.hotel?.name || 'HotelPro'} &bull; {room.hotel?.address?.city || 'India'}
                          </span>
                        </div>

                        <p className="card-text text-muted small line-clamp-2 mb-3">
                          {room.description}
                        </p>

                        <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                          <div className="d-flex align-items-center gap-1">
                            <Users size={15} className="text-primary" /> Up to {room.capacity} Guests
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Wifi size={15} className="text-primary" /> Free Wi-Fi
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                          <div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>Per Night</div>
                            <span className="fs-5 fw-bold text-primary">
                              ₹{room.pricePerNight?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <Link
                            to={`/rooms/${room._id}`}
                            className="btn btn-primary rounded-pill px-3 btn-sm fw-semibold"
                          >
                            Reserve Room
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
