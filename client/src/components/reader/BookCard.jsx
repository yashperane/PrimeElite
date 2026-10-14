import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const BookCard = ({ book }) => {
  return (
    <Link
      to={`/book/${book.slug}`}
      className="group flex flex-col rounded-2xl border border-theme-border bg-theme-card p-5 shadow-sm hover:shadow-md hover:border-theme-accent/50 transition-all duration-200"
    >
      {/* Book Cover Banner */}
      <div
        className="w-full h-44 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ backgroundColor: book.coverColor || '#2563eb' }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-brightness-95" />
        <div className="z-10 p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-white">
          <LucideIcon name={book.coverIcon || 'BookOpen'} size={48} className="text-white drop-shadow" />
        </div>
      </div>

      {/* Book Details */}
      <div className="flex-1 flex flex-col pt-4">
        <h3 className="text-lg font-bold text-theme-text group-hover:text-theme-accent transition-colors line-clamp-1 mb-1.5">
          {book.title}
        </h3>
        <p className="text-xs text-theme-muted mb-2 font-medium">
          लेखक: {book.author || 'Prime Elite Author'}
        </p>
        <p className="text-sm text-theme-muted line-clamp-2 mb-4 leading-relaxed flex-1">
          {book.description || 'या पुस्तकाचे कोणतेही वर्णन उपलब्ध नाही.'}
        </p>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
          <div className="flex items-center gap-1.5">
            <LucideIcon name="BookOpen" size={14} />
            <span>{book.chapterCount || 0} अध्याय</span>
          </div>
          <div className="flex items-center gap-1 text-theme-accent font-medium group-hover:translate-x-0.5 transition-transform">
            <span>वाचा</span>
            <LucideIcon name="ChevronRight" size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
};
