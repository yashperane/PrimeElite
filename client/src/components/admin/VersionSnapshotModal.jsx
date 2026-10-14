import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const VersionSnapshotModal = ({ isOpen, onClose, onSave }) => {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(label.trim() || 'Manual Snapshot');
      setLabel('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="पुस्तकाची आवृत्ती साठवा (Save Version)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-theme-muted leading-relaxed">
          या क्षणी असलेले पुस्तकाचे संपूर्ण रूप (पुस्तकाची माहिती व सर्व अध्याय) कायमस्वरूपी स्नॅपशॉट म्हणून सुरक्षित साठवले जाईल. आपण भविष्यात कधीही या आवृत्तीवर परत येऊ शकता.
        </p>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
            आवृत्तीचे नाव / लेबल (Version Label)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="उदा. प्रथम संपादन पूर्ण (v1.2)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-theme-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm rounded-xl border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          >
            रद्द करा
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-theme-accent hover:bg-theme-accentHover text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <LucideIcon name="Loader" size={16} className="animate-spin" />}
            <LucideIcon name="Save" size={16} />
            <span>आवृत्ती साठवा</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
