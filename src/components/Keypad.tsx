import React from 'react';
import { playKeypadClick, triggerHaptic } from '../utils/sound';

interface Props {
  amountStr: string;
  onAmountChange: (val: string) => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const Keypad: React.FC<Props> = ({
  amountStr,
  onAmountChange,
  soundEnabled,
  hapticsEnabled,
}) => {
  const triggerFeedback = () => {
    if (soundEnabled) playKeypadClick();
    if (hapticsEnabled) triggerHaptic();
  };

  const handleDigit = (char: string) => {
    triggerFeedback();

    if (char === '.') {
      if (amountStr.includes('.')) return;
      if (!amountStr) {
        onAmountChange('0.');
        return;
      }
      onAmountChange(amountStr + '.');
      return;
    }

    if (char === '00') {
      if (!amountStr || amountStr === '0') return;
      if (amountStr.includes('.')) {
        const parts = amountStr.split('.');
        if (parts[1]?.length >= 2) return;
      }
      // Cap maximum length
      if (amountStr.length >= 8) return;
      onAmountChange(amountStr + '00');
      return;
    }

    if (amountStr === '0') {
      onAmountChange(char);
      return;
    }

    // Restrict to 2 decimal places
    if (amountStr.includes('.')) {
      const decimals = amountStr.split('.')[1];
      if (decimals && decimals.length >= 2) return;
    }

    if (amountStr.length >= 8) return;
    onAmountChange(amountStr + char);
  };

  const handleBackspace = () => {
    triggerFeedback();
    if (!amountStr) return;
    const next = amountStr.slice(0, -1);
    onAmountChange(next);
  };

  const handleClear = () => {
    triggerFeedback();
    onAmountChange('');
  };

  const handleAddPreset = (delta: number) => {
    triggerFeedback();
    const current = parseFloat(amountStr) || 0;
    const next = Math.max(0, current + delta);
    onAmountChange(String(next));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Quick Add Presets */}
      <div className="presets-row">
        <button type="button" className="preset-chip" onClick={() => handleAddPreset(100)}>
          +100
        </button>
        <button type="button" className="preset-chip" onClick={() => handleAddPreset(500)}>
          +500
        </button>
        <button type="button" className="preset-chip" onClick={() => handleAddPreset(1000)}>
          +1k
        </button>
        <button type="button" className="preset-chip" onClick={() => handleAddPreset(2000)}>
          +2k
        </button>
        <button type="button" className="preset-chip" onClick={() => handleAddPreset(5000)}>
          +5k
        </button>
      </div>

      {/* Main Touchpad Grid */}
      <div className="touch-keypad">
        <button type="button" className="keypad-btn" onClick={() => handleDigit('1')}>1</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('2')}>2</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('3')}>3</button>

        <button type="button" className="keypad-btn" onClick={() => handleDigit('4')}>4</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('5')}>5</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('6')}>6</button>

        <button type="button" className="keypad-btn" onClick={() => handleDigit('7')}>7</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('8')}>8</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('9')}>9</button>

        <button type="button" className="keypad-btn action-btn" onClick={handleClear} title="Clear All">
          C
        </button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('0')}>0</button>
        <button type="button" className="keypad-btn action-btn" onClick={handleBackspace} title="Backspace">
          ⌫
        </button>

        <button type="button" className="keypad-btn" onClick={() => handleDigit('00')}>00</button>
        <button type="button" className="keypad-btn" onClick={() => handleDigit('.')}>.</button>
        <button
          type="button"
          className="keypad-btn action-btn"
          onClick={() => {
            triggerFeedback();
            onAmountChange('1999');
          }}
          title="Instant 1999 cap preset"
          style={{ fontSize: '0.86rem', fontWeight: 700, color: '#34d399' }}
        >
          1999
        </button>
      </div>
    </div>
  );
};
