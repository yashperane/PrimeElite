import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    // Raw password stored temporarily as requested by the owner
    rawPassword: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Admin = mongoose.model('Admin', adminSchema);
