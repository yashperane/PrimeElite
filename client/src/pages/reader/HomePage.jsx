import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { BookCard } from '../../components/reader/BookCard.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';

export const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/books');
        if (res.data?.success) {
          setBooks(res.data.data);
        }
      } catch (err) {
        setError(err.message || 'पुस्तके लोड करण्यात समस्या आली.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Welcome Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-3">
          <LucideIcon name="BookOpen" size={14} />
          <span>डिजिटल ग्रंथालय व वाचन मंच</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-text tracking-tight mb-3">
          PRIME ELITE
        </h1>
        <p className="text-base text-theme-muted max-w-2xl leading-relaxed">
          मराठी आणि युनिकोड साहित्याचा उच्च दर्जाचा संग्रह. कोणत्याही विचलिततेशिवाय मोबाईल व संगणकावर समृद्ध वाचन अनुभवाचा आनंद घ्या.
        </p>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-theme-border p-5 space-y-4">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-center">
          <LucideIcon name="TriangleAlert" size={32} className="mx-auto text-rose-600 mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon="BookOpen"
          title="कोणतेही पुस्तक प्रकाशित नाही"
          description="सध्या येथे प्रकाशित पुस्तके उपलब्ध नाहीत. व्यवस्थापक लवकरच नवीन पुस्तके जोडतील."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};
