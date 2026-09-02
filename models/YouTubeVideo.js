import mongoose from 'mongoose';

const YouTubeVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    youtubeUrl: { type: String, required: true },
    youtubeVideoId: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    category: { type: String, default: 'Automation Tutorials' },
    tags: [{ type: String }],
    duration: { type: String, default: '15:00' },
    viewsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

YouTubeVideoSchema.pre('save', function () {
  if (this.youtubeUrl && !this.youtubeVideoId) {
    const match = this.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      this.youtubeVideoId = match[1];
      if (!this.thumbnail) {
        this.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
  }
});

export default mongoose.models.YouTubeVideo || mongoose.model('YouTubeVideo', YouTubeVideoSchema);
