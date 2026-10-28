import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-center py-5">
      <div className="container">
        <div className="bg-primary text-white p-3 rounded-circle d-inline-flex mb-3 shadow">
          <Hotel size={36} />
        </div>
        <h1 className="display-1 fw-bold text-primary mb-2">404</h1>
        <h3 className="fw-bold mb-3">Page Not Found</h3>
        <p className="text-muted max-w-md mx-auto mb-4">
          The hospitality page or resource you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary rounded-pill px-4 fw-semibold">
          <Home size={16} className="me-1 inline" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
