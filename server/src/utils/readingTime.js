/**
 * Calculates reading time in minutes for markdown text, taking Devanagari/Unicode word structure into account.
 * Standard assumption is ~180-200 words per minute for Indian scripts.
 */
export function calculateReadingTime(text) {
  if (!text || typeof text !== 'string') return 1;

  // Strip markdown formatting symbols
  const clean = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[#*`_~>\-+=|{}[\]()]/g, ' ')
    .trim();

  // Match words across unicode / devanagari
  const words = clean.split(/\s+/).filter(Boolean);
  const count = words.length;

  if (count === 0) return 1;

  const wpm = 180;
  const minutes = Math.ceil(count / wpm);
  return Math.max(1, minutes);
}

export function getWordCount(text) {
  if (!text || typeof text !== 'string') return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
