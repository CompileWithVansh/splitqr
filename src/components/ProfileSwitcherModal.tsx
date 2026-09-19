import React, { useState } from 'react';
import type { UpiProfile } from '../types';
import {
  loadAllProfiles,
  saveOrUpdateProfile,
  deleteProfile,
  exportAllData,
  importAllData,
} from '../utils/storage';

interface Props {
  activeProfile: UpiProfile;
  onSelectProfile: (profile: UpiProfile) => void;
  onLogoutAndClear?: () => void;
  onClose: () => void;
}

export const ProfileSwitcherModal: React.FC<Props> = ({
  activeProfile,
  onSelectProfile,
  onLogoutAndClear,
  onClose,
}) => {
  const [profiles, setProfiles] = useState<UpiProfile[]>(() => loadAllProfiles());
  const [showAddForm, setShowAddForm] = useState(false);

  // New store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPrimaryUpiId, setNewPrimaryUpiId] = useState('');
  const [newSplitThreshold, setNewSplitThreshold] = useState('1999');

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newPrimaryUpiId.trim()) return;

    const newProf: UpiProfile = {
      id: `store_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      storeName: newStoreName.trim(),
      payeeName: newPayeeName.trim() || newStoreName.trim(),
      primaryUpiId: newPrimaryUpiId.trim(),
      splitThreshold: Math.max(100, Number(newSplitThreshold) || 1999),
      splitStrategy: 'max',
      multiAccountMode: false,
      soundEnabled: true,
      hapticsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    saveOrUpdateProfile(newProf);
    setProfiles(loadAllProfiles());
    onSelectProfile(newProf);
    setShowAddForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove store "${name}"?`)) {
      const next = deleteProfile(id);
      if (next) {
        setProfiles(loadAllProfiles());
        onSelectProfile(next);
      }
    }
  };

  const handleExportBackup = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitqr_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAllData(content)) {
        alert('✅ Store backup imported successfully!');
        const updated = loadAllProfiles();
        setProfiles(updated);
        if (updated[0]) onSelectProfile(updated[0]);
      } else {
        alert('❌ Failed to import backup. Please verify file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏪 Store & Account Switcher</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {!showAddForm ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profiles.map((p) => {
                  const isActive = p.id === activeProfile.id;
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isActive ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => {
                        onSelectProfile(p);
                        onClose();
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                          {p.storeName} {isActive && <span style={{ color: '#34d399', fontSize: '0.85rem' }}>(Active)</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          UPI: {p.primaryUpiId} • Cap: ₹{p.splitThreshold.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: 32, height: 32, fontSize: '0.9rem', color: '#f87171' }}
                            title="Remove Store"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id, p.storeName);
                            }}
                          >
                            🗑️
                          </button>
                        )}
                        {isActive ? (
                          <span style={{ fontSize: '1.2rem', color: '#10b981' }}>✓</span>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => setShowAddForm(true)}
              >
                + Add Another Store / Account
              </button>

              {/* Data Backup & Restore Section */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  onClick={handleExportBackup}
                >
                  📥 Export Backup
                </button>

                <label
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 12px', cursor: 'pointer' }}
                >
                  📤 Import Backup
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImportBackup}
                  />
                </label>
              </div>

              {/* Wipe on Shared Computer */}
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.82rem', padding: '10px' }}
                  onClick={() => {
                    if (confirm('Log out and erase all stores, UPI IDs, and billing history from this browser? No one else using this computer will be able to see your details.')) {
                      onLogoutAndClear?.();
                      onClose();
                    }
                  }}
                >
                  🔒 Log Out & Erase All Stores from this Device
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateNew}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">New Store / Account Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Counter 2 or Juice Bar"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payee Name (Shown to customer)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh"
                    value={newPayeeName}
                    onChange={(e) => setNewPayeeName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary UPI ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. juicebar@paytm"
                    value={newPrimaryUpiId}
                    onChange={(e) => setNewPrimaryUpiId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Split Threshold (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newSplitThreshold}
                    onChange={(e) => setNewSplitThreshold(e.target.value)}
                    min="100"
                    max="10000"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Store
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
