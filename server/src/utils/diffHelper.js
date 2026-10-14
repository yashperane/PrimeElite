import * as Diff from 'diff';

/**
 * Generates line-by-line diff comparing oldContent and newContent
 */
export function generateLineDiff(oldContent = '', newContent = '') {
  const changes = Diff.diffLines(oldContent, newContent, { newlineIsToken: false });
  return changes.map((part) => ({
    added: Boolean(part.added),
    removed: Boolean(part.removed),
    value: part.value,
    count: part.count || 0
  }));
}
