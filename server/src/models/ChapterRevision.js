import mongoose from 'mongoose';

const chapterRevisionSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter reference is required']
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    wordCount: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      enum: ['manual-save', 'autosave', 'import', 'restore', 'create'],
      required: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

chapterRevisionSchema.index({ chapter: 1, savedAt: -1 });
chapterRevisionSchema.index({ book: 1, savedAt: -1 });

export const ChapterRevision = mongoose.model('ChapterRevision', chapterRevisionSchema);
