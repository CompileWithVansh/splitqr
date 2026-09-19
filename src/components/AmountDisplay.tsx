import React from 'react';
import { computeSplitAmounts } from '../utils/splitEngine';
import type { UpiProfile } from '../types';

interface Props {
  amountStr: string;
  profile: UpiProfile;
}

export const AmountDisplay: React.FC<Props> = ({ amountStr, profile }) => {
  const numAmount = parseFloat(amountStr) || 0;
  const hasValue = numAmount > 0;

  // Compute split preview
  const chunks = hasValue
    ? computeSplitAmounts(numAmount, profile.splitThreshold, profile.splitStrategy)
    : [];
  const isSplit = chunks.length > 1;

  // Format with Indian numbering system
  const formattedDisplay = hasValue
    ? numAmount.toLocaleString('en-IN', {
        minimumFractionDigits: amountStr.includes('.') ? (amountStr.split('.')[1]?.length || 0) : 0,
        maximumFractionDigits: 2,
      })
    : '0';

  return (
    <div className="amount-display-card">
      <div className="amount-label">Billing Amount</div>
      <div className="amount-value-row">
        <span className="rupee-symbol">₹</span>
        <span className={`amount-text ${!hasValue ? 'empty' : ''}`}>
          {formattedDisplay}
        </span>
      </div>

      {hasValue && (
        <div className={`split-indicator-pill ${isSplit ? 'split' : 'normal'}`}>
          {isSplit ? (
            <>
              <span>⚡ Split into <strong>{chunks.length} QR Codes</strong></span>
              <span>•</span>
              <span>
                {chunks.map((c) => `₹${c.toLocaleString('en-IN')}`).join(' + ')}
              </span>
              <span>•</span>
              <span style={{ color: '#34d399' }}>0% MDR Compliant</span>
            </>
          ) : (
            <>
              <span>✅ Single QR Code</span>
              <span>•</span>
              <span>Under ₹{profile.splitThreshold.toLocaleString('en-IN')} Cap</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
