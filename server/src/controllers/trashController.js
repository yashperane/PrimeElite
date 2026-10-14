import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { BookSnapshot } from '../models/BookSnapshot.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const getTrashItems = async (req, res, next) => {
  try {
    const books = await Book.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 });
    const chapters = await Chapter.find({ deletedAt: { $ne: null } })
      .populate('book', 'title slug')
      .sort({ deletedAt: -1 });

    res.json({
      success: true,
      data: {
        books,
        chapters
      }
    });
  } catch (error) {
    next(error);
  }
};

export const restoreBookFromTrash = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found in trash' });
    }

    book.deletedAt = null;
    await book.save();

    // Also restore its chapters that were deleted at or around the same time
    await Chapter.updateMany({ book: book._id }, { deletedAt: null });

    await ActivityLog.create({
      book: book._id,
      action: 'book_restored',
      summary: `Book "${book.title}" and its chapters restored from trash`
    });

    res.json({ success: true, message: 'Book restored successfully', data: book });
  } catch (error) {
    next(error);
  }
};

export const restoreChapterFromTrash = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findOne({ _id: id, deletedAt: { $ne: null } }).populate('book');
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found in trash' });
    }

    // Ensure the parent book is not in trash
    if (chapter.book.deletedAt !== null) {
      return res.status(400).json({
        success: false,
        error: 'Cannot restore chapter because its parent book is in trash. Restore the book first.'
      });
    }

    chapter.deletedAt = null;
    await chapter.save();

    await ActivityLog.create({
      book: chapter.book._id,
      chapter: chapter._id,
      action: 'chapter_restored',
      summary: `Chapter "${chapter.title}" restored from trash`
    });

    res.json({ success: true, message: 'Chapter restored successfully', data: chapter });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const confirmTitle = req.body?.confirmTitle || req.query?.confirmTitle;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    if (!confirmTitle || confirmTitle.trim() !== book.title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation failed: typed title does not match book title'
      });
    }

    // Take a snapshot of the book before permanent deletion so content is NEVER lost
    const chapters = await Chapter.find({ book: book._id });
    await BookSnapshot.create({
      book: book._id,
      label: `Archived Snapshot before Permanent Deletion of Book (${new Date().toLocaleString()})`,
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
      action: 'book_trashed',
      summary: `Book "${book.title}" was permanently removed from active table (snapshot retained)`
    });

    // Delete active book & chapter documents. Notice history documents (BookSnapshot, ActivityLog, ChapterRevision) are KEPT!
    await Chapter.deleteMany({ book: book._id });
    await Book.deleteOne({ _id: book._id });

    res.json({
      success: true,
      message: 'Book permanently deleted from active list. Snapshot and history preserved.'
    });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteChapter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const confirmTitle = req.body?.confirmTitle || req.query?.confirmTitle;

    const chapter = await Chapter.findById(id).populate('book');
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    if (!confirmTitle || confirmTitle.trim() !== chapter.title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation failed: typed title does not match chapter title'
      });
    }

    // Delete active chapter document. Chapter revisions & activity logs are KEPT!
    await ActivityLog.create({
      book: chapter.book._id,
      chapter: chapter._id,
      action: 'chapter_trashed',
      summary: `Chapter "${chapter.title}" permanently removed from active list (revisions retained)`
    });

    await Chapter.deleteOne({ _id: chapter._id });

    res.json({
      success: true,
      message: 'Chapter permanently deleted from active list. Revisions preserved.'
    });
  } catch (error) {
    next(error);
  }
};
