import React from 'react';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const ChapterEditorToolbar = ({ onInsert, onInsertCallout, onInsertImage }) => {
  const tools = [
    { label: 'Bold', icon: 'Bold', action: () => onInsert('**', '**', 'ठळक मजकूर') },
    { label: 'Italic', icon: 'Italic', action: () => onInsert('*', '*', 'तिरका मजकूर') },
    { label: 'Heading 2', icon: 'Heading2', action: () => onInsert('\n## ', '\n', 'शीर्षक २') },
    { label: 'Heading 3', icon: 'Heading3', action: () => onInsert('\n### ', '\n', 'शीर्षक ३') },
    { label: 'Bullet List', icon: 'List', action: () => onInsert('\n- ', '\n', 'यादी घटक') },
    { label: 'Numbered List', icon: 'ListOrdered', action: () => onInsert('\n1. ', '\n', 'क्रमांकित घटक') },
    { label: 'Quote', icon: 'Quote', action: () => onInsert('\n> ', '\n', 'अवतरण मजकूर') },
    { label: 'Link', icon: 'Link', action: () => onInsert('[लिंक नाव](', ')', 'https://example.com') },
    {
      label: 'Table',
      icon: 'Table',
      action: () =>
        onInsert(
          '\n| स्तंभ १ | स्तंभ २ | स्तंभ ३ |\n| :--- | :--- | :--- |\n| माहिती १ | माहिती २ | माहिती ३ |\n'
        )
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-theme-border bg-theme-card mb-3">
      {/* Basic Formatting */}
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          onClick={tool.action}
          className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          title={tool.label}
          aria-label={tool.label}
        >
          <LucideIcon name={tool.icon} size={16} />
        </button>
      ))}

      {/* Image button */}
      <button
        type="button"
        onClick={onInsertImage}
        className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
        title="प्रतिमा जोडा (Image)"
        aria-label="Insert Image"
      >
        <LucideIcon name="Image" size={16} />
      </button>

      <div className="h-5 w-px bg-theme-border mx-1" />

      {/* One-tap Callout Inserts */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onInsertCallout('TIP')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:opacity-90 flex items-center gap-1"
          title="टीप ब्लॉक जोडा"
        >
          <LucideIcon name="Lightbulb" size={13} />
          <span>TIP</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertCallout('EXAMPLE')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200 border border-sky-200 dark:border-sky-800 hover:opacity-90 flex items-center gap-1"
          title="वास्तविक उदाहरण ब्लॉक जोडा"
        >
          <LucideIcon name="BookOpenCheck" size={13} />
          <span>EXAMPLE</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertCallout('WARNING')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:opacity-90 flex items-center gap-1"
          title="सावधान ब्लॉक जोडा"
        >
          <LucideIcon name="TriangleAlert" size={13} />
          <span>WARNING</span>
        </button>

        <button
          type="button"
          onClick={() => onInsertCallout('NOTE')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:opacity-90 flex items-center gap-1"
          title="नोंद ब्लॉक जोडा"
        >
          <LucideIcon name="Info" size={13} />
          <span>NOTE</span>
        </button>
      </div>
    </div>
  );
};
