import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    courseId: { type: String, required: true },
    courseTitle: { type: String, default: "" },
    courseThumbnail: { type: String, default: "" },
    progress: { type: Number, default: 0 }, // 0 to 100
    completedLessons: [{ type: String }],
    totalLessons: { type: Number, default: 0 },
    lastLessonId: { type: String, default: "" },
    status: { type: String, enum: ['Enrolled', 'In Progress', 'Completed'], default: 'In Progress' },
    enrolledAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

EnrollmentSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);
