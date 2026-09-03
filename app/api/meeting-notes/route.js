import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MeetingNote from '@/models/MeetingNote';

// Initial default QA notes matching user screenshot
const SEED_NOTES = [
  {
    title: 'Cross-browser test suite review',
    module: 'Main module 1',
    topic: 'Playwright',
    topicIcon: 'playwright',
    topicDescription: 'Cross-browser: Chromium, Firefox, WebKit.',
    author: {
      name: 'Marvin McKinney',
      initials: 'MM',
      role: 'Staff QA Engineer',
    },
    tagColor: 'emerald',
    dateDisplay: 'Jun 4',
    summary: {
      purpose: 'Align on coverage and tooling before the next release freeze.',
      coverageGoals: [
        'Book flights and hotels flow — smoke tests on every push.',
        'Personalised recommendations — nightly regression only.',
        'Filters for budget and family options — new suite this sprint.',
        'Wishlist and saved choices — cover on desktop and mobile viewport.',
      ],
      toolingDecision:
        'Keep Selenium for the legacy Java suite, move new specs to Playwright for parallel cross-browser runs.',
      nextStep: "Draft the coverage matrix and share before Thursday's client review.",
    },
    transcribe: {
      duration: '18:45',
      segments: [
        {
          speaker: 'Marvin McKinney',
          timestamp: '00:05',
          text: "Welcome everyone. Let's do a fast sync on our cross-browser test suite before Thursday's release freeze.",
        },
        {
          speaker: 'Elena Vance',
          timestamp: '02:10',
          text: 'The booking flow in Safari mobile web is exhibiting intermittent cookie drops. We need targeted WebKit assertions.',
        },
        {
          speaker: 'Marvin McKinney',
          timestamp: '04:32',
          text: 'We should migrate those flows to Playwright workers running across Chromium, Firefox, and WebKit.',
        },
        {
          speaker: 'David Kim',
          timestamp: '08:15',
          text: 'Agreed. Legacy suites stay in Selenium, and all newly committed PRs must pass the Playwright smoke suite.',
        },
      ],
    },
  },
  {
    title: 'Regression sweep — release 4.2',
    module: 'Main module 1',
    topic: 'Selenium',
    topicIcon: 'selenium',
    topicDescription: 'Java, Python, JS runs across browsers.',
    author: {
      name: 'Elena Vance',
      initials: 'EV',
      role: 'QA Automation Lead',
    },
    tagColor: 'amber',
    dateDisplay: 'Jun 3',
    summary: {
      purpose: 'Plan final regression sweep and critical path verification for v4.2 deployment.',
      coverageGoals: [
        'Authentication & SSO token refresh lifecycle verification.',
        'Payment gateway failure and retry webhook handling.',
        'Data export and bulk report generation under heavy load.',
      ],
      toolingDecision:
        'Execute nightly distributed Selenium Grid runs on AWS with 12 parallel threads.',
      nextStep: 'Monitor CI artifact reports and publish regression sign-off scorecards.',
    },
    transcribe: {
      duration: '12:10',
      segments: [
        {
          speaker: 'Elena Vance',
          timestamp: '00:02',
          text: 'Starting our 4.2 regression review. We have 140 automated suites running nightly.',
        },
        {
          speaker: 'Marvin McKinney',
          timestamp: '03:45',
          text: 'Ensure payment retry webhooks are tested against sandbox latency spikes.',
        },
      ],
    },
  },
  {
    title: 'New hire onboarding — QA tooling',
    module: 'Main module 2',
    topic: 'Playwright',
    topicIcon: 'playwright',
    topicDescription: 'Cross-browser: Chromium, Firefox, WebKit.',
    author: {
      name: 'Sarah Jenkins',
      initials: 'SJ',
      role: 'Senior SDET',
    },
    tagColor: 'blue',
    dateDisplay: 'Jun 2',
    summary: {
      purpose: 'Standardize onboarding guides, local Docker runners, and VS Code debugging setup.',
      coverageGoals: [
        'Clone starter repo and verify zero-config test runs.',
        'Configure Playwright trace viewer and video artifact capture.',
        'Walkthrough PR review guidelines and locator strategies (getByRole priority).',
      ],
      toolingDecision:
        'Standardize on Playwright Test Runner + ESLint Playwright plugin for all frontend repositories.',
      nextStep: 'Publish onboarding checklist to Engineering Wiki and assign mentors.',
    },
    transcribe: {
      duration: '22:15',
      segments: [
        {
          speaker: 'Sarah Jenkins',
          timestamp: '00:00',
          text: 'Onboarding walkthrough for new QA engineers on our Playwright test framework.',
        },
      ],
    },
  },
  {
    title: 'Mobile viewport coverage gaps',
    module: 'Main module 2',
    topic: 'Appium',
    topicIcon: 'appium',
    topicDescription: 'iOS & Android native and responsive viewport automation.',
    author: {
      name: 'Alex Rivera',
      initials: 'AR',
      role: 'Mobile QA Specialist',
    },
    tagColor: 'rose',
    dateDisplay: 'Jun 4',
    summary: {
      purpose: 'Identify uncovered touch gestures, bottom sheet modals, and notch-safe layout boundaries.',
      coverageGoals: [
        'Mobile Safari sticky navigation and keyboard avoidance.',
        'Android back button hardware event interception.',
        'Biometric FaceID / TouchID authentication mocks.',
      ],
      toolingDecision:
        'Combine Playwright mobile emulation for quick PR validation + Appium Cloud for release certification.',
      nextStep: 'Set up device farm matrix targeting iOS 17 and Android 14 devices.',
    },
    transcribe: {
      duration: '15:30',
      segments: [
        {
          speaker: 'Alex Rivera',
          timestamp: '00:05',
          text: 'We noticed a 12% gap in mobile gesture test automation on our responsive views.',
        },
      ],
    },
  },
  {
    title: 'Weekly sync — flaky test backlog',
    module: 'Main module 2',
    topic: 'Cypress',
    topicIcon: 'cypress',
    topicDescription: 'Fast, reliable E2E browser testing.',
    author: {
      name: 'David Kim',
      initials: 'DK',
      role: 'SDET II',
    },
    tagColor: 'slate',
    dateDisplay: 'May 30',
    summary: {
      purpose: 'Triage flaky test runs, isolate race conditions, and enforce deterministic network mocks.',
      coverageGoals: [
        'Eliminate hardcoded sleep/wait timeouts across legacy suites.',
        'Implement intercept route mocking for external 3rd party APIs.',
        'Enforce auto-quarantine for tests failing > 2% in the last 7 days.',
      ],
      toolingDecision:
        'Refactor legacy wait statements to explicit assertion polling and cy.intercept fixtures.',
      nextStep: 'Fix top 5 flaky test cases and unquarantine verified passing suites.',
    },
    transcribe: {
      duration: '25:40',
      segments: [
        {
          speaker: 'David Kim',
          timestamp: '00:10',
          text: 'Reviewing our flaky test dashboard. Flakiness rate dropped from 4.8% down to 1.1% this week.',
        },
      ],
    },
  },
];

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const moduleQuery = searchParams.get('module') || '';
    const topic = searchParams.get('topic') || '';
    const tagColor = searchParams.get('tagColor') || '';

    // Auto-seed initial notes if collection is empty
    const count = await MeetingNote.countDocuments();
    if (count === 0) {
      await MeetingNote.insertMany(SEED_NOTES);
    } else {
      // Normalize any legacy notes without module or where module matches topic
      await MeetingNote.updateMany(
        { $or: [{ module: { $exists: false } }, { module: null }, { module: '' }] },
        { $set: { module: 'Main module 1' } }
      );
      await MeetingNote.updateMany(
        { module: { $in: ['Playwright', 'Selenium'] } },
        { $set: { module: 'Main module 1' } }
      );
      await MeetingNote.updateMany(
        { module: { $in: ['Appium', 'Cypress', 'API Testing'] } },
        { $set: { module: 'Main module 2' } }
      );
    }

    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { module: regex },
        { topic: regex },
        { 'summary.purpose': regex },
        { 'summary.toolingDecision': regex },
        { 'author.name': regex },
      ];
    }

    if (moduleQuery && moduleQuery !== 'All') {
      query.module = moduleQuery;
    }

    if (topic && topic !== 'All') {
      query.topic = topic;
    }

    if (tagColor && tagColor !== 'All') {
      query.tagColor = tagColor;
    }

    const notes = await MeetingNote.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      total: notes.length,
      notes,
    });
  } catch (error) {
    console.error('Error fetching meeting notes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch meeting notes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { title, module, topic, topicIcon, topicDescription, author, tagColor, summary, transcribe } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Note title is required' },
        { status: 400 }
      );
    }

    const effectiveModule = module?.trim() || topic?.trim() || 'Main module 1';
    const effectiveTopic = topic?.trim() || effectiveModule;

    // Build starter summary based on topic if not provided
    const defaultPurpose =
      summary?.purpose ||
      `Add a purpose for this meeting.`;

    const defaultCoverageGoals = summary?.coverageGoals?.length
      ? summary.coverageGoals
      : [
          `Add a coverage goal.`,
        ];

    const defaultToolingDecision =
      summary?.toolingDecision ||
      `Covered by Playwright — parallel run across Chromium, Firefox and WebKit.`;

    const defaultNextStep =
      summary?.nextStep ||
      `Add a next step.`;

    const newNote = await MeetingNote.create({
      title: title.trim(),
      module: effectiveModule,
      topic: effectiveTopic,
      topicIcon: topicIcon || effectiveTopic.toLowerCase().replace(/[^a-z0-9]/g, ''),
      topicDescription: topicDescription || `Automated & manual test coverage for ${effectiveModule}`,
      author: {
        name: author?.name || 'You',
        initials: author?.initials || 'Y',
        role: author?.role || 'QA Lead Engineer',
      },
      tagColor: tagColor || 'emerald',
      dateDisplay: 'Just now',
      summary: {
        purpose: defaultPurpose,
        coverageGoals: defaultCoverageGoals,
        toolingDecision: defaultToolingDecision,
        nextStep: defaultNextStep,
        rawSummary: summary?.rawSummary || '',
      },
      transcribe: {
        duration: transcribe?.duration || '10:00',
        segments: transcribe?.segments || [
          {
            speaker: author?.name || 'Marvin McKinney',
            avatar: '',
            timestamp: '00:00',
            text: `Meeting opened. Discussing requirements and scope for "${title.trim()}".`,
          },
          {
            speaker: 'QA Team',
            avatar: '',
            timestamp: '01:30',
            text: `Identified critical user journeys and automated test strategy using ${effectiveTopic}.`,
          },
        ],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Meeting note created successfully',
        note: newNote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating meeting note:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create meeting note' },
      { status: 500 }
    );
  }
}
