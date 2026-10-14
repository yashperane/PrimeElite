import React from 'react';
import { LucideIcon } from './LucideIcon.jsx';

export const DiffViewer = ({ diff = [], oldTitle = 'मागील आवृत्ती (Revision)', newTitle = 'सध्याचा मजकूर (Current)' }) => {
  if (!diff || diff.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-theme-muted">
        कोणतेही बदल आढळले नाहीत (सारखाच मजकूर).
      </div>
    );
  }

  return (
    <div className="border border-theme-border rounded-lg overflow-hidden text-xs font-mono">
      <div className="grid grid-cols-2 bg-theme-bg p-2.5 border-b border-theme-border text-theme-muted font-sans font-medium">
        <div className="flex items-center gap-1.5">
          <LucideIcon name="RotateCcw" size={14} />
          <span>{oldTitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LucideIcon name="FileText" size={14} />
          <span>{newTitle}</span>
        </div>
      </div>
      <div className="max-h-[65vh] overflow-y-auto divide-y divide-theme-border/50 bg-theme-card">
        {diff.map((part, index) => {
          let bgClass = 'bg-transparent text-theme-text';
          let sign = ' ';
          if (part.added) {
            bgClass = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-500';
            sign = '+';
          } else if (part.removed) {
            bgClass = 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-l-4 border-rose-500';
            sign = '-';
          }

          return (
            <div key={index} className={`p-2 flex gap-3 whitespace-pre-wrap break-all ${bgClass}`}>
              <span className="select-none font-bold opacity-60 w-3">{sign}</span>
              <span className="flex-1">{part.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
