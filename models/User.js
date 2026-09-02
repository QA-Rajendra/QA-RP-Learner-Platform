import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "demo" },
    role: { type: String, enum: ["ADMIN", "USER", "INSTRUCTOR"], default: "USER" },
    status: { type: String, enum: ["Active", "Suspended", "Inactive"], default: "Active" },
    avatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
    designation: { type: String, default: "Learner" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      courseUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      theme: { type: String, default: "system" },
      language: { type: String, default: "en" },
    },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
