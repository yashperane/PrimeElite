import express from 'express';
import multer from 'multer';
import { isCloudinaryConfigured, cloudinary } from '../config/cloudinary.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const uploadImage = [
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!isCloudinaryConfigured) {
        return res.status(400).json({
          success: false,
          error: 'Cloudinary environment variables not configured. Please paste an image URL instead.'
        });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file uploaded' });
      }

      // Upload buffer to Cloudinary
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'prime-elite-books' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

      const result = await uploadStream();

      res.json({
        success: true,
        url: result.secure_url
      });
    } catch (error) {
      next(error);
    }
  }
];
