import express from 'express';
import { login, register, logout, getMe, loginSchema, registerSchema } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', validate(registerSchema), register);
router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAdmin, getMe);

export default router;
