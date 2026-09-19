import React from 'react';
import type { QrChunk } from '../types';

interface Props {
  chunks: QrChunk[];
  totalAmount: number;
  onNewBill: () => void;
}

export const SettlementProgress: React.FC<Props> = ({
  chunks,
  totalAmount,
  onNewBill,
}) => {
  const paidChunks = chunks.filter((c) => c.status === 'paid');
  const paidAmount = paidChunks.reduce((sum, c) => sum + c.amount, 0);
  const paidCount = paidChunks.length;
  const totalCount = chunks.length;

  const percent = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  const isAllPaid = totalCount > 0 && paidCount === totalCount;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="settlement-progress-card">
        <div className="progress-header">
          <span>
            Paid: <strong>₹{paidAmount.toLocaleString('en-IN')}</strong> of ₹{totalAmount.toLocaleString('en-IN')}
          </span>
          <span style={{ color: isAllPaid ? '#34d399' : '#94a3b8' }}>
            {paidCount} of {totalCount} Settled ({percent}%)
          </span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {isAllPaid && (
        <div className="all-paid-banner">
          <h3>🎉 All Splits Successfully Paid!</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '380px' }}>
            Full ₹{totalAmount.toLocaleString('en-IN')} collected without MDR charges.
          </p>
          <button type="button" className="new-bill-btn" onClick={onNewBill}>
            + Start New Bill
          </button>
        </div>
      )}
    </div>
  );
};
