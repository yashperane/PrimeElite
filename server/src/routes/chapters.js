import express from 'express';
import {
  getChapterById,
  updateChapter,
  softDeleteChapter,
  updateChapterSchema
} from '../controllers/chapterController.js';
import {
  getChapterRevisions,
  getChapterRevisionById,
  getChapterRevisionDiff,
  restoreChapterRevision
} from '../controllers/historyController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(requireAdmin);

// Chapter CRUD
router.get('/:id', getChapterById);
router.put('/:id', validate(updateChapterSchema), updateChapter);
router.delete('/:id', softDeleteChapter);

// Chapter Revisions
router.get('/:id/revisions', getChapterRevisions);
router.get('/:id/revisions/:revId', getChapterRevisionById);
router.get('/:id/revisions/:revId/diff', getChapterRevisionDiff);
router.post('/:id/restore/:revId', restoreChapterRevision);

export default router;
