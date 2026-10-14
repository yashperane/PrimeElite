import { z } from 'zod';
import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { BookRevision } from '../models/BookRevision.js';
import { BookSnapshot } from '../models/BookSnapshot.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { generateSlug } from '../utils/markdownSplitter.js';
import { formatBookAsMarkdown, formatBookAsJson } from '../utils/exporter.js';

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Book title is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    coverIcon: z.string().optional(),
    coverColor: z.string().optional(),
    language: z.string().optional(),
    status: z.enum(['draft', 'published']).optional()
  })
});

export const updateBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Book title is required').optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    coverIcon: z.string().optional(),
    coverColor: z.string().optional(),
    language: z.string().optional(),
    status: z.enum(['draft', 'published']).optional()
  })
});

export const getAdminBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ deletedAt: null }).sort({ order: 1, createdAt: -1 });
    
    // Add chapter count for each
    const booksWithCount = await Promise.all(
      books.map(async (book) => {
        const chapterCount = await Chapter.countDocuments({ book: book._id, deletedAt: null });
        return {
          ...book.toObject(),
          chapterCount
        };
      })
    );

    res.json({ success: true, data: booksWithCount });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const chapters = await Chapter.find({ book: id, deletedAt: null }).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        book,
        chapters
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const { title, slug, description, author, coverIcon, coverColor, language, status } = req.body;

    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);

    // Verify slug uniqueness
    const existing = await Book.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Determine order (last in list)
    const count = await Book.countDocuments({ deletedAt: null });

    const newBook = new Book({
      title,
      slug: finalSlug,
      description: description || '',
      author: author || 'Prime Elite Author',
      coverIcon: coverIcon || 'BookOpen',
      coverColor: coverColor || '#3b82f6',
      language: language || 'mr',
      status: status || 'draft',
      order: count
    });

    await newBook.save();

    // 1. Create BookRevision
    await BookRevision.create({
      book: newBook._id,
      title: newBook.title,
      slug: newBook.slug,
      description: newBook.description,
      author: newBook.author,
      coverIcon: newBook.coverIcon,
      coverColor: newBook.coverColor,
      language: newBook.language,
      status: newBook.status
    });

    // 2. Create ActivityLog
    await ActivityLog.create({
      book: newBook._id,
      action: 'book_created',
      summary: `Book "${newBook.title}" created with status "${newBook.status}"`
    });

    res.status(201).json({ success: true, data: newBook });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const { title, slug, description, author, coverIcon, coverColor, language, status } = req.body;

    const previousStatus = book.status;

    if (title !== undefined) book.title = title;
    if (description !== undefined) book.description = description;
    if (author !== undefined) book.author = author;
    if (coverIcon !== undefined) book.coverIcon = coverIcon;
    if (coverColor !== undefined) book.coverColor = coverColor;
    if (language !== undefined) book.language = language;

    if (slug !== undefined && slug !== book.slug) {
      const formattedSlug = generateSlug(slug);
      const conflict = await Book.findOne({ slug: formattedSlug, _id: { $ne: book._id } });
      if (conflict) {
        return res.status(400).json({ success: false, error: `Slug "${formattedSlug}" is already in use by another book.` });
      }
      book.slug = formattedSlug;
    }

    let statusChanged = false;
    if (status !== undefined && status !== book.status) {
      book.status = status;
      statusChanged = true;
    }

    await book.save();

    // 1. Store BookRevision
    await BookRevision.create({
      book: book._id,
      title: book.title,
      slug: book.slug,
      description: book.description,
      author: book.author,
      coverIcon: book.coverIcon,
      coverColor: book.coverColor,
      language: book.language,
      status: book.status
    });

    // 2. Store ActivityLog
    if (statusChanged) {
      const actionType = book.status === 'published' ? 'book_published' : 'book_unpublished';
      await ActivityLog.create({
        book: book._id,
        action: actionType,
        summary: `Book status changed to "${book.status}"`
      });
    } else {
      await ActivityLog.create({
        book: book._id,
        action: 'book_updated',
        summary: `Book details updated for "${book.title}"`
      });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

export const softDeleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id, deletedAt: null });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    book.deletedAt = new Date();
    await book.save();

    // Also soft-delete all chapters under this book
    await Chapter.updateMany({ book: book._id, deletedAt: null }, { deletedAt: new Date() });

    await ActivityLog.create({
      book: book._id,
      action: 'book_trashed',
      summary: `Book "${book.title}" moved to trash`
    });

    res.json({ success: true, message: 'Book moved to trash' });
  } catch (error) {
    next(error);
  }
};

export const reorderBooks = async (req, res, next) => {
  try {
    const { bookIds } = req.body; // array of IDs in new order
    if (!Array.isArray(bookIds)) {
      return res.status(400).json({ success: false, error: 'bookIds must be an array' });
    }

    const updates = bookIds.map((id, index) =>
      Book.updateOne({ _id: id }, { $set: { order: index } })
    );

    await Promise.all(updates);

    res.json({ success: true, message: 'Books reordered successfully' });
  } catch (error) {
    next(error);
  }
};

export const exportBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const chapters = await Chapter.find({ book: id, deletedAt: null }).sort({ order: 1 });

    if (format === 'md') {
      const mdContent = formatBookAsMarkdown(book, chapters);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${book.slug}.md"`);
      return res.send(mdContent);
    }

    const jsonContent = formatBookAsJson(book, chapters);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${book.slug}.json"`);
    return res.send(jsonContent);
  } catch (error) {
    next(error);
  }
};
