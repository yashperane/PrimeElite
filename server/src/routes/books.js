import express from 'express';
import {
  getAdminBooks,
  getAdminBookById,
  createBook,
  updateBook,
  softDeleteBook,
  reorderBooks,
  exportBook,
  createBookSchema,
  updateBookSchema
} from '../controllers/bookController.js';
import {
  createChapter,
  reorderChapters,
  importChapters,
  createChapterSchema
} from '../controllers/chapterController.js';
import {
  getBookRevisions,
  getBookActivity,
  createBookSnapshot,
  getBookSnapshots,
  getBookSnapshotById,
  restoreBookSnapshot,
  exportBookSnapshot
} from '../controllers/historyController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(requireAdmin);

// Reorder books
router.patch('/reorder', reorderBooks);

// Book CRUD
router.get('/', getAdminBooks);
router.post('/', validate(createBookSchema), createBook);
router.get('/:id', getAdminBookById);
router.put('/:id', validate(updateBookSchema), updateBook);
router.delete('/:id', softDeleteBook);
router.get('/:id/export', exportBook);

// Chapters under Book
router.post('/:bookId/chapters', validate(createChapterSchema), createChapter);
router.patch('/:id/chapters/reorder', reorderChapters);
router.post('/:id/chapters/import', importChapters);

// Book History & Snapshots
router.get('/:id/revisions', getBookRevisions);
router.get('/:id/activity', getBookActivity);
router.post('/:id/snapshots', createBookSnapshot);
router.get('/:id/snapshots', getBookSnapshots);
router.get('/:id/snapshots/:snapId', getBookSnapshotById);
router.post('/:id/snapshots/:snapId/restore', restoreBookSnapshot);
router.get('/:id/snapshots/:snapId/export', exportBookSnapshot);

export default router;
