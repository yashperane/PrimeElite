import { Chapter } from '../models/Chapter.js';
import { Book } from '../models/Book.js';
import { ChapterRevision } from '../models/ChapterRevision.js';
import { BookRevision } from '../models/BookRevision.js';
import { BookSnapshot } from '../models/BookSnapshot.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { generateLineDiff } from '../utils/diffHelper.js';
import { calculateReadingTime, getWordCount } from '../utils/readingTime.js';
import { formatBookAsMarkdown, formatBookAsJson } from '../utils/exporter.js';

// --- CHAPTER REVISIONS ---

export const getChapterRevisions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await ChapterRevision.countDocuments({ chapter: id });
    const revisions = await ChapterRevision.find({ chapter: id })
      .select('title status wordCount source savedAt')
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        revisions,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterRevisionById = async (req, res, next) => {
  try {
    const { id, revId } = req.params;
    const revision = await ChapterRevision.findOne({ _id: revId, chapter: id });
    if (!revision) {
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }
    res.json({ success: true, data: revision });
  } catch (error) {
    next(error);
  }
};

export const getChapterRevisionDiff = async (req, res, next) => {
  try {
    const { id, revId } = req.params;
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const revision = await ChapterRevision.findOne({ _id: revId, chapter: id });
    if (!revision) {
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }

    // Compare revision (old) with current chapter content (new)
    const diff = generateLineDiff(revision.content, chapter.content);

    res.json({
      success: true,
      data: {
        revision,
        currentContent: chapter.content,
        diff
      }
    });
  } catch (error) {
    next(error);
  }
};

export const restoreChapterRevision = async (req, res, next) => {
  try {
    const { id, revId } = req.params;
    const chapter = await Chapter.findOne({ _id: id, deletedAt: null });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const revision = await ChapterRevision.findOne({ _id: revId, chapter: id });
    if (!revision) {
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }

    // Restoring creates a NEW revision, never overwrites older revisions
    chapter.title = revision.title;
    chapter.content = revision.content;
    chapter.status = revision.status;
    chapter.readingTimeMin = calculateReadingTime(revision.content);
    await chapter.save();

    await ChapterRevision.create({
      chapter: chapter._id,
      book: chapter.book,
      title: chapter.title,
      content: chapter.content,
      status: chapter.status,
      wordCount: getWordCount(chapter.content),
      source: 'restore'
    });

    await ActivityLog.create({
      book: chapter.book,
      chapter: chapter._id,
      action: 'revision_restored',
      summary: `Restored chapter revision from ${new Date(revision.savedAt).toLocaleString()}`
    });

    res.json({
      success: true,
      message: 'Chapter restored from revision successfully',
      data: chapter
    });
  } catch (error) {
    next(error);
  }
};

// --- BOOK REVISIONS & ACTIVITY ---

export const getBookRevisions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const revisions = await BookRevision.find({ book: id }).sort({ savedAt: -1 });
    res.json({ success: true, data: revisions });
  } catch (error) {
    next(error);
  }
};

export const getBookActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { book: id };
    if (action) {
      filter.action = action;
    }

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .populate('chapter', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        logs,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- BOOK SNAPSHOTS ---

export const createBookSnapshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label } = req.body;

    const book = await Book.findOne({ _id: id, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const chapters = await Chapter.find({ book: id, deletedAt: null }).sort({ order: 1 });

    const snapshot = await BookSnapshot.create({
      book: book._id,
      label: label ? label.trim() : 'Manual snapshot',
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
      chapters: chapters.map((ch) => ({
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        status: ch.status,
        content: ch.content,
        readingTimeMin: ch.readingTimeMin
      }))
    });

    await ActivityLog.create({
      book: book._id,
      action: 'snapshot_created',
      summary: `Created snapshot version "${snapshot.label}"`
    });

    res.status(201).json({ success: true, data: snapshot });
  } catch (error) {
    next(error);
  }
};

export const getBookSnapshots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const snapshots = await BookSnapshot.find({ book: id })
      .select('label savedAt bookData.title chapters.title')
      .sort({ savedAt: -1 });

    // Map to include chapter count
    const list = snapshots.map((s) => ({
      _id: s._id,
      label: s.label,
      savedAt: s.savedAt,
      title: s.bookData?.title,
      chapterCount: s.chapters?.length || 0
    }));

    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const getBookSnapshotById = async (req, res, next) => {
  try {
    const { id, snapId } = req.params;
    const snapshot = await BookSnapshot.findOne({ _id: snapId, book: id });
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Snapshot not found' });
    }
    res.json({ success: true, data: snapshot });
  } catch (error) {
    next(error);
  }
};

export const restoreBookSnapshot = async (req, res, next) => {
  try {
    const { id, snapId } = req.params;
    const book = await Book.findOne({ _id: id, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const snapshot = await BookSnapshot.findOne({ _id: snapId, book: id });
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Snapshot not found' });
    }

    // 1. Take a snapshot of the current state FIRST before restoring
    const currentChapters = await Chapter.find({ book: id, deletedAt: null }).sort({ order: 1 });
    await BookSnapshot.create({
      book: book._id,
      label: `Auto-snapshot before restoring "${snapshot.label || 'Snapshot'}" (${new Date().toLocaleString()})`,
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
      chapters: currentChapters.map((ch) => ({
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        status: ch.status,
        content: ch.content,
        readingTimeMin: ch.readingTimeMin
      }))
    });

    // 2. Restore book metadata
    book.title = snapshot.bookData.title;
    book.description = snapshot.bookData.description;
    book.author = snapshot.bookData.author;
    book.coverIcon = snapshot.bookData.coverIcon;
    book.coverColor = snapshot.bookData.coverColor;
    book.language = snapshot.bookData.language;
    book.status = snapshot.bookData.status;
    await book.save();

    // 3. Mark existing chapters as deleted/archived
    await Chapter.updateMany({ book: id, deletedAt: null }, { deletedAt: new Date() });

    // 4. Recreate chapters from snapshot
    const newChapters = [];
    for (const ch of snapshot.chapters) {
      const created = new Chapter({
        book: id,
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        status: ch.status,
        content: ch.content,
        readingTimeMin: ch.readingTimeMin || calculateReadingTime(ch.content)
      });
      await created.save();

      await ChapterRevision.create({
        chapter: created._id,
        book: id,
        title: created.title,
        content: created.content,
        status: created.status,
        wordCount: getWordCount(created.content),
        source: 'restore'
      });

      newChapters.push(created);
    }

    await ActivityLog.create({
      book: id,
      action: 'snapshot_restored',
      summary: `Restored book snapshot "${snapshot.label}" (${newChapters.length} chapters restored)`
    });

    res.json({
      success: true,
      message: 'Snapshot restored successfully',
      data: {
        book,
        chapters: newChapters
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportBookSnapshot = async (req, res, next) => {
  try {
    const { id, snapId } = req.params;
    const { format = 'json' } = req.query;

    const snapshot = await BookSnapshot.findOne({ _id: snapId, book: id });
    if (!snapshot) {
      return res.status(404).json({ success: false, error: 'Snapshot not found' });
    }

    if (format === 'md') {
      const mdContent = formatBookAsMarkdown(snapshot.bookData, snapshot.chapters);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${snapshot.bookData.slug}-snapshot.md"`);
      return res.send(mdContent);
    }

    const jsonContent = formatBookAsJson(snapshot.bookData, snapshot.chapters);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${snapshot.bookData.slug}-snapshot.json"`);
    return res.send(jsonContent);
  } catch (error) {
    next(error);
  }
};
