import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const BulkImportModal = ({ isOpen, onClose, onImport }) => {
  const [markdown, setMarkdown] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMarkdown(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!markdown.trim()) return;

    try {
      setSubmitting(true);
      await onImport(markdown);
      setMarkdown('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="अध्याय आयात करा (Bulk Markdown Import)" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          <div className="font-semibold flex items-center gap-1.5 mb-1">
            <LucideIcon name="Info" size={16} />
            <span>कसे कार्य करते?</span>
          </div>
          आपला मार्कडाउन मजकूर येथे पेस्ट करा किंवा .md फाईल अपलोड करा. प्रत्येक मुख्य <strong># शीर्षकापासून</strong> आपोआप एक नवीन अध्याय तयार केला जाईल. सुरक्षेसाठी आयात करण्यापूर्वी संपूर्ण पुस्तकाचा स्वयंचलित स्नॅपशॉट घेतला जाईल.
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
              मार्कडाउन मजकूर (Markdown Content)
            </label>
            <label className="cursor-pointer text-xs font-medium text-theme-accent hover:underline flex items-center gap-1">
              <LucideIcon name="Upload" size={14} />
              <span>.md फाईल निवडा</span>
              <input type="file" accept=".md,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            rows={12}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# पहिला अध्याय\n\nयेथे अध्यायाचा मजकूर येईल...\n\n# दुसरा अध्याय\n\nदुसऱ्या अध्यायाचा मजकूर..."
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text font-mono text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
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
            disabled={submitting || !markdown.trim()}
            className="px-5 py-2.5 bg-theme-accent hover:bg-theme-accentHover text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <LucideIcon name="Loader" size={16} className="animate-spin" />}
            <LucideIcon name="Upload" size={16} />
            <span>अध्याय आयात करा</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
