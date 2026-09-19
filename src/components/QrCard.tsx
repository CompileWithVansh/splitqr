import React, { useState } from 'react';
import type { QrChunk } from '../types';

interface Props {
  chunk: QrChunk;
  onTogglePaid: (chunkId: string) => void;
  hideIfPaid: boolean;
  isActiveFocus?: boolean;
}

export const QrCard: React.FC<Props> = ({
  chunk,
  onTogglePaid,
  hideIfPaid,
  isActiveFocus,
}) => {
  const [copied, setCopied] = useState(false);

  if (hideIfPaid && chunk.status === 'paid') {
    return null;
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(chunk.upiUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = `SplitQR Payment Request (Part ${chunk.partNumber} of ${chunk.totalParts}):\nAmount: ₹${chunk.amount.toLocaleString('en-IN')}\nUPI Link: ${chunk.upiUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      className={`qr-card ${chunk.status === 'paid' ? 'paid' : ''} ${
        isActiveFocus ? 'active-focus' : ''
      }`}
    >
      {/* Header */}
      <div className="qr-card-header">
        <span className={`qr-part-badge ${chunk.totalParts > 1 ? 'highlight' : ''}`}>
          Part {chunk.partNumber} of {chunk.totalParts}
        </span>
        <span className={`qr-status-tag ${chunk.status}`}>
          {chunk.status === 'paid' ? 'Paid ✅' : 'Awaiting Payment'}
        </span>
      </div>

      {/* Amount */}
      <div className="qr-amount-row">
        <span className="qr-rupee">₹</span>
        <span className="qr-amount">{chunk.amount.toLocaleString('en-IN')}</span>
      </div>

      {/* Scannable QR Code */}
      <div className="qr-frame">
        {chunk.qrDataUrl ? (
          <img
            src={chunk.qrDataUrl}
            alt={`UPI QR Part ${chunk.partNumber} for ₹${chunk.amount}`}
            className="qr-image"
          />
        ) : (
          <div style={{ width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Generating QR...
          </div>
        )}

        {/* Full overlay when paid */}
        {chunk.status === 'paid' && (
          <div className="qr-paid-overlay">
            <span className="check-icon">✓</span>
            <span className="paid-label">Paid</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              ₹{chunk.amount.toLocaleString('en-IN')} Settled
            </span>
          </div>
        )}
      </div>

      {/* Payee Details */}
      <div className="qr-payee-info">
        <div>Pay to: <strong>{chunk.payeeName}</strong></div>
        <div style={{ opacity: 0.8 }}>{chunk.upiId}</div>
      </div>

      {/* Card Actions */}
      <div className="qr-card-actions">
        <button
          type="button"
          className={`mark-paid-btn ${chunk.status}`}
          onClick={() => onTogglePaid(chunk.id)}
        >
          {chunk.status === 'paid' ? '✓ Paid (Click to Undo)' : 'Mark as Paid'}
        </button>

        <div className="qr-secondary-actions">
          <button type="button" className="sub-action-btn" onClick={handleCopyLink}>
            {copied ? '✓ Copied' : '🔗 Copy Link'}
          </button>
          <button type="button" className="sub-action-btn" onClick={handleShareWhatsApp}>
            📲 WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
