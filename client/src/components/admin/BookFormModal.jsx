import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { IconPicker, ColorPicker } from './IconAndColorPicker.jsx';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const BookFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [coverIcon, setCoverIcon] = useState('BookOpen');
  const [coverColor, setCoverColor] = useState('#2563eb');
  const [language, setLanguage] = useState('mr');
  const [status, setStatus] = useState('draft');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.description || '');
      setAuthor(initialData.author || '');
      setCoverIcon(initialData.coverIcon || 'BookOpen');
      setCoverColor(initialData.coverColor || '#2563eb');
      setLanguage(initialData.language || 'mr');
      setStatus(initialData.status || 'draft');
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setAuthor('यश पेरणे');
      setCoverIcon('BookOpen');
      setCoverColor('#2563eb');
      setLanguage('mr');
      setStatus('draft');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title,
        slug: slug.trim() || undefined,
        description,
        author,
        coverIcon,
        coverColor,
        language,
        status
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'पुस्तकात बदल करा (Edit Book)' : 'नवीन पुस्तक जोडा (New Book)'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
            पुस्तकाचे नाव (Title) *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा. प्रगत एमईआरएन तंत्रज्ञान"
            className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              कस्टम स्लग (Custom Slug - Optional)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="उदा. advanced-mern"
              className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              लेखकाचे नाव (Author)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="उदा. यश पेरणे"
              className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
            पुस्तकाचे वर्णन (Description)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="पुस्तकाविषयी थोडक्यात माहिती..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
          />
        </div>

        {/* Icon & Color Pickers */}
        <IconPicker selectedIcon={coverIcon} onSelect={setCoverIcon} />
        <ColorPicker selectedColor={coverColor} onSelect={setCoverColor} />

        {/* Status & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              स्थिती (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
            >
              <option value="draft">मसुदा (Draft)</option>
              <option value="published">प्रकाशित (Published)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              भाषा (Language)
            </label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="mr"
              className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-bg text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-theme-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm rounded-xl border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          >
            रद्द करा
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-theme-accent hover:bg-theme-accentHover text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <LucideIcon name="Loader" size={16} className="animate-spin" />}
            <LucideIcon name="Save" size={16} />
            <span>{initialData ? 'बदल सेव्ह करा' : 'पुस्तक तयार करा'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
