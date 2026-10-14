import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { LucideIcon } from '../../components/common/LucideIcon.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
      if (res.data?.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Highlight query term in snippets
  const highlightMatch = (text, term) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark
          key={index}
          className="bg-amber-200 dark:bg-amber-800 dark:text-amber-100 rounded px-1 font-semibold"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-text mb-2 flex items-center gap-2.5">
          <LucideIcon name="Search" size={28} className="text-theme-accent" />
          <span>शोध (Search)</span>
        </h1>
        <p className="text-sm text-theme-muted">
          सर्व प्रकाशित पुस्तके आणि अध्यायांमध्ये शीर्षक किंवा मजकूर शोधा.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <LucideIcon
            name="Search"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="येथे शब्द किंवा शीर्षक शोधा..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-theme-border bg-theme-card text-theme-text placeholder-theme-muted text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="px-6 py-3 rounded-xl bg-theme-accent hover:bg-theme-accentHover text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          {loading ? <LucideIcon name="Loader" size={16} className="animate-spin" /> : <LucideIcon name="Search" size={16} />}
          <span>शोधा</span>
        </button>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" count={3} />
        </div>
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon="Search"
          title="कोणताही निकाल सापडला नाही"
          description={`"${query}" साठी प्रकाशित साहित्यात कोणताही जुळणारा मजकूर आढळला नाही.`}
        />
      ) : (
        <div className="space-y-4">
          {results.map((res) => (
            <Link
              key={res._id}
              to={`/book/${res.book.slug}/chapter/${res.slug}`}
              className="block p-5 rounded-2xl border border-theme-border bg-theme-card hover:border-theme-accent/50 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-accent mb-1.5">
                <LucideIcon name="BookOpen" size={14} />
                <span>{res.book.title}</span>
              </div>
              <h3 className="text-base font-bold text-theme-text group-hover:text-theme-accent transition-colors mb-2">
                {highlightMatch(res.title, query)}
              </h3>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed line-clamp-2">
                {highlightMatch(res.snippet, query)}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-theme-muted font-medium">
                <LucideIcon name="Clock" size={12} />
                <span>{res.readingTimeMin || 1} मिनिटे वाचन</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
