import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAnalysis,
  getAnalysis,
  listAnalyses,
} from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('inputText').isString().trim().notEmpty(),
    body('companyName').optional().isString().trim(),
  ],
  createAnalysis
);

router.get('/', listAnalyses);
router.get('/:id', getAnalysis);

export default router;
