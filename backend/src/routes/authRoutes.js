import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const emailRule = body('email').isEmail().normalizeEmail();
const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

router.post('/register', [emailRule, passwordRule, body('name').optional().trim()], register);
router.post('/login', [emailRule, passwordRule], login);
router.get('/me', requireAuth, me);

router.patch(
  '/profile',
  requireAuth,
  [
    body('name').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('currentPassword').optional().isString(),
    body('newPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  updateProfile
);

export default router;
