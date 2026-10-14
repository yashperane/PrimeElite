import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminTrashPage = () => {
  const [trashedBooks, setTrashedBooks] = useState([]);
  const [trashedChapters, setTrashedChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [itemToRestore, setItemToRestore] = useState(null); // { type: 'book'|'chapter', item }
  const [itemToPermanentDelete, setItemToPermanentDelete] = useState(null); // { type: 'book'|'chapter', item }
  const [permanentModalOpen, setPermanentModalOpen] = useState(false);

  const toast = useToast();

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trash');
      if (res.data?.success) {
        setTrashedBooks(res.data.data.books);
        setTrashedChapters(res.data.data.chapters);
      }
    } catch (err) {
      toast.error('कचरापेटी लोड करता आली नाही.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (type, id) => {
    try {
      if (type === 'book') {
        await api.post(`/books/${id}/restore`);
        toast.success('पुस्तक आणि त्याचे अध्याय कचरापेटीतून पुनर्संचयित केले!');
      } else {
        await api.post(`/chapters/${id}/restore-from-trash`);
        toast.success('अध्याय कचरापेटीतून पुनर्संचयित केला!');
      }
      fetchTrash();
    } catch (err) {
      toast.error(err.message || 'पुनर्संचयित करता आले नाही.');
    }
  };

  const handlePermanentDelete = async () => {
    if (!itemToPermanentDelete) return;
    const { type, item } = itemToPermanentDelete;

    try {
      if (type === 'book') {
        await api.delete(`/books/${item._id}/permanent`, {
          data: { confirmTitle: item.title }
        });
        toast.success('पुस्तक कायमस्वरूपी हटवले (इतिहास सुरक्षित ठेवला आहे).');
      } else {
        await api.delete(`/chapters/${item._id}/permanent`, {
          data: { confirmTitle: item.title }
        });
        toast.success('अध्याय कायमस्वरूपी हटवला (रिव्हिजन सुरक्षित ठेवल्या आहेत).');
      }
      fetchTrash();
    } catch (err) {
      toast.error(err.message || 'कायमस्वरूपी हटवता आले नाही.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-text transition-colors"
        >
          <LucideIcon name="ArrowLeft" size={14} />
          <span>डॅशबोर्डवर परत जा</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text flex items-center gap-2.5">
          <LucideIcon name="Trash2" size={28} className="text-rose-500" />
          <span>कचरापेटी (Trash Management)</span>
        </h1>
        <p className="text-xs sm:text-sm text-theme-muted mt-1">
          येथून आपण मऊ-हटवलेले (soft-deleted) घटक पूर्ववत करू शकता किंवा कायमस्वरूपी हटवू शकता. कायमस्वरूपी हटवतानाही सुरक्षिततेसाठी स्नॅपशॉट व इतिहास दस्तऐवज कायम ठेवले जातात.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" count={3} />
        </div>
      ) : trashedBooks.length === 0 && trashedChapters.length === 0 ? (
        <EmptyState
          icon="Trash2"
          title="कचरापेटी रिकामी आहे"
          description="सध्या कचरापेटीमध्ये कोणतेही पुस्तक किंवा अध्याय उपलब्ध नाही."
        />
      ) : (
        <div className="space-y-8">
          {/* Trashed Books */}
          {trashedBooks.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-theme-text mb-3 flex items-center gap-2">
                <LucideIcon name="BookOpen" size={18} className="text-theme-accent" />
                <span>हटवलेली पुस्तके ({trashedBooks.length})</span>
              </h2>
              <div className="space-y-3">
                {trashedBooks.map((book) => (
                  <div
                    key={book._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-theme-border bg-theme-card shadow-sm gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-theme-text">{book.title}</h3>
                      <p className="text-xs text-theme-muted mt-0.5">
                        हटवले: {new Date(book.deletedAt).toLocaleString()} • लेखक: {book.author}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore('book', book._id)}
                        className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-accent transition-colors flex items-center gap-1.5"
                      >
                        <LucideIcon name="ArchiveRestore" size={14} />
                        <span>पुनर्संचयित (Restore)</span>
                      </button>

                      <button
                        onClick={() => {
                          setItemToPermanentDelete({ type: 'book', item: book });
                          setPermanentModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                      >
                        <LucideIcon name="Trash2" size={14} />
                        <span>कायमस्वरूपी हटवा</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trashed Chapters */}
          {trashedChapters.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-theme-text mb-3 flex items-center gap-2">
                <LucideIcon name="FileText" size={18} className="text-theme-accent" />
                <span>हटवलेले अध्याय ({trashedChapters.length})</span>
              </h2>
              <div className="space-y-3">
                {trashedChapters.map((chapter) => (
                  <div
                    key={chapter._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-theme-border bg-theme-card shadow-sm gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-theme-text">{chapter.title}</h3>
                      <p className="text-xs text-theme-muted mt-0.5">
                        पुस्तक: {chapter.book?.title || 'Unknown'} • हटवले:{' '}
                        {new Date(chapter.deletedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore('chapter', chapter._id)}
                        className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-accent transition-colors flex items-center gap-1.5"
                      >
                        <LucideIcon name="ArchiveRestore" size={14} />
                        <span>पुनर्संचयित (Restore)</span>
                      </button>

                      <button
                        onClick={() => {
                          setItemToPermanentDelete({ type: 'chapter', item: chapter });
                          setPermanentModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                      >
                        <LucideIcon name="Trash2" size={14} />
                        <span>कायमस्वरूपी हटवा</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permanent Delete Modal (Requires typing title) */}
      <ConfirmModal
        isOpen={permanentModalOpen}
        onClose={() => setPermanentModalOpen(false)}
        onConfirm={handlePermanentDelete}
        title="कायमस्वरूपी हटवण्याची खात्री करा"
        message={`तुम्हाला खात्री आहे की "${itemToPermanentDelete?.item?.title}" कायमस्वरूपी हटवायचे आहे? सुरक्षेसाठी या घटकाचा आपोआप स्नॅपशॉट घेतला जाईल, परंतु तो सक्रिय टेबलमधून काढला जाईल.`}
        confirmText="कायमस्वरूपी हटवा"
        danger
        requireTypedText={itemToPermanentDelete?.item?.title}
      />
    </div>
  );
};
