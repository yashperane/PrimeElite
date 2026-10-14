import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from './LucideIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReaderSettings } from '../../context/ReaderSettingsContext.jsx';

export const Navbar = ({ onOpenSettings }) => {
  const { admin, logout } = useAuth();
  const { theme, setTheme } = useReaderSettings();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('sepia');
    else setTheme('light');
  };

  const themeIcon = theme === 'light' ? 'Sun' : theme === 'dark' ? 'Moon' : 'Coffee';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-theme-border bg-theme-card/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-theme-text font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-theme-accent text-white flex items-center justify-center shadow-sm">
            <LucideIcon name="BookOpen" size={20} className="text-white" />
          </div>
          <span>PRIME ELITE</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/search"
            aria-label="Search"
            className="p-2.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg border border-transparent hover:border-theme-border transition-colors flex items-center gap-1.5 text-sm"
          >
            <LucideIcon name="Search" size={18} />
            <span className="hidden sm:inline">शोधा</span>
          </Link>

          {/* Theme Quick Switcher */}
          <button
            onClick={toggleTheme}
            aria-label={`Current theme ${theme}. Click to switch`}
            className="p-2.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg border border-transparent hover:border-theme-border transition-colors"
            title={`थीम: ${theme}`}
          >
            <LucideIcon name={themeIcon} size={18} />
          </button>

          {/* Reader Typography Settings Button (if on reader view or requested) */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              aria-label="Reader settings"
              className="p-2.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg border border-transparent hover:border-theme-border transition-colors flex items-center gap-1.5 text-sm"
            >
              <LucideIcon name="Settings" size={18} />
              <span className="hidden sm:inline">फॉन्ट / आकार</span>
            </button>
          )}

          {/* Admin Navigation Button */}
          {admin ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-theme-border">
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isAdminRoute
                    ? 'bg-theme-accent text-white shadow-sm'
                    : 'text-theme-text hover:bg-theme-bg'
                }`}
              >
                <LucideIcon name="FileText" size={16} />
                <span>डॅशबोर्ड</span>
              </Link>
              <button
                onClick={logout}
                aria-label="Logout"
                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="लॉगआउट"
              >
                <LucideIcon name="LogOut" size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="p-2.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
              title="व्यवस्थापक लॉगिन"
              aria-label="Admin Login"
            >
              <LucideIcon name="Lock" size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
