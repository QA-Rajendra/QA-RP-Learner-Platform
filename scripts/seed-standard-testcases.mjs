import fs from 'fs';
import path from 'path';

if (!process.env.MONGODB_URI) {
  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

import connectDB from '../lib/mongodb.js';
import TestCase from '../models/TestCase.js';
import PortfolioProject from '../models/PortfolioProject.js';

const SEED_TEST_CASES = [
  {
    module: 'Login',
    scenarioId: 'TS-LOGIN-001',
    testCaseId: 'TC-LOGIN-001',
    name: 'Login with valid Email and valid Password',
    priority: 'Critical',
    type: 'Positive',
    status: 'Automated',
    format: 'table',
    description: 'Verify that an existing registered user can successfully authenticate and access the dashboard.',
    steps: [
      { stepNumber: 1, action: 'Navigate to login portal', testData: 'URL: /signin', expectedResult: 'Login form is displayed with email and password fields', status: 'Passed' },
      { stepNumber: 2, action: 'Enter registered email address', testData: 'admin@qarp.io', expectedResult: 'Field accepts email with valid format indicator', status: 'Passed' },
      { stepNumber: 3, action: 'Enter valid password', testData: 'CorrectPass#2026', expectedResult: 'Characters are masked for security', status: 'Passed' },
      { stepNumber: 4, action: 'Click "Sign In" button', testData: 'Click Action', expectedResult: 'System authenticates user and redirects to Dashboard with valid JWT cookie', status: 'Passed' },
      { stepNumber: 5, action: 'Verify session state in navbar', testData: 'Inspection', expectedResult: 'User avatar and name are visible, login button replaced with Sign Out', status: 'Passed' },
    ],
  },
  {
    module: 'Login',
    scenarioId: 'TS-LOGIN-002',
    testCaseId: 'TC-LOGIN-002',
    name: 'Login with valid Email ID and invalid password',
    priority: 'High',
    type: 'Negative',
    status: 'Ready',
    format: 'table',
    description: 'Verify system validation, error messaging, and account lockout protection when invalid password is supplied.',
    steps: [
      { stepNumber: 1, action: 'Navigate to login page', testData: 'URL: /signin', expectedResult: 'Login page renders cleanly', status: 'Passed' },
      { stepNumber: 2, action: 'Enter valid email address', testData: 'tester@qarp.io', expectedResult: 'Email format accepted', status: 'Passed' },
      { stepNumber: 3, action: 'Enter incorrect password', testData: 'WrongPassword!123', expectedResult: 'Password masked', status: 'Passed' },
      { stepNumber: 4, action: 'Click "Sign In" button', testData: 'Click Action', expectedResult: 'Red alert banner displays: "Invalid email or password"', status: 'Passed' },
      { stepNumber: 5, action: 'Verify session cookie', testData: 'Browser Cookie Inspection', expectedResult: 'No session token or auth cookie is issued', status: 'Passed' },
    ],
  },
  {
    module: 'Checkout & Payment',
    scenarioId: 'TS-CHK-001',
    testCaseId: 'TC-CHK-001',
    name: 'End-to-end course checkout with valid payment',
    priority: 'Critical',
    type: 'Positive',
    status: 'Automated',
    format: 'table',
    description: 'Verify seamless course purchase flow, order invoice generation, and immediate curriculum enrollment.',
    steps: [
      { stepNumber: 1, action: 'Open course catalog and select paid course', testData: 'Course: Playwright Automation Framework', expectedResult: 'Course landing page displays enrollment price', status: 'Passed' },
      { stepNumber: 2, action: 'Click "Enroll Now" CTA', testData: 'Click Enroll', expectedResult: 'Payment modal pops up with summary and price', status: 'Passed' },
      { stepNumber: 3, action: 'Fill cardholder billing information', testData: 'Name: John Doe, Email: john@example.com', expectedResult: 'Billing fields validate correctly', status: 'Passed' },
      { stepNumber: 4, action: 'Submit test card payment', testData: 'Card: 4242 4242 4242 4242, Exp: 12/28', expectedResult: 'Payment provider returns 200 OK transaction approval', status: 'Passed' },
      { stepNumber: 5, action: 'Verify enrollment access', testData: 'Navigate to /my-learning', expectedResult: 'Course unlocked with "Start Learning" button active', status: 'Passed' },
    ],
  },
  {
    module: 'API Authentication',
    scenarioId: 'TS-API-001',
    testCaseId: 'TC-API-001',
    name: 'Bearer Token validation on protected REST endpoints',
    priority: 'High',
    type: 'Security',
    status: 'Automated',
    format: 'structured',
    description: 'Verify HTTP 401 Unauthorized when Authorization header is missing or tampered.',
    steps: [
      { stepNumber: 1, action: 'Send GET request to /api/settings without token', testData: 'Headers: {}', expectedResult: 'Server responds with status 401 Unauthorized', status: 'Passed' },
      { stepNumber: 2, action: 'Send request with expired Bearer token', testData: 'Authorization: Bearer <expired>', expectedResult: 'Server responds with 401 Token Expired error payload', status: 'Passed' },
      { stepNumber: 3, action: 'Send request with valid Admin token', testData: 'Authorization: Bearer <valid_admin>', expectedResult: 'Server returns 200 OK with settings JSON object', status: 'Passed' },
    ],
  },
  {
    module: 'Search & Filter',
    scenarioId: 'TS-SRCH-001',
    testCaseId: 'TC-SRCH-001',
    name: 'Dynamic filtering by category and full-text keyword',
    priority: 'Medium',
    type: 'Positive',
    status: 'Ready',
    format: 'table',
    description: 'Verify instant search debouncing and category chip filtering in projects and courses catalog.',
    steps: [
      { stepNumber: 1, action: 'Navigate to /projects page', testData: 'URL: /projects', expectedResult: 'All portfolio projects displayed in responsive grid', status: 'Passed' },
      { stepNumber: 2, action: 'Type search keyword "Playwright"', testData: 'Search: Playwright', expectedResult: 'Only projects containing "Playwright" in title or tech stack remain visible', status: 'Passed' },
      { stepNumber: 3, action: 'Click category chip "API Automation"', testData: 'Category: API Automation', expectedResult: 'Grid updates dynamically to show only API projects matching filter', status: 'Passed' },
      { stepNumber: 4, action: 'Clear search input', testData: 'Clear field', expectedResult: 'All projects in the selected category are restored', status: 'Passed' },
    ],
  },
];

async function seedTestCases() {
  await connectDB();
  console.log('MongoDB Atlas Connected.');

  // Find a portfolio project to link if exists
  const firstProject = await PortfolioProject.findOne({});

  for (const item of SEED_TEST_CASES) {
    const existing = await TestCase.findOne({ testCaseId: item.testCaseId });
    if (existing) {
      await TestCase.updateOne({ testCaseId: item.testCaseId }, { ...item, projectId: firstProject?._id || null });
      console.log(`✓ Updated existing test case: ${item.testCaseId} (${item.name})`);
    } else {
      await TestCase.create({ ...item, projectId: firstProject?._id || null });
      console.log(`✓ Created new test case: ${item.testCaseId} (${item.name})`);
    }
  }

  const total = await TestCase.countDocuments({});
  console.log(`\n================================================================`);
  console.log(`  🎉 SUCCESS: Total Test Cases in MongoDB Atlas is now: ${total}`);
  console.log(`================================================================`);
  process.exit(0);
}

seedTestCases().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
