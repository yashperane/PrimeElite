/**
 * Formats book or snapshot data into whole-book Markdown or JSON
 */
export function formatBookAsMarkdown(bookData, chapters = []) {
  let md = `# ${bookData.title}\n\n`;
  if (bookData.author) md += `**Author:** ${bookData.author}\n\n`;
  if (bookData.description) md += `*${bookData.description}*\n\n`;
  md += `---\n\n`;

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  sortedChapters.forEach((ch, idx) => {
    md += `# ${ch.title}\n\n`;
    if (ch.content) {
      md += `${ch.content.trim()}\n\n`;
    }
    if (idx < sortedChapters.length - 1) {
      md += `---\n\n`;
    }
  });

  return md;
}

export function formatBookAsJson(bookData, chapters = []) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      platform: 'PRIME ELITE',
      book: {
        title: bookData.title,
        slug: bookData.slug,
        description: bookData.description,
        author: bookData.author,
        coverIcon: bookData.coverIcon,
        coverColor: bookData.coverColor,
        language: bookData.language,
        status: bookData.status
      },
      chapters: chapters.map((c) => ({
        title: c.title,
        slug: c.slug,
        order: c.order,
        status: c.status,
        readingTimeMin: c.readingTimeMin,
        content: c.content
      }))
    },
    null,
    2
  );
}
