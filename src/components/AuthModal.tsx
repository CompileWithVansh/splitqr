import React, { useState } from 'react';

interface Props {
  expectedPin: string;
  onSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ expectedPin, onSuccess }) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const handleDigit = (digit: string) => {
    setError('');
    if (pinInput.length >= 4) return;
    const next = pinInput + digit;
    setPinInput(next);

    if (next.length === 4) {
      if (next === expectedPin) {
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
        setTimeout(() => setPinInput(''), 400);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(pinInput.slice(0, -1));
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '340px', textAlign: 'center' }}>
        <div className="modal-body" style={{ alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '2.4rem' }}>🔒</div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cashier PIN Required</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
              Enter your 4-digit security PIN to unlock SplitQR
            </p>
          </div>

          {/* Dots representation */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', margin: '8px 0' }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: i < pinInput.length ? '#10b981' : 'rgba(255,255,255,0.15)',
                  boxShadow: i < pinInput.length ? '0 0 10px #10b981' : 'none',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Mini Numeric Keypad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                className="keypad-btn"
                style={{ height: '52px', fontSize: '1.3rem' }}
                onClick={() => handleDigit(d)}
              >
                {d}
              </button>
            ))}
            <div />
            <button
              type="button"
              className="keypad-btn"
              style={{ height: '52px', fontSize: '1.3rem' }}
              onClick={() => handleDigit('0')}
            >
              0
            </button>
            <button
              type="button"
              className="keypad-btn action-btn"
              style={{ height: '52px', fontSize: '1.1rem' }}
              onClick={handleBackspace}
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
