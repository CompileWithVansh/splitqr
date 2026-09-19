import React from 'react';
import type { TransactionRecord } from '../types';

interface Props {
  history: TransactionRecord[];
  onClear: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<Props> = ({ history, onClear, onClose }) => {
  const totalCollected = history.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Collection History</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Box */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Total Processed
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                ₹{totalCollected.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Transactions
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                {history.length}
              </div>
            </div>
          </div>

          {/* Records List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No split transactions recorded yet.
              </div>
            ) : (
              history.map((record) => {
                const dateStr = new Date(record.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <div key={record.id} className="history-item">
                    <div className="history-item-left">
                      <div className="history-item-amount">
                        ₹{record.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="history-item-date">
                        {dateStr} • {record.splitCount} QR {record.splitCount > 1 ? 'splits' : 'code'}
                        {record.note ? ` • ${record.note}` : ''}
                      </div>
                    </div>

                    <span
                      className="history-item-badge"
                      style={{
                        background:
                          record.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                        color: record.status === 'completed' ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {record.status === 'completed' ? 'Paid ✓' : 'Partial'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {history.length > 0 ? (
            <button
              type="button"
              className="btn-secondary"
              style={{ color: '#f87171' }}
              onClick={() => {
                if (confirm('Clear all transaction history?')) {
                  onClear();
                }
              }}
            >
              Clear Log
            </button>
          ) : <div />}
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
