import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export const BookDetailPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastReadChapterSlug, setLastReadChapterSlug] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/books/${slug}`);
        if (res.data?.success) {
          setData(res.data.data);
          // Check last read chapter from localStorage
          const savedProgress = localStorage.getItem(`pe_progress_${slug}`);
          if (savedProgress) {
            setLastReadChapterSlug(savedProgress);
          }
        }
      } catch (err) {
        setError(err.message || 'पुस्तकाची माहिती लोड करण्यात अयशस्वी.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <LucideIcon name="TriangleAlert" size={40} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-theme-text mb-2">पुस्तक सापडले नाही</h2>
        <p className="text-sm text-theme-muted mb-6">{error || 'मागणी केलेले पुस्तक उपलब्ध नाही.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-accent text-white font-medium text-sm"
        >
          <LucideIcon name="ArrowLeft" size={16} />
          <span>मुख्यपृष्ठावर परत जा</span>
        </Link>
      </div>
    );
  }

  const { book, chapters } = data;
  const firstChapter = chapters[0];
  const continueTargetSlug = lastReadChapterSlug || (firstChapter ? firstChapter.slug : null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-text transition-colors"
        >
          <LucideIcon name="ArrowLeft" size={14} />
          <span>सर्व पुस्तके</span>
        </Link>
      </div>

      {/* Book Hero Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 sm:p-8 rounded-3xl border border-theme-border bg-theme-card shadow-sm mb-10">
        <div
          className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl flex items-center justify-center shadow-lg shrink-0 text-white"
          style={{ backgroundColor: book.coverColor || '#2563eb' }}
        >
          <LucideIcon name={book.coverIcon || 'BookOpen'} size={64} className="text-white drop-shadow-md" />
        </div>

        <div className="flex-1 text-center md:text-left flex flex-col justify-between h-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text tracking-tight mb-2">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-theme-muted mb-4">
              लेखक: <span className="text-theme-text">{book.author || 'Prime Elite Author'}</span>
            </p>
            <p className="text-sm text-theme-muted leading-relaxed mb-6 whitespace-pre-wrap">
              {book.description || 'या पुस्तकाचे कोणतेही वर्णन उपलब्ध नाही.'}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            {continueTargetSlug && (
              <Link
                to={`/book/${book.slug}/chapter/${continueTargetSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-theme-accent hover:bg-theme-accentHover text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <LucideIcon name="BookOpen" size={18} />
                <span>
                  {lastReadChapterSlug ? 'वाचन पुढे चालू ठेवा' : 'वाचन सुरू करा'}
                </span>
              </Link>
            )}
            <div className="flex items-center gap-2 text-xs font-medium text-theme-muted px-3 py-2 rounded-lg bg-theme-bg border border-theme-border">
              <LucideIcon name="Clock" size={16} />
              <span>
                एकूण {chapters.length} अध्याय • अंदाजे{' '}
                {chapters.reduce((acc, c) => acc + (c.readingTimeMin || 1), 0)} मिनिटे
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Table of Contents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-theme-border">
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <LucideIcon name="List" size={20} className="text-theme-accent" />
            <span>अनुक्रमणिका (Chapters)</span>
          </h2>
          <span className="text-xs font-medium text-theme-muted">
            {chapters.length} अध्याय उपलब्ध
          </span>
        </div>

        {chapters.length === 0 ? (
          <EmptyState
            icon="FileText"
            title="कोणताही अध्याय आढळला नाही"
            description="या पुस्तकात अजूनपर्यंत कोणताही अध्याय प्रकाशित केलेला नाही."
          />
        ) : (
          <div className="divide-y divide-theme-border border border-theme-border rounded-2xl bg-theme-card overflow-hidden">
            {chapters.map((chapter, index) => {
              const isLastRead = lastReadChapterSlug === chapter.slug;
              return (
                <Link
                  key={chapter._id}
                  to={`/book/${book.slug}/chapter/${chapter.slug}`}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-theme-bg/80 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-theme-bg flex items-center justify-center text-xs font-bold text-theme-muted group-hover:bg-theme-accent group-hover:text-white transition-colors shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-1">
                        {chapter.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-theme-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <LucideIcon name="Clock" size={12} />
                          {chapter.readingTimeMin || 1} मिनिटे वाचन
                        </span>
                        {isLastRead && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <LucideIcon name="Bookmark" size={12} />
                            शेवटचे वाचलेले
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <LucideIcon
                    name="ChevronRight"
                    size={18}
                    className="text-theme-muted group-hover:text-theme-accent group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
