import React, { useState } from 'react';
import type { UpiProfile } from '../types';
import { DEMO_PROFILE } from '../utils/storage';

interface Props {
  onComplete: (profile: UpiProfile) => void;
}

export const OnboardingModal: React.FC<Props> = ({ onComplete }) => {
  const [mode, setMode] = useState<'welcome' | 'form'>('welcome');
  const [storeName, setStoreName] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [primaryUpiId, setPrimaryUpiId] = useState('');
  const [splitThreshold, setSplitThreshold] = useState('1999');
  const [pin, setPin] = useState('');

  const handleStartDemo = () => {
    onComplete(DEMO_PROFILE);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !primaryUpiId.trim()) return;

    const newProfile: UpiProfile = {
      id: `store_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      storeName: storeName.trim(),
      payeeName: payeeName.trim() || storeName.trim(),
      primaryUpiId: primaryUpiId.trim(),
      splitThreshold: Math.max(100, Number(splitThreshold) || 1999),
      splitStrategy: 'max',
      multiAccountMode: false,
      soundEnabled: true,
      hapticsEnabled: true,
      pin: pin.trim(),
      createdAt: new Date().toISOString(),
    };

    onComplete(newProfile);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/icon-192.png" alt="SplitQR" style={{ width: 28, height: 28, borderRadius: 6 }} />
            <h2 style={{ fontSize: '1.15rem' }}>Welcome to SplitQR</h2>
          </div>
        </div>

        {mode === 'welcome' ? (
          <div className="modal-body" style={{ textAlign: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2.4rem' }}>⚡</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                Zero-MDR Smart UPI Splitter
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.5 }}>
                Automatically splits transactions over ₹2,000 into compliant sub-threshold UPI QR codes.
                No API keys, no gateway commissions, and 100% offline.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '14px', fontSize: '1rem' }}
                onClick={() => setMode('form')}
              >
                🏪 Set Up My Store (30 secs)
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '12px' }}
                onClick={handleStartDemo}
              >
                ⚡ Try Instant Demo Mode
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateStore}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Store / Shop Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Sweets & Chaat"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payee Name (Shown to customer) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Sharma"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary UPI ID (VPA) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9876543210@paytm or sharma@okaxis"
                  value={primaryUpiId}
                  onChange={(e) => setPrimaryUpiId(e.target.value)}
                  required
                />
                <span className="form-helper">
                  Zero gateway fees. Customers pay directly to this UPI address.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Split Threshold (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={splitThreshold}
                  onChange={(e) => setSplitThreshold(e.target.value)}
                  min="100"
                  max="10000"
                />
                <span className="form-helper">Default: ₹1,999 (Amounts above this auto-split).</span>
              </div>

              <div className="form-group">
                <label className="form-label">Optional 4-Digit Cashier PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  placeholder="Leave blank for no lock"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn-secondary" onClick={() => setMode('welcome')}>
                ← Back
              </button>
              <button type="submit" className="btn-primary">
                Create & Launch Store 🚀
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
