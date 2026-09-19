import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UpiProfile, QrChunk, SplitSession, TransactionRecord } from './types';
import {
  getActiveProfile,
  saveOrUpdateProfile,
  setHasCompletedOnboarding,
  loadProfileHistory,
  recordProfileTransaction,
  saveProfileHistory,
  wipeAllStoredData,
  DEMO_PROFILE,
} from './utils/storage';
import { createSplitSessionChunks } from './utils/splitEngine';
import { playPaidChime, playAllPaidSuccessChime } from './utils/sound';

import { AmountDisplay } from './components/AmountDisplay';
import { Keypad } from './components/Keypad';
import { QrCarousel } from './components/QrCarousel';
import { SettlementProgress } from './components/SettlementProgress';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileSwitcherModal } from './components/ProfileSwitcherModal';

export const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<UpiProfile>(() => getActiveProfile());
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [session, setSession] = useState<SplitSession | null>(null);
  const [generating, setGenerating] = useState(false);

  // Modals & Terminal Lock State
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [history, setHistory] = useState<TransactionRecord[]>(() => loadProfileHistory(profile.id));
  const [isUnlocked, setIsUnlocked] = useState(() => !profile.pin);

  // Settlement View Toggles (auto-default to 1-by-1 Focus Mode on mobile screens)
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [hidePaid, setHidePaid] = useState(false);

  // Reload history whenever active profile changes
  useEffect(() => {
    setHistory(loadProfileHistory(profile.id));
    setIsUnlocked(!profile.pin);
  }, [profile.id]);

  // Complete onboarding
  const handleOnboardingComplete = (newProfile: UpiProfile) => {
    saveOrUpdateProfile(newProfile);
    setProfile(newProfile);
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  // Switch store profile
  const handleSelectProfile = (selected: UpiProfile) => {
    setProfile(selected);
    setSession(null);
    setAmountStr('');
    setNote('');
  };

  // Save profile updates
  const handleSaveProfile = (updated: UpiProfile) => {
    setProfile(updated);
    saveOrUpdateProfile(updated);
  };

  // Keyboard support for desktop cashiers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showHistory || showSwitcher || showOnboarding || !isUnlocked) return;

      if (!session) {
        if (/^[0-9]$/.test(e.key)) {
          setAmountStr((prev) => {
            if (prev === '0') return e.key;
            if (prev.includes('.') && (prev.split('.')[1]?.length || 0) >= 2) return prev;
            return prev.length < 8 ? prev + e.key : prev;
          });
        } else if (e.key === '.') {
          setAmountStr((prev) => (prev.includes('.') ? prev : (prev ? prev + '.' : '0.')));
        } else if (e.key === 'Backspace') {
          setAmountStr((prev) => prev.slice(0, -1));
        } else if (e.key === 'Escape') {
          setAmountStr('');
        } else if (e.key === 'Enter') {
          const val = parseFloat(amountStr) || 0;
          if (val > 0) {
            handleGenerateQrs();
          }
        }
      } else {
        if (e.key === 'Escape') {
          setSession(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [amountStr, session, showSettings, showHistory, showSwitcher, showOnboarding, isUnlocked, profile]);

  // Generate Split QRs
  const handleGenerateQrs = async () => {
    const total = parseFloat(amountStr) || 0;
    if (total <= 0) return;

    setGenerating(true);
    try {
      const chunks = await createSplitSessionChunks(total, profile);
      const newSession: SplitSession = {
        id: `sess_${Date.now()}`,
        profileId: profile.id,
        totalAmount: total,
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
        chunks,
        isFullyPaid: false,
      };

      setSession(newSession);

      // Record to store's transaction history
      const newRecord: TransactionRecord = {
        id: newSession.id,
        profileId: profile.id,
        totalAmount: total,
        note: newSession.note,
        splitCount: chunks.length,
        createdAt: newSession.createdAt,
        status: 'partial',
        chunksSummary: chunks.map((c) => ({
          amount: c.amount,
          upiId: c.upiId,
          paid: false,
        })),
      };

      recordProfileTransaction(profile.id, newRecord);
      setHistory(loadProfileHistory(profile.id));
    } finally {
      setGenerating(false);
    }
  };

  // Toggle individual chunk paid state
  const handleTogglePaid = (chunkId: string) => {
    if (!session) return;

    let becamePaid = false;
    const updatedChunks: QrChunk[] = session.chunks.map((c) => {
      if (c.id === chunkId) {
        const nextStatus = c.status === 'paid' ? 'unpaid' : 'paid';
        if (nextStatus === 'paid') becamePaid = true;
        return {
          ...c,
          status: nextStatus,
          paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined,
        };
      }
      return c;
    });

    const isAllPaid = updatedChunks.every((c) => c.status === 'paid');

    if (becamePaid) {
      if (profile.soundEnabled) {
        if (isAllPaid) {
          playAllPaidSuccessChime();
        } else {
          playPaidChime();
        }
      }
    }

    if (isAllPaid) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#06b6d4', '#fbbf24'],
        });
      } catch {}
    }

    setSession({
      ...session,
      chunks: updatedChunks,
      isFullyPaid: isAllPaid,
    });

    // Update history record
    const updatedHistory = history.map((item) => {
      if (item.id === session.id) {
        return {
          ...item,
          status: isAllPaid ? ('completed' as const) : ('partial' as const),
          chunksSummary: updatedChunks.map((c) => ({
            amount: c.amount,
            upiId: c.upiId,
            paid: c.status === 'paid',
          })),
        };
      }
      return item;
    });

    setHistory(updatedHistory);
    saveProfileHistory(profile.id, updatedHistory);
  };

  // Re-roll / shuffle split amounts in real-time (especially for anti-tracing random splits)
  const handleRerollSplit = async () => {
    if (!session || session.isFullyPaid || generating) return;
    setGenerating(true);
    try {
      const newChunks = await createSplitSessionChunks(session.totalAmount, profile);
      setSession({
        ...session,
        chunks: newChunks,
      });

      const updatedHistory = history.map((item) => {
        if (item.id === session.id) {
          return {
            ...item,
            chunksSummary: newChunks.map((c) => ({
              amount: c.amount,
              upiId: c.upiId,
              paid: false,
            })),
          };
        }
        return item;
      });
      setHistory(updatedHistory);
      saveProfileHistory(profile.id, updatedHistory);
    } finally {
      setGenerating(false);
    }
  };

  // Reset for new customer
  const handleNewBill = () => {
    setSession(null);
    setAmountStr('');
    setNote('');
  };

  const clearProfileHistory = () => {
    setHistory([]);
    saveProfileHistory(profile.id, []);
  };

  const handleLogoutAndClear = () => {
    wipeAllStoredData();
    setProfile(DEMO_PROFILE);
    setSession(null);
    setAmountStr('');
    setNote('');
    setShowSettings(false);
    setShowSwitcher(false);
    setShowHistory(false);
    setShowOnboarding(true);
  };

  return (
    <>
      {/* First-time Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Terminal PIN Lock Guard */}
      {!isUnlocked && profile.pin && (
        <AuthModal expectedPin={profile.pin} onSuccess={() => setIsUnlocked(true)} />
      )}

      {/* App Header */}
      <header className="app-header">
        <div className="brand-section" onClick={() => setShowSwitcher(true)} title="Switch Store Profile">
          <img src="/icon-192.png" alt="SplitQR" className="brand-logo-img" />
          <div className="brand-info">
            <h1>
              SplitQR <span className="brand-badge">Zero MDR</span>
            </h1>
            <div className="brand-store-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{profile.storeName}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▼</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {profile.pin && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setIsUnlocked(false)}
              title="Lock Terminal"
            >
              🔒
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowHistory(true)}
            title="Collection History"
          >
            📊
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowSettings(true)}
            title="Store Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content">
        {!session ? (
          /* Amount Entry / Keypad Workspace */
          <div className="keypad-workspace">
            <AmountDisplay
              amountStr={amountStr}
              profile={profile}
              onClear={() => setAmountStr('')}
            />

            <div className="note-input-row">
              <input
                type="text"
                className="note-input"
                placeholder="Optional customer name or reference note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Keypad
              amountStr={amountStr}
              onAmountChange={setAmountStr}
              soundEnabled={profile.soundEnabled}
              hapticsEnabled={profile.hapticsEnabled}
            />

            <button
              type="button"
              className="generate-btn"
              disabled={generating || !amountStr || parseFloat(amountStr) <= 0}
              onClick={handleGenerateQrs}
            >
              {generating ? 'Generating QRs...' : '⚡ Generate Split QR Codes'}
            </button>
          </div>
        ) : (
          /* Multi-QR Settlement Workspace */
          <div className="qr-settlement-view">
            {/* Mobile & Desktop Responsive Settlement Header Deck */}
            <div className="settlement-header-deck">
              <div className="settlement-primary-row">
                <button
                  type="button"
                  className="btn-back-nav"
                  onClick={() => setSession(null)}
                  title="Return to keypad to enter a new amount"
                >
                  <span className="back-arrow">←</span>
                  <span>Keypad</span>
                </button>

                <div className="bill-total-badge">
                  <span className="bill-label">TOTAL BILL</span>
                  <span className="bill-value">₹{session.totalAmount.toLocaleString('en-IN')}</span>
                </div>

                {session.chunks.length > 1 && !session.isFullyPaid && (
                  <button
                    type="button"
                    className="btn-reroll"
                    onClick={handleRerollSplit}
                    disabled={generating}
                    title="Re-randomize / re-calculate split chunks"
                  >
                    <span>🎲</span>
                    <span className="reroll-text">{generating ? 'Rolling...' : 'Re-roll'}</span>
                  </button>
                )}
              </div>

              {/* Segmented Touch Control Strip for Mobile & Desktop */}
              <div className="settlement-controls-strip">
                <div className="segmented-control" role="group" aria-label="View Mode">
                  <button
                    type="button"
                    className={`segment-btn ${focusMode ? 'active' : ''}`}
                    onClick={() => setFocusMode(true)}
                  >
                    <span className="segment-icon">🎴</span>
                    <span>1-by-1 Focus</span>
                  </button>
                  <button
                    type="button"
                    className={`segment-btn ${!focusMode ? 'active' : ''}`}
                    onClick={() => setFocusMode(false)}
                  >
                    <span className="segment-icon">▦</span>
                    <span>All QRs ({session.chunks.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  className={`toggle-pill-btn ${hidePaid ? 'active' : ''}`}
                  onClick={() => setHidePaid((prev) => !prev)}
                  title="Toggle hiding settled QR cards"
                >
                  <span>{hidePaid ? '🙈' : '👁️'}</span>
                  <span>{hidePaid ? 'Hiding Paid' : 'Hide Paid'}</span>
                  {hidePaid && (
                    <span className="pill-counter">
                      {session.chunks.filter((c) => c.status === 'unpaid').length} left
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar & Settlement Overview */}
            <SettlementProgress
              chunks={session.chunks}
              totalAmount={session.totalAmount}
              onNewBill={handleNewBill}
            />

            {/* Carousel / Responsive Multi-QR View */}
            <QrCarousel
              chunks={session.chunks}
              onTogglePaid={handleTogglePaid}
              hidePaid={hidePaid}
              focusMode={focusMode}
            />
          </div>
        )}
      </main>

      {/* Multi-Store Profile Switcher Modal */}
      {showSwitcher && (
        <ProfileSwitcherModal
          activeProfile={profile}
          onSelectProfile={handleSelectProfile}
          onLogoutAndClear={handleLogoutAndClear}
          onClose={() => setShowSwitcher(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          profile={profile}
          onSave={handleSaveProfile}
          onLogoutAndClear={handleLogoutAndClear}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          history={history}
          onClear={clearProfileHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};
