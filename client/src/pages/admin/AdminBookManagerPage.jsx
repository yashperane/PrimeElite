import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { BulkImportModal } from '../../components/admin/BulkImportModal.jsx';
import { VersionSnapshotModal } from '../../components/admin/VersionSnapshotModal.jsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminBookManagerPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [chapterToTrash, setChapterToTrash] = useState(null);
  const [trashModalOpen, setTrashModalOpen] = useState(false);

  // Drag reorder
  const [draggedIndex, setDraggedIndex] = useState(null);

  const toast = useToast();

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/books/${id}`);
      if (res.data?.success) {
        setBook(res.data.data.book);
        setChapters(res.data.data.chapters);
      }
    } catch (err) {
      toast.error('पुस्तकाची माहिती लोड करता आली नाही.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const handleBulkImport = async (markdown) => {
    try {
      const res = await api.post(`/books/${id}/chapters/import`, { markdown });
      toast.success(res.data?.message || 'अध्याय यशस्वीरीत्या आयात केले!');
      fetchBookData();
    } catch (err) {
      toast.error(err.message || 'अध्याय आयात करता आले नाहीत.');
    }
  };

  const handleCreateSnapshot = async (label) => {
    try {
      await api.post(`/books/${id}/snapshots`, { label });
      toast.success('पुस्तकाची नवीन आवृत्ती (Snapshot) सुरक्षित साठवली!');
    } catch (err) {
      toast.error('आवृत्ती साठवता आली नाही.');
    }
  };

  const handleExport = (format) => {
    const url = `${api.defaults.baseURL}/books/${id}/export?format=${format}`;
    window.open(url, '_blank');
  };

  const confirmTrashChapter = async () => {
    if (!chapterToTrash) return;
    try {
      await api.delete(`/chapters/${chapterToTrash._id}`);
      toast.success('अध्याय कचरापेटीमध्ये हलवला.');
      setChapters((prev) => prev.filter((c) => c._id !== chapterToTrash._id));
    } catch (err) {
      toast.error('अध्याय कचरापेटीमध्ये हलवता आला नाही.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newChapters = [...chapters];
    const draggedItem = newChapters[draggedIndex];
    newChapters.splice(draggedIndex, 1);
    newChapters.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setChapters(newChapters);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const chapterIds = chapters.map((c) => c._id);
      await api.patch(`/books/${id}/chapters/reorder`, { chapterIds });
      toast.success('अध्यायांचा क्रम सेव्ह केला.');
    } catch (err) {
      toast.error('क्रम सेव्ह करता आला नाही.');
      fetchBookData();
    }
  };

  // Mobile reorder buttons
  const moveChapter = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= chapters.length) return;
    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[newIndex];
    newChapters[newIndex] = temp;
    setChapters(newChapters);

    try {
      const chapterIds = newChapters.map((c) => c._id);
      await api.patch(`/books/${id}/chapters/reorder`, { chapterIds });
      toast.success('अध्यायांचा क्रम सेव्ह केला.');
    } catch (err) {
      toast.error('क्रम सेव्ह करता आला नाही.');
      fetchBookData();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">पुस्तक सापडले नाही</h2>
        <Link to="/admin" className="px-4 py-2 bg-theme-accent text-white rounded-lg text-sm">
          डॅशबोर्डवर परत जा
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-text transition-colors"
        >
          <LucideIcon name="ArrowLeft" size={14} />
          <span>सर्व पुस्तके (डॅशबोर्ड)</span>
        </Link>
      </div>

      {/* Book Summary Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl border border-theme-border bg-theme-card shadow-sm mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
            style={{ backgroundColor: book.coverColor || '#2563eb' }}
          >
            <LucideIcon name={book.coverIcon || 'BookOpen'} size={32} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-theme-text">{book.title}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  book.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {book.status === 'published' ? 'प्रकाशित' : 'मसुदा'}
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-1">
              लेखक: {book.author} • {chapters.length} अध्याय • स्लग: /{book.slug}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* History Page Button */}
          <Link
            to={`/admin/books/${book._id}/history`}
            className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <LucideIcon name="History" size={16} className="text-theme-accent" />
            <span>इतिहास (History)</span>
          </Link>

          {/* Save Version Snapshot */}
          <button
            onClick={() => setSnapshotModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <LucideIcon name="Save" size={16} />
            <span>आवृत्ती साठवा</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={() => handleExport('json')}
            className="p-2 rounded-xl border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors"
            title="JSON बॅकअप डाऊनलोड करा"
            aria-label="Export JSON"
          >
            <LucideIcon name="Download" size={16} />
          </button>
          <button
            onClick={() => handleExport('md')}
            className="p-2 rounded-xl border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors"
            title="Markdown (.md) डाऊनलोड करा"
            aria-label="Export Markdown"
          >
            <LucideIcon name="FileText" size={16} />
          </button>

          {/* Bulk Import */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <LucideIcon name="Upload" size={16} />
            <span>आयात (Import)</span>
          </button>

          {/* New Chapter */}
          <Link
            to={`/admin/books/${book._id}/chapters/new`}
            className="px-4 py-2 rounded-xl bg-theme-accent hover:bg-theme-accentHover text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <LucideIcon name="Plus" size={16} />
            <span>नवीन अध्याय</span>
          </Link>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-theme-border">
          <h2 className="text-lg font-bold text-theme-text flex items-center gap-2">
            <LucideIcon name="List" size={20} className="text-theme-accent" />
            <span>अध्याय यादी (Chapters List)</span>
          </h2>
          <span className="text-xs text-theme-muted">
            क्रम बदलण्यासाठी ओढा किंवा मोबाईल बाण वापरा
          </span>
        </div>

        {chapters.length === 0 ? (
          <EmptyState
            icon="FileText"
            title="कोणताही अध्याय उपलब्ध नाही"
            description="या पुस्तकात पहिला अध्याय तयार करा किंवा मार्कडाउन फाईलमधून आयात करा."
            action={
              <Link
                to={`/admin/books/${book._id}/chapters/new`}
                className="px-4 py-2 rounded-xl bg-theme-accent text-white text-xs font-medium"
              >
                पहिला अध्याय जोडा
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                  draggedIndex === index
                    ? 'border-theme-accent bg-theme-accent/5 opacity-50'
                    : 'border-theme-border bg-theme-card hover:border-theme-accent/40 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  {/* Drag Handle */}
                  <div
                    className="hidden sm:flex cursor-grab text-theme-muted hover:text-theme-text p-1"
                    title="क्रम बदलण्यासाठी ओढा"
                  >
                    <LucideIcon name="GripVertical" size={18} />
                  </div>

                  {/* Mobile Reorder Arrows */}
                  <div className="flex sm:hidden flex-col gap-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => moveChapter(index, -1)}
                      className="p-1 text-theme-muted disabled:opacity-20"
                      aria-label="Move Chapter Up"
                    >
                      <LucideIcon name="ChevronLeft" size={14} className="rotate-90" />
                    </button>
                    <button
                      disabled={index === chapters.length - 1}
                      onClick={() => moveChapter(index, 1)}
                      className="p-1 text-theme-muted disabled:opacity-20"
                      aria-label="Move Chapter Down"
                    >
                      <LucideIcon name="ChevronRight" size={14} className="rotate-90" />
                    </button>
                  </div>

                  <span className="w-7 h-7 rounded-full bg-theme-bg flex items-center justify-center text-xs font-bold text-theme-muted shrink-0">
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/chapters/${chapter._id}/edit`}
                        className="font-semibold text-sm text-theme-text hover:text-theme-accent transition-colors line-clamp-1"
                      >
                        {chapter.title}
                      </Link>
                      <span
                        className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          chapter.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {chapter.status === 'published' ? 'प्रकाशित' : 'मसुदा'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-theme-muted mt-0.5">
                      <span>अंदाजे {chapter.readingTimeMin || 1} मिनिटे</span>
                      <span>•</span>
                      <span className="font-mono">/{chapter.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-theme-border">
                  <Link
                    to={`/admin/chapters/${chapter._id}/edit`}
                    className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors flex items-center gap-1.5"
                  >
                    <LucideIcon name="Pencil" size={14} />
                    <span>संपादित करा</span>
                  </Link>

                  <button
                    onClick={() => {
                      setChapterToTrash(chapter);
                      setTrashModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="कचरापेटीमध्ये हलवा"
                    aria-label="Trash Chapter"
                  >
                    <LucideIcon name="Trash2" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleBulkImport}
      />

      {/* Snapshot Modal */}
      <VersionSnapshotModal
        isOpen={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        onSave={handleCreateSnapshot}
      />

      {/* Chapter Trash Confirm Modal */}
      <ConfirmModal
        isOpen={trashModalOpen}
        onClose={() => setTrashModalOpen(false)}
        onConfirm={confirmTrashChapter}
        title="अध्याय कचरापेटीमध्ये हलवायचा?"
        message={`तुम्हाला खात्री आहे की "${chapterToTrash?.title}" हा अध्याय कचरापेटीमध्ये हलवायचा आहे?`}
        confirmText="कचरापेटीत हलवा"
        danger
      />
    </div>
  );
};
