import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { BookFormModal } from '../../components/admin/BookFormModal.jsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminDashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [bookToTrash, setBookToTrash] = useState(null);

  // Drag and drop ordering state
  const [draggedIndex, setDraggedIndex] = useState(null);

  const toast = useToast();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/books');
      if (res.data?.success) {
        setBooks(res.data.data);
      }
    } catch (err) {
      toast.error('पुस्तके लोड करता आली नाहीत.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCreateOrUpdateBook = async (formData) => {
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData);
        toast.success('पुस्तक यशस्वीरीत्या अपडेट केले!');
      } else {
        await api.post('/books', formData);
        toast.success('नवीन पुस्तक यशस्वीरीत्या तयार केले!');
      }
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'कृती अयशस्वी झाली.');
    }
  };

  const handleToggleStatus = async (book) => {
    const newStatus = book.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/books/${book._id}`, { status: newStatus });
      toast.success(`पुस्तकाची स्थिती "${newStatus}" केली.`);
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      toast.error('स्थिती बदलता आली नाही.');
    }
  };

  const confirmTrashBook = async () => {
    if (!bookToTrash) return;
    try {
      await api.delete(`/books/${bookToTrash._id}`);
      toast.success('पुस्तक कचरापेटीमध्ये (Trash) हलवले.');
      setBooks((prev) => prev.filter((b) => b._id !== bookToTrash._id));
    } catch (err) {
      toast.error('पुस्तक कचरापेटीमध्ये हलवता आले नाही.');
    }
  };

  // Reorder persistence
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newBooks = [...books];
    const draggedItem = newBooks[draggedIndex];
    newBooks.splice(draggedIndex, 1);
    newBooks.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setBooks(newBooks);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const bookIds = books.map((b) => b._id);
      await api.patch('/books/reorder', { bookIds });
      toast.success('पुस्तकांचा क्रम सेव्ह केला.');
    } catch (err) {
      toast.error('पुस्तकांचा क्रम सेव्ह करता आला नाही.');
      fetchBooks();
    }
  };

  // Mobile reorder buttons
  const moveBook = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= books.length) return;
    const newBooks = [...books];
    const temp = newBooks[index];
    newBooks[index] = newBooks[newIndex];
    newBooks[newIndex] = temp;
    setBooks(newBooks);

    try {
      const bookIds = newBooks.map((b) => b._id);
      await api.patch('/books/reorder', { bookIds });
      toast.success('पुस्तकांचा क्रम अपडेट केला.');
    } catch (err) {
      toast.error('क्रम बदलता आला नाही.');
      fetchBooks();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text flex items-center gap-2.5">
            <LucideIcon name="Layers" size={28} className="text-theme-accent" />
            <span>पुस्तके व्यवस्थापन (Books Dashboard)</span>
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted mt-1">
            येथून सर्व पुस्तके व्यवस्थापित करा, क्रम बदला आणि नवीन पुस्तके जोडा.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/trash"
            className="px-4 py-2.5 rounded-xl border border-theme-border bg-theme-card hover:bg-theme-bg text-theme-text text-sm font-medium transition-colors flex items-center gap-2"
          >
            <LucideIcon name="Trash2" size={16} />
            <span>कचरापेटी (Trash)</span>
          </Link>
          <button
            onClick={() => {
              setEditingBook(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accentHover text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <LucideIcon name="Plus" size={16} />
            <span>नवीन पुस्तक</span>
          </button>
        </div>
      </div>

      {/* Book List / Table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" count={3} />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon="BookOpen"
          title="कोणतेही पुस्तक तयार केलेले नाही"
          description="सुरुवात करण्यासाठी वर दिलेल्या 'नवीन पुस्तक' बटनावर क्लिक करा."
          action={
            <button
              onClick={() => {
                setEditingBook(null);
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-white text-sm font-medium"
            >
              पहिले पुस्तक जोडा
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {books.map((book, index) => (
            <div
              key={book._id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                draggedIndex === index
                  ? 'border-theme-accent bg-theme-accent/5 opacity-50'
                  : 'border-theme-border bg-theme-card hover:border-theme-accent/40 shadow-sm'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Drag Handle */}
                <div
                  className="hidden sm:flex cursor-grab text-theme-muted hover:text-theme-text p-1"
                  title="क्रम बदलण्यासाठी ओढा"
                >
                  <LucideIcon name="GripVertical" size={20} />
                </div>

                {/* Mobile reorder buttons */}
                <div className="flex sm:hidden flex-col gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => moveBook(index, -1)}
                    className="p-1 text-theme-muted disabled:opacity-20"
                    aria-label="Move Up"
                  >
                    <LucideIcon name="ChevronLeft" size={16} className="rotate-90" />
                  </button>
                  <button
                    disabled={index === books.length - 1}
                    onClick={() => moveBook(index, 1)}
                    className="p-1 text-theme-muted disabled:opacity-20"
                    aria-label="Move Down"
                  >
                    <LucideIcon name="ChevronRight" size={16} className="rotate-90" />
                  </button>
                </div>

                {/* Cover Preview Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white"
                  style={{ backgroundColor: book.coverColor || '#2563eb' }}
                >
                  <LucideIcon name={book.coverIcon || 'BookOpen'} size={24} className="text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/books/${book._id}`}
                      className="font-bold text-base text-theme-text hover:text-theme-accent transition-colors line-clamp-1"
                    >
                      {book.title}
                    </Link>
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
                  <div className="flex items-center gap-3 text-xs text-theme-muted mt-1">
                    <span>{book.chapterCount || 0} अध्याय</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{book.slug}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-theme-border">
                {/* Manage Chapters */}
                <Link
                  to={`/admin/books/${book._id}`}
                  className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-bg hover:bg-theme-card text-xs font-semibold text-theme-text transition-colors flex items-center gap-1.5"
                >
                  <LucideIcon name="BookOpen" size={14} />
                  <span>अध्याय व्यवस्थापन</span>
                </Link>

                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleStatus(book)}
                  className="p-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
                  title={book.status === 'published' ? 'मसुदा बनवा' : 'प्रकाशित करा'}
                  aria-label="Toggle Status"
                >
                  <LucideIcon
                    name={book.status === 'published' ? 'Eye' : 'EyeOff'}
                    size={16}
                    className={book.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}
                  />
                </button>

                {/* Edit Book Details */}
                <button
                  onClick={() => {
                    setEditingBook(book);
                    setModalOpen(true);
                  }}
                  className="p-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text transition-colors"
                  title="पुस्तकात बदल करा"
                  aria-label="Edit Book"
                >
                  <LucideIcon name="Pencil" size={16} />
                </button>

                {/* Soft Delete (Move to Trash) */}
                <button
                  onClick={() => {
                    setBookToTrash(book);
                    setTrashModalOpen(true);
                  }}
                  className="p-2 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="कचरापेटीमध्ये हलवा"
                  aria-label="Move to Trash"
                >
                  <LucideIcon name="Trash2" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Form Modal */}
      <BookFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdateBook}
        initialData={editingBook}
      />

      {/* Trash Confirm Modal */}
      <ConfirmModal
        isOpen={trashModalOpen}
        onClose={() => setTrashModalOpen(false)}
        onConfirm={confirmTrashBook}
        title="पुस्तक कचरापेटीमध्ये हलवायचे?"
        message={`तुम्हाला खात्री आहे की "${bookToTrash?.title}" हे पुस्तक आणि त्याचे सर्व अध्याय कचरापेटीमध्ये (Trash) हलवायचे आहेत? हे नंतर कचरापेटीतून कधीही रिस्टोअर केले जाऊ शकते.`}
        confirmText="कचरापेटीत हलवा"
        danger
      />
    </div>
  );
};
