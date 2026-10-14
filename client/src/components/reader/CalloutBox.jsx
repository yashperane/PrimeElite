import React from 'react';
import { LucideIcon } from '../common/LucideIcon.jsx';

/**
 * Supports:
 * TIP -> Lightbulb (Green)
 * EXAMPLE -> BookOpenCheck (Sky/Blue - distinct and friendly)
 * WARNING -> TriangleAlert (Amber)
 * NOTE -> Info (Slate)
 */
export const CalloutBox = ({ type = 'NOTE', children }) => {
  const normalizedType = type.toUpperCase();

  const configs = {
    TIP: {
      icon: 'Lightbulb',
      title: 'टीप (Tip)',
      containerClass: 'bg-[var(--callout-tip-bg)] border-[var(--callout-tip-border)] text-emerald-900 dark:text-emerald-100',
      iconClass: 'text-emerald-600 dark:text-emerald-400'
    },
    EXAMPLE: {
      icon: 'BookOpenCheck',
      title: 'वास्तविक उदाहरण (Example)',
      containerClass: 'bg-[var(--callout-example-bg)] border-2 border-[var(--callout-example-border)] text-sky-950 dark:text-sky-100 shadow-sm',
      iconClass: 'text-sky-600 dark:text-sky-400'
    },
    WARNING: {
      icon: 'TriangleAlert',
      title: 'सावधान (Warning)',
      containerClass: 'bg-[var(--callout-warning-bg)] border-[var(--callout-warning-border)] text-amber-950 dark:text-amber-100',
      iconClass: 'text-amber-600 dark:text-amber-400'
    },
    NOTE: {
      icon: 'Info',
      title: 'नोंद (Note)',
      containerClass: 'bg-[var(--callout-note-bg)] border-[var(--callout-note-border)] text-slate-900 dark:text-slate-100',
      iconClass: 'text-slate-600 dark:text-slate-400'
    }
  };

  const current = configs[normalizedType] || configs.NOTE;

  return (
    <div
      role="region"
      aria-label={current.title}
      className={`my-6 rounded-xl border p-4.5 transition-all ${current.containerClass}`}
    >
      <div className="flex items-center gap-2.5 font-bold text-sm mb-2">
        <LucideIcon name={current.icon} size={20} className={current.iconClass} />
        <span>{current.title}</span>
      </div>
      <div className="text-sm sm:text-base leading-relaxed pl-7 [&>p:last-child]:mb-0 [&>p]:mb-2">
        {children}
      </div>
    </div>
  );
};
