import React from 'react';
import { LucideIcon } from './LucideIcon.jsx';

export const EmptyState = ({
  icon = 'BookOpen',
  title = 'कोणतीही माहिती उपलब्ध नाही',
  description = 'सध्या येथे दाखवण्यासाठी काहीही नाही.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-theme-border bg-theme-card/40 my-6">
      <div className="w-14 h-14 rounded-full bg-theme-bg flex items-center justify-center text-theme-muted mb-4 border border-theme-border">
        <LucideIcon name={icon} size={28} />
      </div>
      <h4 className="text-base font-semibold text-theme-text mb-1">{title}</h4>
      <p className="text-sm text-theme-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};
