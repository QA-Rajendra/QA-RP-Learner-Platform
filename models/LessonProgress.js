import mongoose from 'mongoose';

const LessonProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    watchedDuration: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.LessonProgress || mongoose.model('LessonProgress', LessonProgressSchema);
