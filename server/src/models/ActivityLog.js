import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null
    },
    action: {
      type: String,
      enum: [
        'book_created',
        'book_updated',
        'book_published',
        'book_unpublished',
        'book_trashed',
        'book_restored',
        'chapter_created',
        'chapter_updated',
        'chapter_trashed',
        'chapter_restored',
        'chapters_reordered',
        'chapters_imported',
        'snapshot_created',
        'snapshot_restored',
        'revision_restored'
      ],
      required: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

activityLogSchema.index({ book: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
