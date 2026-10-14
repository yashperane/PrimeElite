import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Book slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    author: {
      type: String,
      default: 'Prime Elite Author',
      trim: true
    },
    coverIcon: {
      type: String,
      default: 'BookOpen',
      trim: true
    },
    coverColor: {
      type: String,
      default: '#3b82f6',
      trim: true
    },
    language: {
      type: String,
      default: 'mr',
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    order: {
      type: Number,
      default: 0
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

bookSchema.index({ status: 1, deletedAt: 1, order: 1 });

export const Book = mongoose.model('Book', bookSchema);
