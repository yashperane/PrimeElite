import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from './LucideIcon.jsx';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-theme-border bg-theme-card/50 py-8 mt-auto text-sm text-theme-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <LucideIcon name="BookOpen" size={18} className="text-theme-accent" />
          <span className="font-semibold text-theme-text">PRIME ELITE</span>
          <span>&copy; {new Date().getFullYear()} सर्व हक्क राखीव.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-theme-text transition-colors">
            मुख्यपृष्ठ
          </Link>
          <Link to="/search" className="hover:text-theme-text transition-colors">
            शोध
          </Link>
          <Link to="/admin" className="hover:text-theme-text transition-colors">
            व्यवस्थापक
          </Link>
        </div>
      </div>
    </footer>
  );
};
