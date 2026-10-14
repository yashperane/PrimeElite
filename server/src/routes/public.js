import express from 'express';
import {
  getHealth,
  getPublicBooks,
  getPublicBookBySlug,
  getPublicChapterBySlug,
  searchPublishedChapters
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/books', getPublicBooks);
router.get('/books/:slug', getPublicBookBySlug);
router.get('/books/:bookSlug/chapters/:chapterSlug', getPublicChapterBySlug);
router.get('/search', searchPublishedChapters);

export default router;
