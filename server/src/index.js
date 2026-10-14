import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { requireAdmin } from './middleware/auth.js';
import { uploadImage } from './controllers/uploadController.js';

import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import chapterRoutes from './routes/chapters.js';
import trashRoutes from './routes/trash.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet());

// Cross-origin configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Optional image upload route
app.post('/api/upload', requireAdmin, uploadImage);

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes); // Handles /api/health, /api/books, /api/books/:slug, /api/books/:bookSlug/chapters/:chapterSlug, /api/search
app.use('/api/admin/books', bookRoutes);
app.use('/api/books', bookRoutes); // Also handles admin routes requiring auth
app.use('/api/chapters', chapterRoutes);
app.use('/api', trashRoutes);

// In production, serve the built client application if client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // All non-API GET requests return the index.html for SPA client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[PRIME ELITE Server] listening on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start();
