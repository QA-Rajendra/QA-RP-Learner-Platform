import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({ order: Number, title: String, lessonsCount: { type: Number, default: 0 }, quizzesCount: { type: Number, default: 0 }, assignmentsCount: { type: Number, default: 0 } });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true }, code: String, category: String, categorySlug: String, instructor: String,
  duration: String, language: { type: String, default: "English" }, level: { type: String, default: "All levels" },
  price: { type: Number, default: 0 }, originalPrice: { type: Number, default: 29.0 }, isFree: { type: Boolean, default: true },
  status: { type: String, default: "Active" }, lessonsCount: { type: Number, default: 0 }, studentsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5 }, reviewsCount: { type: Number, default: 0 }, thumbnail: String,
  description: String, fullDescription: String, shortDescription: String, objectives: [String],
  modules: [moduleSchema],
  features: { enableDiscussions: Boolean, certificateAvailable: Boolean, previewCourse: Boolean, allowEnrollments: { type: Boolean, default: true }, isPaid: Boolean, isPublished: Boolean },
}, { timestamps: true });

CourseSchema.set("toJSON", { virtuals: true, transform: (doc, ret) => { ret._id = ret._id.toString(); delete ret.__v; return ret; } });
export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
