import React, { useState } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { ConciergeBell, X } from 'lucide-react';

const ServiceModal = ({ booking, onClose, onSuccess }) => {
  const [type, setType] = useState('Room Service');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.warning('Please specify your request details.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/services', {
        bookingId: booking._id,
        type,
        description,
        priority,
      });
      toast.success('Service request submitted! Staff will attend to it shortly.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <ConciergeBell size={20} className="text-warning" />
              Request Hotel Guest Service
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="bg-light p-3 rounded mb-3 small">
                <strong>Room:</strong> #{booking.room?.roomNumber || 'Assigned Room'} |{' '}
                <strong>Booking:</strong> {booking.bookingNumber}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Service Category</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Room Service">Room Service & In-Room Dining</option>
                  <option value="Housekeeping">Housekeeping & Linen Change</option>
                  <option value="Maintenance">Maintenance & Technical Assistance</option>
                  <option value="Laundry">Laundry & Dry Cleaning</option>
                  <option value="Luggage Assistance">Luggage & Bellhop Assistance</option>
                  <option value="Concierge">Concierge & Travel Planning</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Priority Level</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low (Whenever convenient today)</option>
                  <option value="medium">Medium (Within the next hour)</option>
                  <option value="high">High (Prompt attention needed)</option>
                  <option value="urgent">Urgent (Immediate attention required)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Request Details</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Please send extra bath towels, or 2 cups of hot herbal tea and water..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-0 bg-light">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-warning btn-sm px-4 fw-semibold text-dark"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Dispatch Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
