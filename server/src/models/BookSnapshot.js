import mongoose from 'mongoose';

const snapshotChapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    content: { type: String, default: '' },
    readingTimeMin: { type: Number, default: 1 }
  },
  { _id: false }
);

const bookSnapshotSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    label: {
      type: String,
      default: '',
      trim: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    bookData: {
      title: { type: String, required: true },
      slug: { type: String, required: true },
      description: { type: String, default: '' },
      author: { type: String, default: '' },
      coverIcon: { type: String, default: 'BookOpen' },
      coverColor: { type: String, default: '#3b82f6' },
      language: { type: String, default: 'mr' },
      status: { type: String, enum: ['draft', 'published'], default: 'draft' },
      order: { type: Number, default: 0 }
    },
    chapters: [snapshotChapterSchema]
  },
  {
    timestamps: true
  }
);

bookSnapshotSchema.index({ book: 1, savedAt: -1 });

export const BookSnapshot = mongoose.model('BookSnapshot', bookSnapshotSchema);
