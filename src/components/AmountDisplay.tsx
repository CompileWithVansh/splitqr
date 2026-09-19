import React from 'react';
import { computeSplitAmounts } from '../utils/splitEngine';
import type { UpiProfile } from '../types';

interface Props {
  amountStr: string;
  profile: UpiProfile;
  onClear?: () => void;
}

export const AmountDisplay: React.FC<Props> = ({ amountStr, profile, onClear }) => {
  const numAmount = parseFloat(amountStr) || 0;
  const hasValue = numAmount > 0;

  // Memoize preview chunks so random mode stays stable while typing note
  const chunks = React.useMemo(() => {
    return hasValue
      ? computeSplitAmounts(numAmount, profile.splitThreshold, profile.splitStrategy)
      : [];
  }, [numAmount, profile.splitThreshold, profile.splitStrategy]);
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
      <div className="amount-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>Billing Amount</span>
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>
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
              <span>
                {profile.splitStrategy === 'random' ? '🎲 Anti-Trace' : '⚡'}{' '}
                Split into <strong>{chunks.length} QR Codes</strong>
              </span>
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
