import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({ name: { type: String, required: true }, slug: String, icon: String, description: String, coursesCount: { type: Number, default: 0 } }, { timestamps: true });
CategorySchema.set("toJSON", { transform: (doc, ret) => { ret._id = ret._id.toString(); delete ret.__v; return ret; } });
export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
