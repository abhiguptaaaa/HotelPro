import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Printer, X, CheckCircle, Hotel } from 'lucide-react';

const InvoiceModal = ({ bookingId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/payments/invoice/${bookingId}`);
        setInvoice(res.data.invoice);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchInvoice();
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <Hotel size={20} className="text-primary" />
              HotelPro Official Booking Receipt
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4" id="printable-invoice">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted small">Generating official invoice...</p>
              </div>
            ) : invoice ? (
              <div>
                {/* Header info */}
                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                  <div>
                    <h4 className="fw-bold text-primary mb-1">{invoice.hotel?.name || 'HotelPro Grand Palace'}</h4>
                    <p className="text-muted small mb-0">
                      {invoice.hotel?.address?.street}, {invoice.hotel?.address?.city}
                    </p>
                    <p className="text-muted small mb-0">
                      Phone: {invoice.hotel?.phone} | Email: {invoice.hotel?.email}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success-subtle text-success border border-success px-3 py-1 mb-2">
                      <CheckCircle size={14} className="me-1 inline" /> PAID & CONFIRMED
                    </span>
                    <div className="small fw-bold">Invoice #: {invoice.invoiceNumber}</div>
                    <div className="small text-muted">
                      Date: {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Guest & Reservation Details */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <h6 className="fw-bold text-muted small text-uppercase mb-2">Billed To (Guest)</h6>
                    <div className="fw-bold fs-6">{invoice.customer?.name}</div>
                    <div className="small text-muted">{invoice.customer?.email}</div>
                    <div className="small text-muted">{invoice.customer?.phone}</div>
                  </div>
                  <div className="col-sm-6">
                    <h6 className="fw-bold text-muted small text-uppercase mb-2">Reservation Info</h6>
                    <div className="small"><strong>Booking Ref:</strong> {invoice.booking?.bookingNumber}</div>
                    <div className="small"><strong>Room:</strong> #{invoice.booking?.roomNumber} - {invoice.booking?.roomTitle}</div>
                    <div className="small"><strong>Check-In:</strong> {new Date(invoice.booking?.checkIn).toLocaleDateString()}</div>
                    <div className="small"><strong>Check-Out:</strong> {new Date(invoice.booking?.checkOut).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Item Description</th>
                        <th className="text-center">Nights</th>
                        <th className="text-end">Rate / Night</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>{invoice.booking?.roomTitle}</strong>
                          <div className="small text-muted">Category: {invoice.booking?.category}</div>
                        </td>
                        <td className="text-center">{invoice.booking?.totalNights}</td>
                        <td className="text-end">₹{invoice.booking?.pricePerNight?.toLocaleString('en-IN')}</td>
                        <td className="text-end">₹{invoice.charges?.roomCharges?.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end">Subtotal</td>
                        <td className="text-end">₹{invoice.charges?.roomCharges?.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end">Standard Hospitality GST (12%)</td>
                        <td className="text-end">₹{invoice.charges?.taxAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="table-primary fw-bold fs-6">
                        <td colSpan="3" className="text-end">Total Paid</td>
                        <td className="text-end text-primary">₹{invoice.charges?.totalAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment transaction details */}
                <div className="bg-light p-3 rounded small d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Payment Method:</strong> {invoice.payment?.method?.toUpperCase()}
                  </div>
                  <div>
                    <strong>Transaction ID:</strong> <span className="text-muted font-monospace">{invoice.payment?.transactionId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-danger text-center">Unable to load invoice data.</p>
            )}
          </div>

          <div className="modal-footer border-0 bg-light">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
