import React from 'react';
import { LucideIcon } from '../common/LucideIcon.jsx';

export const CURATED_ICONS = [
  'BookOpen',
  'Code2',
  'Terminal',
  'Layers',
  'Library',
  'Sparkles',
  'Cpu',
  'Flame',
  'Globe',
  'Compass',
  'Feather',
  'Bookmark',
  'Lightbulb',
  'FileText',
  'GraduationCap',
  'Rocket'
];

export const CURATED_COLORS = [
  '#2563eb', // Blue
  '#4f46e5', // Indigo
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#0891b2', // Cyan
  '#d97706', // Amber
  '#dc2626', // Red
  '#db2777', // Pink
  '#0f172a'  // Slate dark
];

export const IconPicker = ({ selectedIcon, onSelect }) => {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2">
        कव्हर आयकॉन (Lucide Icon)
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {CURATED_ICONS.map((iconName) => (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelect(iconName)}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
              selectedIcon === iconName
                ? 'border-theme-accent bg-theme-accent/10 text-theme-accent ring-2 ring-theme-accent/30 font-bold'
                : 'border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg'
            }`}
            title={iconName}
          >
            <LucideIcon name={iconName} size={22} />
          </button>
        ))}
      </div>
    </div>
  );
};

export const ColorPicker = ({ selectedColor, onSelect }) => {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2">
        कव्हर रंग (Cover Color)
      </label>
      <div className="flex flex-wrap items-center gap-2.5">
        {CURATED_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${
              selectedColor === color
                ? 'border-theme-text scale-110 shadow-md ring-2 ring-offset-2 ring-theme-accent'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {/* Custom Hex input */}
        <input
          type="color"
          value={selectedColor || '#2563eb'}
          onChange={(e) => onSelect(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
          title="कस्टम रंग निवडा"
        />
      </div>
    </div>
  );
};
