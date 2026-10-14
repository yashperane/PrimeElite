import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const ChapterNav = ({ bookSlug, prev, next, currentIndex, totalChapters }) => {
  return (
    <nav
      aria-label="Chapter navigation"
      className="mt-12 pt-8 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Previous Chapter */}
      {prev ? (
        <Link
          to={`/book/${bookSlug}/chapter/${prev.slug}`}
          className="w-full sm:w-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border border-theme-border bg-theme-card hover:border-theme-accent text-sm font-medium text-theme-text transition-all group"
        >
          <LucideIcon
            name="ChevronLeft"
            size={18}
            className="text-theme-muted group-hover:text-theme-accent group-hover:-translate-x-0.5 transition-transform"
          />
          <div className="text-left">
            <span className="block text-[11px] text-theme-muted uppercase tracking-wider font-semibold">
              मागील अध्याय
            </span>
            <span className="line-clamp-1">{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Chapter Counter & Overview */}
      <div className="text-xs text-theme-muted font-medium text-center">
        अध्याय {currentIndex} पैकी {totalChapters}
      </div>

      {/* Next Chapter */}
      {next ? (
        <Link
          to={`/book/${bookSlug}/chapter/${next.slug}`}
          className="w-full sm:w-auto flex items-center justify-end gap-2.5 px-4 py-3 rounded-xl border border-theme-border bg-theme-card hover:border-theme-accent text-sm font-medium text-theme-text transition-all group text-right"
        >
          <div>
            <span className="block text-[11px] text-theme-muted uppercase tracking-wider font-semibold">
              पुढील अध्याय
            </span>
            <span className="line-clamp-1">{next.title}</span>
          </div>
          <LucideIcon
            name="ChevronRight"
            size={18}
            className="text-theme-muted group-hover:text-theme-accent group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
};
