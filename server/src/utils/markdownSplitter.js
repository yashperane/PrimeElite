import slugify from 'slugify';

/**
 * Splits raw markdown into individual chapters by top-level "# " headings
 */
export function splitMarkdownIntoChapters(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') return [];

  // Normalize line endings
  const normalized = markdownText.replace(/\r\n/g, '\n');
  
  // Split on lines starting with "# "
  // Regex looks for start of string or newline followed by # and space
  const lines = normalized.split('\n');
  const chapters = [];
  let currentTitle = '';
  let currentLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      if (currentTitle || currentLines.length > 0) {
        chapters.push({
          title: currentTitle || 'Untitled Chapter',
          content: currentLines.join('\n').trim()
        });
      }
      currentTitle = line.substring(2).trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Push last chapter
  if (currentTitle || currentLines.length > 0) {
    chapters.push({
      title: currentTitle || 'Untitled Chapter',
      content: currentLines.join('\n').trim()
    });
  }

  return chapters;
}

export function generateSlug(text) {
  if (!text) return 'untitled';
  // Check if text is non-latin (like Devanagari)
  const asciiSlug = slugify(text, { lower: true, strict: true });
  if (asciiSlug) return asciiSlug;
  
  // For Devanagari / Unicode characters:
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}
