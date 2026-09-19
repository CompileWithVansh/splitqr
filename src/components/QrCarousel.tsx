import React, { useState, useRef, TouchEvent } from 'react';
import type { QrChunk } from '../types';
import { QrCard } from './QrCard';

interface Props {
  chunks: QrChunk[];
  onTogglePaid: (chunkId: string) => void;
  hidePaid: boolean;
  focusMode: boolean;
}

export const QrCarousel: React.FC<Props> = ({
  chunks,
  onTogglePaid,
  hidePaid,
  focusMode,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter chunks if hidePaid is on
  const visibleChunks = hidePaid ? chunks.filter((c) => c.status === 'unpaid') : chunks;

  // Clamp activeIndex
  const safeIndex = Math.min(activeIndex, Math.max(0, visibleChunks.length - 1));

  const handleNext = () => {
    if (safeIndex < visibleChunks.length - 1) {
      setActiveIndex(safeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setActiveIndex(safeIndex - 1);
    }
  };

  // Touch Swipe gestures for mobile
  const onTouchStart = (e: TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (visibleChunks.length === 0) {
    return (
      <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8' }}>
        All generated QR codes have been settled!
      </div>
    );
  }

  // If focusMode is on:
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {focusMode ? (
        <div className="qr-carousel-mobile">
          {/* Top Quick Navigation Bar for Mobile Thumb Ergonomics */}
          {visibleChunks.length > 1 && (
            <div className="carousel-top-bar">
              <button
                type="button"
                className="carousel-nav-btn"
                onClick={handlePrev}
                disabled={safeIndex === 0}
                aria-label="Previous QR Code"
              >
                ◀ Prev
              </button>

              <div className="carousel-top-info">
                <span className="carousel-part-label">
                  QR {safeIndex + 1} of {visibleChunks.length}
                </span>
                <div className="carousel-dots-mini">
                  {visibleChunks.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`carousel-dot ${idx === safeIndex ? 'active' : ''} ${
                        c.status === 'paid' ? 'paid' : ''
                      }`}
                      onClick={() => setActiveIndex(idx)}
                      title={`Part ${c.partNumber}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="carousel-nav-btn"
                onClick={handleNext}
                disabled={safeIndex === visibleChunks.length - 1}
                aria-label="Next QR Code"
              >
                Next ▶
              </button>
            </div>
          )}

          <div
            className="carousel-viewport"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="carousel-slide">
              <QrCard
                chunk={visibleChunks[safeIndex]}
                onTogglePaid={onTogglePaid}
                hideIfPaid={hidePaid}
                isActiveFocus={true}
              />
            </div>
          </div>

          {/* Bottom Controls for Easy Thumb Reach */}
          {visibleChunks.length > 1 && (
            <div className="carousel-controls">
              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={handlePrev}
                disabled={safeIndex === 0}
                title="Previous QR"
              >
                ←
              </button>

              <div className="carousel-dots">
                {visibleChunks.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`carousel-dot ${idx === safeIndex ? 'active' : ''} ${
                      c.status === 'paid' ? 'paid' : ''
                    }`}
                    onClick={() => setActiveIndex(idx)}
                    title={`Go to Part ${c.partNumber}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="carousel-arrow-btn"
                onClick={handleNext}
                disabled={safeIndex === visibleChunks.length - 1}
                title="Next QR"
              >
                →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Default Responsive Layout: Grid on Desktop, Swipeable Deck on Mobile */
        <>
          {/* Desktop Grid */}
          <div className="qr-grid-desktop">
            {visibleChunks.map((chunk, idx) => (
              <QrCard
                key={chunk.id}
                chunk={chunk}
                onTogglePaid={onTogglePaid}
                hideIfPaid={hidePaid}
                isActiveFocus={idx === safeIndex}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
