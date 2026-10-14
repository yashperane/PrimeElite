import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { LucideIcon } from './LucideIcon.jsx';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'पुष्टी करा',
  message,
  confirmText = 'होय, पुढे जा',
  danger = false,
  requireTypedText = null // String if required to type
}) => {
  const [typedInput, setTypedInput] = useState('');

  const isTypedMatch = !requireTypedText || typedInput.trim() === requireTypedText.trim();

  const handleConfirm = () => {
    if (isTypedMatch) {
      onConfirm();
      setTypedInput('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-theme-text">{message}</p>

        {requireTypedText && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              पुष्टी करण्यासाठी खाली <strong>"{requireTypedText}"</strong> टाईप करा:
            </p>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requireTypedText}
              className="w-full px-3 py-2 text-sm rounded-lg border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-theme-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          >
            रद्द करा
          </button>
          <button
            type="button"
            disabled={!isTypedMatch}
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white'
                : 'bg-theme-accent hover:bg-theme-accentHover disabled:opacity-50 text-white'
            }`}
          >
            {danger && <LucideIcon name="Trash2" size={16} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
