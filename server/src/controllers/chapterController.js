import { z } from 'zod';
import { Chapter } from '../models/Chapter.js';
import { Book } from '../models/Book.js';
import { ChapterRevision } from '../models/ChapterRevision.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { calculateReadingTime, getWordCount } from '../utils/readingTime.js';
import { generateSlug, splitMarkdownIntoChapters } from '../utils/markdownSplitter.js';
import { generateLineDiff } from '../utils/diffHelper.js';

export const createChapterSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Chapter title is required'),
    slug: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['draft', 'published']).optional()
  })
});

export const updateChapterSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Chapter title is required').optional(),
    slug: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    isAutosave: z.boolean().optional()
  })
});

export const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findOne({ _id: id, deletedAt: null }).populate('book', 'title slug');
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }
    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const createChapter = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { title, slug, content = '', status = 'draft' } = req.body;

    const book = await Book.findOne({ _id: bookId, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);

    // Verify slug uniqueness within this book
    const existing = await Chapter.findOne({ book: bookId, slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await Chapter.countDocuments({ book: bookId, deletedAt: null });
    const readingTime = calculateReadingTime(content);
    const wordCount = getWordCount(content);

    const chapter = new Chapter({
      book: bookId,
      title,
      slug: finalSlug,
      content,
      status,
      order: count,
      readingTimeMin: readingTime
    });

    await chapter.save();

    // 1. Create initial ChapterRevision
    await ChapterRevision.create({
      chapter: chapter._id,
      book: book._id,
      title: chapter.title,
      content: chapter.content,
      status: chapter.status,
      wordCount,
      source: 'create'
    });

    // 2. Activity log
    await ActivityLog.create({
      book: book._id,
      chapter: chapter._id,
      action: 'chapter_created',
      summary: `Chapter "${chapter.title}" created in "${book.title}"`
    });

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, content, status, isAutosave = false } = req.body;

    const chapter = await Chapter.findOne({ _id: id, deletedAt: null });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const book = await Book.findById(chapter.book);

    let contentChanged = false;
    let titleChanged = false;
    let statusChanged = false;

    if (title !== undefined && title !== chapter.title) {
      chapter.title = title;
      titleChanged = true;
    }

    if (slug !== undefined && slug !== chapter.slug) {
      const formattedSlug = generateSlug(slug);
      const conflict = await Chapter.findOne({
        book: chapter.book,
        slug: formattedSlug,
        _id: { $ne: chapter._id }
      });
      if (conflict) {
        return res.status(400).json({ success: false, error: `Slug "${formattedSlug}" already exists in this book.` });
      }
      chapter.slug = formattedSlug;
    }

    if (content !== undefined && content !== chapter.content) {
      chapter.content = content;
      chapter.readingTimeMin = calculateReadingTime(content);
      contentChanged = true;
    }

    if (status !== undefined && status !== chapter.status) {
      chapter.status = status;
      statusChanged = true;
    }

    await chapter.save();

    const wordCount = getWordCount(chapter.content);

    // ChapterRevision logic:
    // Autosave creates a revision ONLY when content actually changed AND >= 5 minutes passed since last autosave revision.
    // Manual save always creates a revision if changes were made or manually requested.
    let shouldCreateRevision = false;
    let revisionSource = 'manual-save';

    if (isAutosave) {
      if (contentChanged) {
        const lastAutosave = await ChapterRevision.findOne({
          chapter: chapter._id,
          source: 'autosave'
        }).sort({ savedAt: -1 });

        const fiveMinutes = 5 * 60 * 1000;
        if (!lastAutosave || Date.now() - new Date(lastAutosave.savedAt).getTime() >= fiveMinutes) {
          shouldCreateRevision = true;
          revisionSource = 'autosave';
        }
      }
    } else {
      // Manual save
      shouldCreateRevision = true;
      revisionSource = 'manual-save';
    }

    if (shouldCreateRevision) {
      await ChapterRevision.create({
        chapter: chapter._id,
        book: chapter.book,
        title: chapter.title,
        content: chapter.content,
        status: chapter.status,
        wordCount,
        source: revisionSource
      });
    }

    // Activity log for manual changes
    if (!isAutosave && (contentChanged || titleChanged || statusChanged)) {
      await ActivityLog.create({
        book: chapter.book,
        chapter: chapter._id,
        action: 'chapter_updated',
        summary: `Chapter "${chapter.title}" updated (${chapter.status})`
      });
    }

    res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

export const softDeleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findOne({ _id: id, deletedAt: null });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    chapter.deletedAt = new Date();
    await chapter.save();

    await ActivityLog.create({
      book: chapter.book,
      chapter: chapter._id,
      action: 'chapter_trashed',
      summary: `Chapter "${chapter.title}" moved to trash`
    });

    res.json({ success: true, message: 'Chapter moved to trash' });
  } catch (error) {
    next(error);
  }
};

export const reorderChapters = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    const { chapterIds } = req.body;

    if (!Array.isArray(chapterIds)) {
      return res.status(400).json({ success: false, error: 'chapterIds must be an array' });
    }

    const updates = chapterIds.map((id, index) =>
      Chapter.updateOne({ _id: id, book: bookId }, { $set: { order: index } })
    );

    await Promise.all(updates);

    await ActivityLog.create({
      book: bookId,
      action: 'chapters_reordered',
      summary: `Reordered ${chapterIds.length} chapters`
    });

    res.json({ success: true, message: 'Chapters reordered successfully' });
  } catch (error) {
    next(error);
  }
};

export const importChapters = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    const { markdown } = req.body;

    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({ success: false, error: 'Markdown content is required for import' });
    }

    const book = await Book.findOne({ _id: bookId, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    // Auto-create snapshot before bulk import
    const existingChapters = await Chapter.find({ book: bookId, deletedAt: null }).sort({ order: 1 });
    await (await import('../models/BookSnapshot.js')).BookSnapshot.create({
      book: book._id,
      label: `Auto-snapshot before importing chapters (${new Date().toLocaleDateString()})`,
      bookData: {
        title: book.title,
        slug: book.slug,
        description: book.description,
        author: book.author,
        coverIcon: book.coverIcon,
        coverColor: book.coverColor,
        language: book.language,
        status: book.status,
        order: book.order
      },
      chapters: existingChapters.map((ch) => ({
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        status: ch.status,
        content: ch.content,
        readingTimeMin: ch.readingTimeMin
      }))
    });

    const parsedChapters = splitMarkdownIntoChapters(markdown);
    if (parsedChapters.length === 0) {
      return res.status(400).json({ success: false, error: 'No chapters detected. Ensure markdown uses top-level "# " headings.' });
    }

    let startOrder = existingChapters.length;
    const createdChapters = [];

    for (const parsed of parsedChapters) {
      let slug = generateSlug(parsed.title);
      const conflict = await Chapter.findOne({ book: bookId, slug });
      if (conflict) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const chapter = new Chapter({
        book: bookId,
        title: parsed.title,
        slug,
        content: parsed.content,
        order: startOrder++,
        status: 'draft',
        readingTimeMin: calculateReadingTime(parsed.content)
      });

      await chapter.save();

      await ChapterRevision.create({
        chapter: chapter._id,
        book: book._id,
        title: chapter.title,
        content: chapter.content,
        status: chapter.status,
        wordCount: getWordCount(chapter.content),
        source: 'import'
      });

      createdChapters.push(chapter);
    }

    await ActivityLog.create({
      book: bookId,
      action: 'chapters_imported',
      summary: `Imported ${createdChapters.length} chapters from Markdown`
    });

    res.json({
      success: true,
      message: `Successfully imported ${createdChapters.length} chapters`,
      data: createdChapters
    });
  } catch (error) {
    next(error);
  }
};
