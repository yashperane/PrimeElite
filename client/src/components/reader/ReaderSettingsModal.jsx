import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { LucideIcon } from '../common/LucideIcon.jsx';
import { useReaderSettings } from '../../context/ReaderSettingsContext.jsx';

export const ReaderSettingsModal = ({ isOpen, onClose }) => {
  const {
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    resetDefaults
  } = useReaderSettings();

  const themes = [
    { id: 'light', name: 'प्रकाश (Light)', icon: 'Sun' },
    { id: 'dark', name: 'अंधार (Dark)', icon: 'Moon' },
    { id: 'sepia', name: 'सेपिया (Sepia)', icon: 'Coffee' }
  ];

  const fonts = [
    { id: 'Noto Sans Devanagari', name: 'Noto Sans Devanagari' },
    { id: 'Mukta', name: 'Mukta' },
    { id: 'Noto Serif Devanagari', name: 'Noto Serif Devanagari' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="वाचन प्राधान्ये (Reader Settings)">
      <div className="space-y-6">
        {/* Theme Picker */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2.5 block">
            थीम निवडा (Theme)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  theme === t.id
                    ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-bold ring-2 ring-theme-accent/30'
                    : 'border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg'
                }`}
              >
                <LucideIcon name={t.icon} size={20} className="mb-1.5" />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2.5 block">
            फॉन्ट शैली (Font Family)
          </label>
          <div className="space-y-2">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left ${
                  fontFamily === f.id
                    ? 'border-theme-accent bg-theme-accent/10 text-theme-accent font-semibold ring-2 ring-theme-accent/20'
                    : 'border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg'
                }`}
                style={{ fontFamily: f.id }}
              >
                <span>{f.name} (मराठी मजकूर)</span>
                {fontFamily === f.id && <LucideIcon name="CircleCheck" size={18} />}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              फॉन्ट आकार (Font Size)
            </span>
            <span className="text-xs font-mono font-medium text-theme-text">
              {Math.round(fontSize * 16)}px ({fontSize}rem)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LucideIcon name="AArrowDown" size={18} className="text-theme-muted" />
            <input
              type="range"
              min="0.875"
              max="1.75"
              step="0.0625"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full accent-theme-accent cursor-pointer"
            />
            <LucideIcon name="AArrowUp" size={24} className="text-theme-muted" />
          </div>
        </div>

        {/* Line Height Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              ओळींमधील अंतर (Line Height)
            </span>
            <span className="text-xs font-mono font-medium text-theme-text">{lineHeight}</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="2.5"
            step="0.1"
            value={lineHeight}
            onChange={(e) => setLineHeight(parseFloat(e.target.value))}
            className="w-full accent-theme-accent cursor-pointer"
          />
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-theme-border flex justify-between items-center">
          <button
            onClick={resetDefaults}
            className="text-xs text-theme-muted hover:text-theme-text underline"
          >
            डीफॉल्ट सेटिंग्जवर रिसेट करा
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-theme-accent hover:bg-theme-accentHover text-white rounded-lg text-sm font-medium transition-colors"
          >
            पूर्ण झाले
          </button>
        </div>
      </div>
    </Modal>
  );
};
