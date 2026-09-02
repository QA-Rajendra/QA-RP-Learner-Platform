import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    courseTitle: { type: String, default: "" },
    sectionTitle: { type: String, default: "Section 1: Introduction" },
    title: { type: String, required: true },
    lessonNumber: { type: Number, default: 1 },
    type: { type: String, default: 'video' },
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'notes', 'image', 'quiz', 'assignment', 'code', 'article', 'document'],
      default: 'video'
    },
    accessType: { type: String, enum: ['FREE', 'PAID'], default: 'FREE' },
    isPaid: { type: Boolean, default: false },
    feeAmount: { type: Number, default: 499 },
    duration: { type: String, default: '10:00' },
    videoUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    objectives: [{ type: String }],
    attachments: [
      {
        name: String,
        size: String,
        fileType: String,
        url: String,
      }
    ],
    resources: [
      {
        title: String,
        url: String,
      }
    ],
    codeSnippet: { type: String, default: '' },
    terminalCommand: { type: String, default: '' },
    quiz: [
      {
        question: { type: String, default: '' },
        options: [{ type: String }],
        correctAnswerIndex: { type: Number, default: 0 },
        explanation: { type: String, default: '' },
      }
    ],
    freePreview: { type: Boolean, default: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

LessonSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
