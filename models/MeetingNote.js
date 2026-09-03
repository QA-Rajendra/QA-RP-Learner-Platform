import mongoose from 'mongoose';

const TranscribeSegmentSchema = new mongoose.Schema(
  {
    speaker: { type: String, default: 'QA Lead' },
    avatar: { type: String, default: '' },
    timestamp: { type: String, default: '00:00' },
    text: { type: String, required: true },
  },
  { _id: false }
);

const ChatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], default: 'user' },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MeetingNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    module: {
      type: String,
      trim: true,
      default: 'Main module 1',
    },
    topic: {
      type: String,
      trim: true,
      default: 'Playwright',
    },
    topicIcon: {
      type: String,
      default: 'playwright', // 'selenium' | 'playwright' | 'cypress' | 'appium' | 'api' | 'general'
    },
    topicDescription: {
      type: String,
      default: '',
    },
    author: {
      name: { type: String, default: 'Marvin McKinney' },
      initials: { type: String, default: 'MM' },
      avatar: { type: String, default: '' },
      role: { type: String, default: 'QA Lead Engineer' },
    },
    tagColor: {
      type: String,
      enum: ['amber', 'emerald', 'rose', 'blue', 'slate', 'purple'],
      default: 'emerald',
    },
    dateDisplay: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    },
    // ── Summary Tab Content ──────────────────────────────────────────────
    summary: {
      purpose: {
        type: String,
        default: 'Align on coverage and tooling before the next release freeze.',
      },
      coverageGoals: {
        type: [String],
        default: [
          'Book flights and hotels flow — smoke tests on every push.',
          'Personalised recommendations — nightly regression only.',
          'Filters for budget and family options — new suite this sprint.',
          'Wishlist and saved choices — cover on desktop and mobile viewport.',
        ],
      },
      toolingDecision: {
        type: String,
        default: 'Keep Selenium for the legacy Java suite, move new specs to Playwright for parallel cross-browser runs.',
      },
      nextStep: {
        type: String,
        default: "Draft the coverage matrix and share before Thursday's client review.",
      },
      rawSummary: {
        type: String,
        default: '',
      },
      customSections: [
        {
          id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
          title: { type: String, default: 'Notes' },
          content: { type: String, default: '' },
          type: { type: String, default: 'text' }, // 'text' | 'list' | 'callout'
        },
      ],
    },
    // ── Transcribe Tab Content ───────────────────────────────────────────
    transcribe: {
      duration: { type: String, default: '14:28' },
      audioUrl: { type: String, default: '' },
      segments: {
        type: [TranscribeSegmentSchema],
        default: [
          {
            speaker: 'Marvin McKinney',
            avatar: '',
            timestamp: '00:04',
            text: "Thanks everyone for joining. Let's align on our cross-browser test suite review before the upcoming 4.2 release freeze.",
          },
          {
            speaker: 'Sarah Jenkins',
            avatar: '',
            timestamp: '01:15',
            text: 'We noticed a few flaky test runs in Safari and WebKit viewports. We should prioritize moving those critical specs to Playwright.',
          },
          {
            speaker: 'Marvin McKinney',
            avatar: '',
            timestamp: '03:40',
            text: 'Agreed. We will keep Selenium for the legacy Java tests, while all newly created checkout and booking suites will be authored in Playwright.',
          },
          {
            speaker: 'Alex Rivera',
            avatar: '',
            timestamp: '06:22',
            text: "I will draft the coverage matrix and circulate it to the client and engineering leads before Thursday's sync.",
          },
        ],
      },
    },
    // ── Chat Tab Content ─────────────────────────────────────────────────
    chatHistory: {
      type: [ChatMessageSchema],
      default: [
        {
          role: 'assistant',
          content: 'Hello! I am your QA Note Assistant. Ask me anything about this meeting, or ask me to generate Jira tickets, test matrices, or action items based on this discussion.',
          timestamp: new Date(),
        },
      ],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PortfolioProject',
      default: null,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

MeetingNoteSchema.index({ topic: 1, tagColor: 1, createdAt: -1 });

if (mongoose.models.MeetingNote) {
  delete mongoose.models.MeetingNote;
}

export default mongoose.model('MeetingNote', MeetingNoteSchema);
