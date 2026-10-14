import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required']
    },
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Chapter slug is required'],
      trim: true,
      lowercase: true
    },
    order: {
      type: Number,
      default: 0
    },
    content: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    readingTimeMin: {
      type: Number,
      default: 1
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

chapterSchema.index({ book: 1, slug: 1 }, { unique: true });
chapterSchema.index({ book: 1, status: 1, deletedAt: 1, order: 1 });
chapterSchema.index({ title: 'text', content: 'text' });

export const Chapter = mongoose.model('Chapter', chapterSchema);
