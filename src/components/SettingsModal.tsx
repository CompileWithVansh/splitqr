import React, { useState } from 'react';
import type { UpiProfile } from '../types';

interface Props {
  profile: UpiProfile;
  onSave: (updated: UpiProfile) => void;
  onLogoutAndClear?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ profile, onSave, onLogoutAndClear, onClose }) => {
  const [activeTab, setActiveTab] = useState<'split' | 'store' | 'security'>('split');
  const [storeName, setStoreName] = useState(profile.storeName);
  const [payeeName, setPayeeName] = useState(profile.payeeName);
  const [primaryUpiId, setPrimaryUpiId] = useState(profile.primaryUpiId);
  const [secondaryUpiId, setSecondaryUpiId] = useState(profile.secondaryUpiId || '');
  const [splitThreshold, setSplitThreshold] = useState(String(profile.splitThreshold));
  const [splitStrategy, setSplitStrategy] = useState<'max' | 'balanced' | 'random'>(
    profile.splitStrategy || 'random'
  );
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
      <div className="modal-card settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="settings-header-title">
            <span className="settings-icon-badge">⚙️</span>
            <div>
              <h2>Store & Split Settings</h2>
              <p className="settings-subtitle">Manage UPI VPAs, anti-tracing rules & POS preferences</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close Settings">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs-nav">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'split' ? 'active' : ''}`}
            onClick={() => setActiveTab('split')}
          >
            <span>⚡</span>
            <span>MDR & Splitting</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <span>🏪</span>
            <span>Store & UPI</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span>🛡️</span>
            <span>Sound & Lock</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="settings-form">
          <div className="modal-body settings-modal-body">
            {/* TAB 1: MDR & SPLITTING STRATEGY */}
            {activeTab === 'split' && (
              <div className="settings-section">
                {/* Threshold Section */}
                <div className="form-group">
                  <div className="label-with-badge">
                    <label className="form-label">MDR Split Threshold (₹)</label>
                    <span className="badge-highlight">Default: ₹1,999</span>
                  </div>
                  <input
                    type="number"
                    className="form-input font-mono-bold"
                    value={splitThreshold}
                    onChange={(e) => setSplitThreshold(e.target.value)}
                    min="100"
                    max="10000"
                    required
                  />

                  {/* Quick-Pick Chips */}
                  <div className="quick-chips-row">
                    <button
                      type="button"
                      className={`chip-btn ${splitThreshold === '1999' ? 'active' : ''}`}
                      onClick={() => setSplitThreshold('1999')}
                    >
                      ₹1,999 (Standard)
                    </button>
                    <button
                      type="button"
                      className={`chip-btn ${splitThreshold === '1950' ? 'active' : ''}`}
                      onClick={() => setSplitThreshold('1950')}
                    >
                      ₹1,950 (Safe Buffer)
                    </button>
                    <button
                      type="button"
                      className={`chip-btn ${splitThreshold === '1900' ? 'active' : ''}`}
                      onClick={() => setSplitThreshold('1900')}
                    >
                      ₹1,900
                    </button>
                  </div>
                  <span className="form-helper">
                    Bills exceeding this cap will automatically split into compliant sub-threshold QR codes.
                  </span>
                </div>

                {/* Splitting Algorithm Cards */}
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px' }}>
                    Splitting Algorithm Strategy
                  </label>

                  <div className="strategy-cards-grid">
                    {/* Strategy 1: Random Natural Split */}
                    <div
                      className={`strategy-card ${splitStrategy === 'random' ? 'active' : ''}`}
                      onClick={() => setSplitStrategy('random')}
                    >
                      <div className="strategy-card-header">
                        <div className="strategy-radio">
                          <div className={`radio-circle ${splitStrategy === 'random' ? 'checked' : ''}`} />
                        </div>
                        <div className="strategy-title-group">
                          <div className="strategy-title">
                            <span>🎲 Random Natural Split</span>
                            <span className="pill-recommended">Anti-Tracing</span>
                          </div>
                          <div className="strategy-example">
                            e.g. ₹2,500 ➔ <strong>₹1,747</strong> + <strong>₹753</strong>
                          </div>
                        </div>
                      </div>
                      <p className="strategy-desc">
                        Generates organic random numbers under threshold. Prevents predictable ₹1,999 or 50/50 patterns from being traced or fingerprinted by banks.
                      </p>
                    </div>

                    {/* Strategy 2: Greedy Max Chunks */}
                    <div
                      className={`strategy-card ${splitStrategy === 'max' ? 'active' : ''}`}
                      onClick={() => setSplitStrategy('max')}
                    >
                      <div className="strategy-card-header">
                        <div className="strategy-radio">
                          <div className={`radio-circle ${splitStrategy === 'max' ? 'checked' : ''}`} />
                        </div>
                        <div className="strategy-title-group">
                          <div className="strategy-title">
                            <span>⚡ Greedy Max Chunks</span>
                          </div>
                          <div className="strategy-example">
                            e.g. ₹2,500 ➔ <strong>₹1,999</strong> + <strong>₹501</strong>
                          </div>
                        </div>
                      </div>
                      <p className="strategy-desc">
                        Maximizes initial QR chunks right up to the threshold limit, leaving remainder in the final code.
                      </p>
                    </div>

                    {/* Strategy 3: Balanced Equal Split */}
                    <div
                      className={`strategy-card ${splitStrategy === 'balanced' ? 'active' : ''}`}
                      onClick={() => setSplitStrategy('balanced')}
                    >
                      <div className="strategy-card-header">
                        <div className="strategy-radio">
                          <div className={`radio-circle ${splitStrategy === 'balanced' ? 'checked' : ''}`} />
                        </div>
                        <div className="strategy-title-group">
                          <div className="strategy-title">
                            <span>⚖️ Balanced Equal Split</span>
                          </div>
                          <div className="strategy-example">
                            e.g. ₹2,500 ➔ <strong>₹1,250</strong> + <strong>₹1,250</strong>
                          </div>
                        </div>
                      </div>
                      <p className="strategy-desc">
                        Divides the bill into equal fractional amounts so every generated QR code is identical.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STORE & UPI */}
            {activeTab === 'store' && (
              <div className="settings-section">
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
                  <span className="form-helper">Displayed in the header and terminal switcher.</span>
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
                  <span className="form-helper">Name shown to customer on PhonePe, GPay, Paytm screen.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary UPI ID (VPA)</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={primaryUpiId}
                    onChange={(e) => setPrimaryUpiId(e.target.value)}
                    placeholder="e.g. ramesh@okaxis or 9876543210@paytm"
                    required
                  />
                  <div className="upi-badges-row">
                    <span className="upi-badge">✓ PhonePe</span>
                    <span className="upi-badge">✓ Google Pay</span>
                    <span className="upi-badge">✓ Paytm</span>
                    <span className="upi-badge">✓ BHIM</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Secondary UPI ID (Optional Multi-Account)</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={secondaryUpiId}
                    onChange={(e) => setSecondaryUpiId(e.target.value)}
                    placeholder="e.g. alternate@icici"
                  />
                  <span className="form-helper">Use a secondary bank account to distribute payouts.</span>
                </div>

                {secondaryUpiId && (
                  <div className="toggle-row-card">
                    <div>
                      <div className="toggle-title">Alternate Between UPI IDs</div>
                      <div className="toggle-desc">Rotate Part 1, Part 2 across primary and secondary accounts</div>
                    </div>
                    <label className="switch-toggle">
                      <input
                        type="checkbox"
                        checked={multiAccountMode}
                        onChange={(e) => setMultiAccountMode(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SOUND, SECURITY & PRIVACY */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="toggle-row-card">
                  <div>
                    <div className="toggle-title">🔊 Audio Confirmation Cues</div>
                    <div className="toggle-desc">Keypad tactile clicks & paid success chime</div>
                  </div>
                  <label className="switch-toggle">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="toggle-row-card">
                  <div>
                    <div className="toggle-title">📳 Haptic Vibration</div>
                    <div className="toggle-desc">Tactile mobile vibration on keypad entry</div>
                  </div>
                  <label className="switch-toggle">
                    <input
                      type="checkbox"
                      checked={hapticsEnabled}
                      onChange={(e) => setHapticsEnabled(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label className="form-label">Security PIN (Optional Cashier Lock)</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="form-input font-mono"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN (leave empty for no lock)"
                  />
                  <span className="form-helper">When set, locking the terminal requires this 4-digit PIN to unlock.</span>
                </div>

                {/* Device Data Wipe Section */}
                <div className="danger-zone-card">
                  <div>
                    <div className="danger-title">🔒 Shared Device Privacy</div>
                    <div className="danger-desc">
                      Erase all stored credentials, UPI IDs, and transaction history from this browser cache.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() => {
                      if (
                        confirm(
                          'Log out and erase all store details, UPI IDs, and transaction history from this browser? No other user will be able to see your details.'
                        )
                      ) {
                        onLogoutAndClear?.();
                        onClose();
                      }
                    }}
                  >
                    Log Out & Erase Device Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Modal Footer */}
          <div className="modal-footer settings-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              💾 Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
