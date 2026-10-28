import React, { useState } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Star, X } from 'lucide-react';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      toast.warning('Please enter a review headline and comment.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/reviews', {
        roomId: booking.room?._id || booking.room,
        bookingId: booking._id,
        rating,
        title,
        comment,
      });
      toast.success('Thank you! Your review has been submitted.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
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
            <h5 className="modal-title">Write a Guest Review</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3 text-center">
                <label className="form-label d-block text-muted small fw-semibold text-uppercase">
                  Your Overall Rating
                </label>
                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="btn p-0 border-0"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={32}
                        className={
                          (hoverRating || rating) >= star
                            ? 'text-warning fill-warning'
                            : 'text-muted'
                        }
                        fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                <div className="small text-muted mt-1 fw-bold">
                  {rating === 5 ? 'Excellent & Luxurious' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Headline / Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Exceptional stay, superb hospitality and views!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Your Detailed Review</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell other travelers about your stay, room cleanliness, staff friendliness, and dining..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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
                className="btn btn-primary btn-sm px-4"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
