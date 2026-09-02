import mongoose from 'mongoose';

const MediaFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'document', 'other'],
      default: 'image',
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    size: {
      type: Number,
      default: 0,
    },
    sizeFormatted: {
      type: String,
      default: '0 KB',
    },
    category: {
      type: String,
      default: 'General Assets',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

MediaFileSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });
MediaFileSchema.index({ fileType: 1, createdAt: -1 });

export default mongoose.models.MediaFile || mongoose.model('MediaFile', MediaFileSchema);
