import mongoose from 'mongoose';

const PortfolioProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    images: [{ type: String }],
    category: { type: String, default: 'Web Automation' },
    projectType: { type: String, default: 'Commercial' },
    clientName: { type: String, default: '' },
    duration: { type: String, default: '3 Months' },
    teamSize: { type: String, default: '4 Engineers' },
    role: { type: String, default: 'Lead QA Automation Engineer' },
    industry: { type: String, default: 'FinTech / E-Commerce' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    technologies: [{ type: String }],
    testingTypes: [{ type: String }],
    tools: [{ type: String }],
    methodology: { type: String, default: 'Agile / Scrum' },
    testCases: { type: Number, default: 0 },
    defectsFound: { type: Number, default: 0 },
    automationCoverage: { type: Number, default: 85 }, // Percentage
    links: {
      live: { type: String, default: '' },
      github: { type: String, default: '' },
      demo: { type: String, default: '' },
      caseStudy: { type: String, default: '' },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    status: { type: String, enum: ['Draft', 'Published', 'Archived', 'Active'], default: 'Published' },
    featured: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PortfolioProjectSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

export default mongoose.models.PortfolioProject || mongoose.model('PortfolioProject', PortfolioProjectSchema);
