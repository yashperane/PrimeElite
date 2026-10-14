import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { ReadingProgressBar } from '../../components/reader/ReadingProgressBar.jsx';
import { MarkdownRenderer } from '../../components/reader/MarkdownRenderer.jsx';
import { ChapterNav } from '../../components/reader/ChapterNav.jsx';
import { ReaderSettingsModal } from '../../components/reader/ReaderSettingsModal.jsx';

export const ChapterReaderPage = () => {
  const { bookSlug, chapterSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/books/${bookSlug}/chapters/${chapterSlug}`);
        if (res.data?.success) {
          setData(res.data.data);

          // Save last read chapter for this book in localStorage
          localStorage.setItem(`pe_progress_${bookSlug}`, chapterSlug);

          // Restore scroll position if saved, otherwise scroll to top
          const savedScroll = localStorage.getItem(`pe_scroll_${bookSlug}_${chapterSlug}`);
          if (savedScroll) {
            setTimeout(() => {
              window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'smooth' });
            }, 100);
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      } catch (err) {
        setError(err.message || 'अध्याय लोड करण्यात अयशस्वी.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [bookSlug, chapterSlug]);

  // Persist scroll position periodically
  useEffect(() => {
    const handleScroll = () => {
      if (bookSlug && chapterSlug) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        localStorage.setItem(`pe_scroll_${bookSlug}_${chapterSlug}`, scrollTop.toString());
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bookSlug, chapterSlug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="pt-6 space-y-4">
          <Skeleton className="h-6 w-full" count={8} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <LucideIcon name="TriangleAlert" size={40} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-theme-text mb-2">अध्याय सापडला नाही</h2>
        <p className="text-sm text-theme-muted mb-6">{error || 'मागणी केलेला अध्याय उपलब्ध नाही.'}</p>
        <Link
          to={`/book/${bookSlug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-accent text-white font-medium text-sm"
        >
          <LucideIcon name="ArrowLeft" size={16} />
          <span>पुस्तकाकडे परत जा</span>
        </Link>
      </div>
    );
  }

  const { book, chapter, navigation } = data;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Reader Floating Sub-header */}
      <div className="sticky top-16 z-30 w-full border-b border-theme-border bg-theme-card/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs">
          <Link
            to={`/book/${bookSlug}`}
            className="flex items-center gap-1.5 text-theme-muted hover:text-theme-text font-medium truncate max-w-[200px] sm:max-w-sm"
          >
            <LucideIcon name="ChevronLeft" size={16} />
            <span className="truncate">{book.title}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-theme-muted hidden sm:inline">
              {navigation.currentIndex} / {navigation.totalChapters}
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg border border-theme-border transition-colors flex items-center gap-1"
              title="वाचन सेटिंग्ज"
              aria-label="Reader Settings"
            >
              <LucideIcon name="Type" size={16} />
              <span className="text-[11px] font-semibold">Aa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Article Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="pb-12">
          {/* Chapter Header */}
          <header className="mb-10 text-center pb-8 border-b border-theme-border">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-accent mb-2 block">
              अध्याय {navigation.currentIndex}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-text tracking-tight mb-4 leading-tight">
              {chapter.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs text-theme-muted">
              <span className="flex items-center gap-1">
                <LucideIcon name="Clock" size={14} />
                अंदाजे {chapter.readingTimeMin || 1} मिनिटे
              </span>
              <span>•</span>
              <span>{book.author}</span>
            </div>
          </header>

          {/* Render Markdown Content with Custom Components & Callouts */}
          <MarkdownRenderer content={chapter.content} />

          {/* Previous / Next Chapter Controls */}
          <ChapterNav
            bookSlug={bookSlug}
            prev={navigation.prev}
            next={navigation.next}
            currentIndex={navigation.currentIndex}
            totalChapters={navigation.totalChapters}
          />
        </article>
      </main>

      {/* Reader Settings Modal */}
      <ReaderSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
