import React, { useEffect } from 'react';
import { LucideIcon } from './LucideIcon.jsx';

export const Drawer = ({ isOpen, onClose, title, children, width = 'max-w-md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div
        className={`bg-theme-card border-l border-theme-border w-full ${width} h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out`}
        role="dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <h3 className="font-semibold text-theme-text">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          >
            <LucideIcon name="X" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
