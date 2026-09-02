import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: 'QA Platform Inquiry' },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Read', 'Replied', 'Archived'], default: 'Unread' },
    replied: { type: Boolean, default: false },
    replyMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
