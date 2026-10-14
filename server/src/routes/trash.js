import express from 'express';
import {
  getTrashItems,
  restoreBookFromTrash,
  restoreChapterFromTrash,
  permanentlyDeleteBook,
  permanentlyDeleteChapter
} from '../controllers/trashController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/trash', getTrashItems);
router.post('/books/:id/restore', restoreBookFromTrash);
router.post('/chapters/:id/restore-from-trash', restoreChapterFromTrash);
router.delete('/books/:id/permanent', permanentlyDeleteBook);
router.delete('/chapters/:id/permanent', permanentlyDeleteChapter);

export default router;
