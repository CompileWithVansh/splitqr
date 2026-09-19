import React, { useState } from 'react';
import type { UpiProfile } from '../types';

interface Props {
  profile: UpiProfile;
  onSave: (updated: UpiProfile) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ profile, onSave, onClose }) => {
  const [storeName, setStoreName] = useState(profile.storeName);
  const [payeeName, setPayeeName] = useState(profile.payeeName);
  const [primaryUpiId, setPrimaryUpiId] = useState(profile.primaryUpiId);
  const [secondaryUpiId, setSecondaryUpiId] = useState(profile.secondaryUpiId || '');
  const [splitThreshold, setSplitThreshold] = useState(String(profile.splitThreshold));
  const [splitStrategy, setSplitStrategy] = useState<'max' | 'balanced'>(profile.splitStrategy || 'max');
  const [multiAccountMode, setMultiAccountMode] = useState(profile.multiAccountMode || false);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState(profile.hapticsEnabled);
  const [pin, setPin] = useState(profile.pin || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdNum = Math.max(100, Math.min(10000, Number(splitThreshold) || 1999));

    onSave({
      ...profile,
      storeName: storeName.trim() || 'My Store',
      payeeName: payeeName.trim() || 'Cashier',
      primaryUpiId: primaryUpiId.trim() || 'merchant@upi',
      secondaryUpiId: secondaryUpiId.trim(),
      splitThreshold: thresholdNum,
      splitStrategy,
      multiAccountMode: multiAccountMode && Boolean(secondaryUpiId.trim()),
      soundEnabled,
      hapticsEnabled,
      pin: pin.trim(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Store & Split Settings</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Store / Business Name</label>
              <input
                type="text"
                className="form-input"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Ramesh Sweets & Cafe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payee Name (displayed on UPI QR)</label>
              <input
                type="text"
                className="form-input"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary UPI ID (VPA)</label>
              <input
                type="text"
                className="form-input"
                value={primaryUpiId}
                onChange={(e) => setPrimaryUpiId(e.target.value)}
                placeholder="e.g. ramesh@okaxis or 9876543210@paytm"
                required
              />
              <span className="form-helper">Zero gateway fees. Scans directly in PhonePe, GPay, Paytm, BHIM.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Secondary UPI ID (Optional Multi-Account)</label>
              <input
                type="text"
                className="form-input"
                value={secondaryUpiId}
                onChange={(e) => setSecondaryUpiId(e.target.value)}
                placeholder="e.g. alternate@icici"
              />
            </div>

            {secondaryUpiId && (
              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={multiAccountMode}
                    onChange={(e) => setMultiAccountMode(e.target.checked)}
                  />
                  <span>Alternate split chunks between Primary & Secondary UPI</span>
                </label>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">MDR Split Threshold (₹)</label>
              <input
                type="number"
                className="form-input"
                value={splitThreshold}
                onChange={(e) => setSplitThreshold(e.target.value)}
                min="100"
                max="10000"
                required
              />
              <span className="form-helper">
                Default: ₹1,999 (Amounts above this will auto-split to avoid interchange fees).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Splitting Algorithm Strategy</label>
              <select
                className="form-select"
                value={splitStrategy}
                onChange={(e) => setSplitStrategy(e.target.value as any)}
              >
                <option value="max">Greedy Max Chunks (₹1,999s + remainder)</option>
                <option value="balanced">Balanced Equal Splits (Clean round amounts under limit)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span>Audio Cues (Keypad clicks & paid confirmation chimes)</span>
              </label>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={hapticsEnabled}
                  onChange={(e) => setHapticsEnabled(e.target.checked)}
                />
                <span>Haptic Vibration (Mobile tactile feedback)</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Security PIN (Optional Cashier Lock)</label>
              <input
                type="password"
                maxLength={4}
                className="form-input"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN (leave blank for no lock)"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
