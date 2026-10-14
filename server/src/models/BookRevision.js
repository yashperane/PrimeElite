import mongoose from 'mongoose';

const bookRevisionSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    author: { type: String, default: '' },
    coverIcon: { type: String, default: 'BookOpen' },
    coverColor: { type: String, default: '#3b82f6' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    language: { type: String, default: 'mr' },
    savedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

bookRevisionSchema.index({ book: 1, savedAt: -1 });

export const BookRevision = mongoose.model('BookRevision', bookRevisionSchema);
