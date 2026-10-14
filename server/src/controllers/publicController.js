import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';

export const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PRIME ELITE API'
  });
};

export const getPublicBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      status: 'published',
      deletedAt: null
    }).sort({ order: 1, createdAt: -1 });

    const booksWithCount = await Promise.all(
      books.map(async (book) => {
        const chapterCount = await Chapter.countDocuments({
          book: book._id,
          status: 'published',
          deletedAt: null
        });
        return {
          _id: book._id,
          title: book.title,
          slug: book.slug,
          description: book.description,
          author: book.author,
          coverIcon: book.coverIcon,
          coverColor: book.coverColor,
          language: book.language,
          chapterCount,
          createdAt: book.createdAt
        };
      })
    );

    res.json({ success: true, data: booksWithCount });
  } catch (error) {
    next(error);
  }
};

export const getPublicBookBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const book = await Book.findOne({
      slug,
      status: 'published',
      deletedAt: null
    });

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    // Chapters without heavy content field for fast loading
    const chapters = await Chapter.find({
      book: book._id,
      status: 'published',
      deletedAt: null
    })
      .select('title slug order readingTimeMin createdAt')
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        book: {
          _id: book._id,
          title: book.title,
          slug: book.slug,
          description: book.description,
          author: book.author,
          coverIcon: book.coverIcon,
          coverColor: book.coverColor,
          language: book.language,
          chapterCount: chapters.length,
          createdAt: book.createdAt
        },
        chapters
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicChapterBySlug = async (req, res, next) => {
  try {
    const { bookSlug, chapterSlug } = req.params;

    const book = await Book.findOne({
      slug: bookSlug,
      status: 'published',
      deletedAt: null
    });

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const chapter = await Chapter.findOne({
      book: book._id,
      slug: chapterSlug,
      status: 'published',
      deletedAt: null
    });

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    // Find previous and next chapters
    const allChapters = await Chapter.find({
      book: book._id,
      status: 'published',
      deletedAt: null
    })
      .select('title slug order')
      .sort({ order: 1, createdAt: 1 });

    const currentIndex = allChapters.findIndex((c) => c._id.toString() === chapter._id.toString());
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    res.json({
      success: true,
      data: {
        book: {
          _id: book._id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          coverIcon: book.coverIcon,
          coverColor: book.coverColor
        },
        chapter: {
          _id: chapter._id,
          title: chapter.title,
          slug: chapter.slug,
          order: chapter.order,
          readingTimeMin: chapter.readingTimeMin,
          content: chapter.content,
          updatedAt: chapter.updatedAt
        },
        navigation: {
          prev: prevChapter ? { title: prevChapter.title, slug: prevChapter.slug } : null,
          next: nextChapter ? { title: nextChapter.title, slug: nextChapter.slug } : null,
          currentIndex: currentIndex + 1,
          totalChapters: allChapters.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchPublishedChapters = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = q.trim();

    // Query published non-deleted books first
    const publishedBooks = await Book.find({ status: 'published', deletedAt: null }).select('_id slug title');
    const bookIds = publishedBooks.map((b) => b._id);
    const bookMap = {};
    publishedBooks.forEach((b) => {
      bookMap[b._id.toString()] = b;
    });

    // Search across published chapters in published books using regex / text match
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const chapters = await Chapter.find({
      book: { $in: bookIds },
      status: 'published',
      deletedAt: null,
      $or: [{ title: regex }, { content: regex }]
    })
      .select('title slug content book readingTimeMin order')
      .limit(30);

    const results = chapters.map((ch) => {
      const book = bookMap[ch.book.toString()];
      // Extract snippet around match
      let snippet = '';
      const lowerContent = ch.content.toLowerCase();
      const matchPos = lowerContent.indexOf(searchTerm.toLowerCase());
      if (matchPos !== -1) {
        const start = Math.max(0, matchPos - 60);
        const end = Math.min(ch.content.length, matchPos + searchTerm.length + 60);
        snippet = (start > 0 ? '...' : '') + ch.content.slice(start, end).replace(/\n/g, ' ') + (end < ch.content.length ? '...' : '');
      } else {
        snippet = ch.content.slice(0, 120).replace(/\n/g, ' ') + '...';
      }

      return {
        _id: ch._id,
        title: ch.title,
        slug: ch.slug,
        snippet,
        readingTimeMin: ch.readingTimeMin,
        book: {
          title: book ? book.title : '',
          slug: book ? book.slug : ''
        }
      };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
