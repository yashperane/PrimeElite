import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // relaxed so users and owner are not locked out during setup
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many attempts. Please try again later.'
  }
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000, // relaxed for smooth personal & admin operations
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.'
  }
});
