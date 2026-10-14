import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { ChapterEditorToolbar } from '../../components/admin/ChapterEditorToolbar.jsx';
import { MarkdownRenderer } from '../../components/reader/MarkdownRenderer.jsx';
import { Drawer } from '../../components/common/Drawer.jsx';
import { DiffViewer } from '../../components/common/DiffViewer.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminChapterEditorPage = () => {
  const { id, bookId } = useParams(); // If id is 'new', bookId is provided
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [currentBook, setCurrentBook] = useState(null);

  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', or 'both'
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // History & Revision Drawer
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Image insertion modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const textareaRef = useRef(null);

  // Load chapter data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isNew) {
          const res = await api.get(`/chapters/${id}`);
          if (res.data?.success) {
            const ch = res.data.data;
            setTitle(ch.title);
            setSlug(ch.slug);
            setContent(ch.content || '');
            setStatus(ch.status);
            setCurrentBook(ch.book);
            setLastSavedTime(new Date(ch.updatedAt));
          }
        } else if (bookId) {
          const bookRes = await api.get(`/books/${bookId}`);
          if (bookRes.data?.success) {
            setCurrentBook(bookRes.data.data.book);
          }
        }
      } catch (err) {
        toast.error('माहिती लोड करता आली नाही.');
      }
    };

    loadData();
  }, [id, bookId, isNew]);

  // Warn on tab closing if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Autosave timer: every 30 seconds if changes exist
  useEffect(() => {
    if (isNew) return; // Don't autosave newly unsaved chapter until manually created

    const timer = setInterval(() => {
      if (hasUnsavedChanges && !saving) {
        handleSave(true); // Autosave flag
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [hasUnsavedChanges, saving, isNew, title, content, status, slug]);

  const handleSave = async (isAutosave = false) => {
    if (!title.trim()) {
      if (!isAutosave) toast.error('कृपया अध्यायाचे शीर्षक प्रविष्ट करा.');
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        const res = await api.post(`/books/${bookId}/chapters`, {
          title,
          slug: slug.trim() || undefined,
          content,
          status
        });
        toast.success('अध्याय तयार केला!');
        setHasUnsavedChanges(false);
        navigate(`/admin/chapters/${res.data.data._id}/edit`, { replace: true });
      } else {
        await api.put(`/chapters/${id}`, {
          title,
          slug: slug.trim() || undefined,
          content,
          status,
          isAutosave
        });
        setHasUnsavedChanges(false);
        setLastSavedTime(new Date());
        if (!isAutosave) {
          toast.success('बदल यशस्वीरीत्या सेव्ह झाले!');
        }
      }
    } catch (err) {
      if (!isAutosave) toast.error(err.message || 'सेव्ह करता आले नाही.');
    } finally {
      setSaving(false);
    }
  };

  // Textarea manipulation
  const insertTextAtCursor = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleInsertCallout = (type) => {
    const calloutTemplate = `\n> [!${type}]\n> येथे मजकूर प्रविष्ट करा...\n\n`;
    insertTextAtCursor(calloutTemplate);
  };

  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setImageUrl(res.data.url);
        toast.success('प्रतिमा अपलोड झाली!');
      }
    } catch (err) {
      toast.error(err.message || 'इमेज अपलोड करता आली नाही. कृपया थेट URL पेस्ट करा.');
    } finally {
      setUploadingImage(false);
    }
  };

  const confirmInsertImage = () => {
    if (!imageUrl.trim()) return;
    const md = `\n![${imageAlt.trim() || 'प्रतिमा'}](${imageUrl.trim()})\n`;
    insertTextAtCursor(md);
    setImageUrl('');
    setImageAlt('');
    setImageModalOpen(false);
  };

  // Revision Drawer Handlers
  const openHistoryDrawer = async () => {
    setHistoryDrawerOpen(true);
    try {
      setLoadingRevisions(true);
      const res = await api.get(`/chapters/${id}/revisions`);
      if (res.data?.success) {
        setRevisions(res.data.data.revisions);
      }
    } catch (err) {
      toast.error('रिव्हिजन इतिहास लोड करता आला नाही.');
    } finally {
      setLoadingRevisions(false);
    }
  };

  const loadRevisionDiff = async (revId) => {
    try {
      setLoadingDiff(true);
      const res = await api.get(`/chapters/${id}/revisions/${revId}/diff`);
      if (res.data?.success) {
        setSelectedRevision(res.data.data.revision);
        setDiffData(res.data.data.diff);
      }
    } catch (err) {
      toast.error('फरक (Diff) लोड करता आला नाही.');
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleRestoreRevision = async (revId) => {
    try {
      const res = await api.post(`/chapters/${id}/restore/${revId}`);
      if (res.data?.success) {
        toast.success('रिव्हिजन पूर्ववत (Restore) करण्यात आले!');
        setTitle(res.data.data.title);
        setContent(res.data.data.content);
        setStatus(res.data.data.status);
        setHasUnsavedChanges(false);
        setHistoryDrawerOpen(false);
      }
    } catch (err) {
      toast.error('रिस्टोअर करता आले नाही.');
    }
  };

  // Metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-theme-border gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={currentBook ? `/admin/books/${currentBook._id || bookId}` : '/admin'}
            className="p-2 rounded-xl border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
            title="परत जा"
          >
            <LucideIcon name="ArrowLeft" size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-theme-text line-clamp-1">
              {isNew ? 'नवीन अध्याय जोडा' : title || 'अध्याय संपादन'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-theme-muted mt-0.5">
              <span>{currentBook?.title || 'पुस्तक'}</span>
              <span>•</span>
              <span>{wordCount} शब्द</span>
              <span>•</span>
              <span>अंदाजे {estimatedTime} मिनिटे</span>
              {hasUnsavedChanges && (
                <span className="text-amber-600 font-semibold">• न सेव्ह केलेले बदल</span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {!isNew && (
            <button
              onClick={openHistoryDrawer}
              className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-card hover:bg-theme-bg text-xs font-semibold text-theme-text transition-colors flex items-center gap-1.5 shadow-sm"
              title="रिव्हिजन इतिहास"
            >
              <LucideIcon name="History" size={15} className="text-theme-accent" />
              <span className="hidden sm:inline">इतिहास</span>
            </button>
          )}

          {/* Status Toggle */}
          <button
            onClick={() => {
              setStatus((prev) => (prev === 'published' ? 'draft' : 'published'));
              setHasUnsavedChanges(true);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              status === 'published'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                : 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
            }`}
          >
            <LucideIcon name={status === 'published' ? 'CircleCheck' : 'FileClock'} size={15} />
            <span>{status === 'published' ? 'प्रकाशित' : 'मसुदा'}</span>
          </button>

          {/* Manual Save */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-theme-accent hover:bg-theme-accentHover text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <LucideIcon name="Loader" size={15} className="animate-spin" />
            ) : (
              <LucideIcon name="Save" size={15} />
            )}
            <span>सेव्ह करा</span>
          </button>
        </div>
      </div>

      {/* Title & Slug inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="अध्यायाचे शीर्षक प्रविष्ट करा..."
            className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-card text-theme-text font-bold text-base focus:outline-none focus:ring-2 focus:ring-theme-accent shadow-sm"
          />
        </div>
        <div>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="कस्टम स्लग (पर्यायी)"
            className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-card text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent shadow-sm font-mono"
          />
        </div>
      </div>

      {/* Editor View Modes (Desktop: Side-by-side or split; Mobile: Tabs) */}
      <div className="flex sm:hidden border-b border-theme-border mb-3">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeTab === 'edit'
              ? 'border-theme-accent text-theme-accent'
              : 'border-transparent text-theme-muted'
          }`}
        >
          संपादन (Edit)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 ${
            activeTab === 'preview'
              ? 'border-theme-accent text-theme-accent'
              : 'border-transparent text-theme-muted'
          }`}
        >
          पूर्वावलोकन (Live Preview)
        </button>
      </div>

      {/* Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Markdown Editor */}
        <div className={activeTab === 'preview' ? 'hidden sm:block' : 'block'}>
          <ChapterEditorToolbar
            onInsert={insertTextAtCursor}
            onInsertCallout={handleInsertCallout}
            onInsertImage={() => setImageModalOpen(true)}
          />

          <textarea
            ref={textareaRef}
            rows={22}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasUnsavedChanges(true);
            }}
            placeholder="येथे मार्कडाउन मजकूर लिहा... (Devanagari, Marathi, English, Unicode)"
            className="w-full p-4 rounded-2xl border border-theme-border bg-theme-card text-theme-text font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-theme-accent resize-y shadow-inner"
          />
        </div>

        {/* Right Column: Live Markdown Preview */}
        <div
          className={`rounded-2xl border border-theme-border bg-theme-card p-6 shadow-sm min-h-[580px] overflow-y-auto max-h-[750px] ${
            activeTab === 'edit' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-theme-border text-xs font-semibold uppercase tracking-wider text-theme-muted">
            <span>थेट पूर्वावलोकन (Live Preview)</span>
            <span>{content.length} अक्षरे</span>
          </div>
          <MarkdownRenderer content={content || '*येथे पूर्वावलोकन दिसेल...*'} />
        </div>
      </div>

      {/* Image Insertion Modal */}
      <Modal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} title="प्रतिमा समाविष्ट करा">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              प्रतिमा फाईल अपलोड करा (Cloudinary पर्यायी)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImageFile}
              className="text-xs text-theme-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-theme-accent/10 file:text-theme-accent hover:file:bg-theme-accent/20 cursor-pointer"
            />
            {uploadingImage && (
              <p className="text-xs text-theme-accent mt-1 flex items-center gap-1">
                <LucideIcon name="Loader" size={13} className="animate-spin" /> अपलोड होत आहे...
              </p>
            )}
          </div>

          <div className="text-center text-xs text-theme-muted font-bold">— किंवा —</div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              प्रतिमा URL पेस्ट करा (Image URL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-3 py-2 text-sm rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">
              वर्णन (Alt Text)
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="प्रतिमेचे वर्णन"
              className="w-full px-3 py-2 text-sm rounded-xl border border-theme-border bg-theme-bg text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-theme-border">
            <button
              onClick={() => setImageModalOpen(false)}
              className="px-4 py-2 text-xs rounded-xl border border-theme-border text-theme-muted hover:text-theme-text"
            >
              रद्द करा
            </button>
            <button
              onClick={confirmInsertImage}
              disabled={!imageUrl.trim()}
              className="px-4 py-2 bg-theme-accent text-white rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              मजकुरात टाका
            </button>
          </div>
        </div>
      </Modal>

      {/* Revision History Drawer */}
      <Drawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        title="रिव्हिजन इतिहास आणि फरक (Revision History & Diff)"
        width="max-w-2xl"
      >
        <div className="space-y-6">
          <p className="text-xs text-theme-muted leading-relaxed">
            प्रत्येक मॅन्युअल सेव्ह, रिस्टोअर आणि ५ मिनिटांच्या अंतरावरील ऑटो-सेव्ह येथे कायम साठवले जातात. कोणत्याही आवृत्तीवर क्लिक करून सध्याच्या मजकुरासोबत फरक (Diff) तपासा किंवा ती पूर्ववत करा.
          </p>

          {/* Revisions List */}
          {loadingRevisions ? (
            <p className="text-xs text-theme-muted">इतिहास लोड होत आहे...</p>
          ) : revisions.length === 0 ? (
            <p className="text-xs text-theme-muted">कोणताही मागील इतिहास आढळला नाही.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-theme-border border border-theme-border rounded-xl bg-theme-bg p-2">
              {revisions.map((rev) => (
                <div
                  key={rev._id}
                  onClick={() => loadRevisionDiff(rev._id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs ${
                    selectedRevision?._id === rev._id
                      ? 'bg-theme-accent/15 border border-theme-accent/40 font-semibold'
                      : 'hover:bg-theme-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-theme-text">{rev.title}</span>
                      <span className="px-1.5 py-0.2 rounded bg-theme-border/60 text-[10px] uppercase font-mono">
                        {rev.source}
                      </span>
                    </div>
                    <span className="text-[11px] text-theme-muted">
                      {new Date(rev.savedAt).toLocaleString()} • {rev.wordCount} शब्द
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreRevision(rev._id);
                    }}
                    className="px-2 py-1 rounded bg-theme-card border border-theme-border hover:border-theme-accent text-[11px] font-semibold text-theme-accent transition-colors"
                  >
                    पुनर्संचयित (Restore)
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Diff Viewer Area */}
          {selectedRevision && (
            <div className="pt-4 border-t border-theme-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-theme-text">
                  फरक तुलना (Diff against current text):
                </span>
                <button
                  onClick={() => handleRestoreRevision(selectedRevision._id)}
                  className="px-3 py-1.5 bg-theme-accent text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <LucideIcon name="RotateCcw" size={13} />
                  <span>ही आवृत्ती पूर्ववत करा</span>
                </button>
              </div>

              {loadingDiff ? (
                <p className="text-xs text-theme-muted">तुलना करत आहे...</p>
              ) : (
                <DiffViewer diff={diffData} />
              )}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};
