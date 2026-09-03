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

const ACCESS_CONTROL_TEST_CASES = [
  {
    module: 'Access Control',
    scenarioId: 'TS-RBAC-001',
    testCaseId: 'TC-RBAC-001',
    name: 'Admin has full access to Settings Studio & Platform CRUD',
    priority: 'Critical',
    type: 'Positive',
    status: 'Automated',
    format: 'table',
    description: 'Verify that an authenticated user with ADMIN role can access Settings Studio, manage pricing, create courses, and delete records.',
    steps: [
      { stepNumber: 1, action: 'Sign in with Admin credentials', testData: 'Role: ADMIN (email: qarajendra4893@gmail.com)', expectedResult: 'Authentication succeeds with ADMIN authority badge active', status: 'Passed' },
      { stepNumber: 2, action: 'Inspect Top Navigation bar', testData: 'UI Inspection', expectedResult: '"Settings Studio" and "Gallery" links are visible with Admin badges', status: 'Passed' },
      { stepNumber: 3, action: 'Navigate to /settings page', testData: 'URL: /settings', expectedResult: 'Settings Studio opens showing Dashboard, Creator Studio, Courses, Pricing, Themes, Profile, Roles', status: 'Passed' },
      { stepNumber: 4, action: 'Execute course creation in Creator Studio', testData: 'Title: Advanced Playwright Architecture', expectedResult: 'New course is created and saved to MongoDB Atlas', status: 'Passed' },
      { stepNumber: 5, action: 'Modify global common lesson fee', testData: 'Common Fee: ₹499', expectedResult: 'PUT /api/settings succeeds and updates global fee in database', status: 'Passed' },
      { stepNumber: 6, action: 'Delete test project record', testData: 'Action: DELETE /api/portfolio-projects/:id', expectedResult: 'Record permanently deleted from MongoDB Atlas', status: 'Passed' },
    ],
  },
  {
    module: 'Access Control',
    scenarioId: 'TS-RBAC-002',
    testCaseId: 'TC-RBAC-002',
    name: 'Student has Read-Only access to Course Catalog & cannot edit/delete',
    priority: 'Critical',
    type: 'Positive',
    status: 'Ready',
    format: 'table',
    description: 'Verify that a Student/Learner has read-only browsing rights to courses and curriculum, with no creation or deletion privileges.',
    steps: [
      { stepNumber: 1, action: 'Sign in as Student or browse as guest learner', testData: 'Role: USER / Learner', expectedResult: 'User logged in without admin privileges', status: 'Passed' },
      { stepNumber: 2, action: 'Navigate to /courses catalog', testData: 'URL: /courses', expectedResult: 'Courses catalog loads in read-only mode showing titles, difficulty, duration', status: 'Passed' },
      { stepNumber: 3, action: 'Verify Course Management controls', testData: 'UI Inspection', expectedResult: 'No "+ Add Course", "Edit Course", or "Delete" buttons are rendered', status: 'Passed' },
      { stepNumber: 4, action: 'Inspect Curriculum Section & Free Lessons', testData: 'Course Details View', expectedResult: 'Free lessons can be watched; paid lessons prompt for enrollment', status: 'Passed' },
      { stepNumber: 5, action: 'Attempt direct POST /api/courses mutation via API', testData: 'POST /api/courses with Student token', expectedResult: 'API rejects request or restricts unprivileged course creation', status: 'Passed' },
    ],
  },
  {
    module: 'Access Control',
    scenarioId: 'TS-RBAC-003',
    testCaseId: 'TC-RBAC-003',
    name: 'Student is restricted from Settings Studio and Admin Tools',
    priority: 'High',
    type: 'Security',
    status: 'Automated',
    format: 'table',
    description: 'Verify that Settings Studio and Admin Media Gallery are hidden from Students and restricted from unauthorized access.',
    steps: [
      { stepNumber: 1, action: 'Inspect Navigation bar as Student', testData: 'Role: USER', expectedResult: '"Settings Studio" and "Gallery" navigation links are NOT rendered', status: 'Passed' },
      { stepNumber: 2, action: 'Attempt direct URL navigation to /settings', testData: 'URL: /settings', expectedResult: 'System hides admin CRUD actions or prompts for Admin credentials', status: 'Passed' },
      { stepNumber: 3, action: 'Attempt direct PUT /api/settings request', testData: 'PUT /api/settings payload: { paymentSettings: { commonFeeAmount: 0 } }', expectedResult: 'Request without admin session is rejected', status: 'Passed' },
      { stepNumber: 4, action: 'Verify User Roles tab access', testData: 'URL: /settings?tab=roles', expectedResult: 'Role promotion/demotion matrix is not operable by Students', status: 'Passed' },
    ],
  },
  {
    module: 'Access Control',
    scenarioId: 'TS-RBAC-004',
    testCaseId: 'TC-RBAC-004',
    name: 'Student has Read-Only access to QA Portfolio Projects',
    priority: 'High',
    type: 'Positive',
    status: 'Ready',
    format: 'table',
    description: 'Verify that Students can view case studies, inspect code repositories and test coverage, but cannot delete or modify projects.',
    steps: [
      { stepNumber: 1, action: 'Navigate to /projects page as Student', testData: 'URL: /projects', expectedResult: 'All enterprise QA projects and case studies render properly', status: 'Passed' },
      { stepNumber: 2, action: 'Inspect project links and metrics', testData: 'Clicks GitHub Repo / Live Demo', expectedResult: 'External links and test case counts open in read-only mode', status: 'Passed' },
      { stepNumber: 3, action: 'Check for Administrative project delete/edit buttons', testData: 'UI Inspection', expectedResult: 'Trash/Edit controls are absent on public project cards', status: 'Passed' },
      { stepNumber: 4, action: 'Attempt DELETE /api/portfolio-projects/:id as Student', testData: 'DELETE /api/portfolio-projects/:id', expectedResult: 'Server prevents non-admin user from deleting portfolio case studies', status: 'Passed' },
    ],
  },
  {
    module: 'Access Control',
    scenarioId: 'TS-RBAC-005',
    testCaseId: 'TC-RBAC-005',
    name: 'Student can view Profile & My Learning but cannot alter other users',
    priority: 'Medium',
    type: 'Security',
    status: 'Ready',
    format: 'table',
    description: 'Verify Student boundary isolation: students can only access their own enrolled courses and profile, without access to other students records.',
    steps: [
      { stepNumber: 1, action: 'Navigate to /my-learning dashboard', testData: 'URL: /my-learning', expectedResult: 'Displays personal enrolled courses and learning progress only', status: 'Passed' },
      { stepNumber: 2, action: 'Attempt to query /api/users directory', testData: 'GET /api/users with non-admin credentials', expectedResult: 'Full user registry and password hashes are protected', status: 'Passed' },
      { stepNumber: 3, action: 'Verify role elevation prevention', testData: 'Student attempts to set role: "ADMIN"', expectedResult: 'System rejects unauthorized self-promotion to ADMIN role', status: 'Passed' },
    ],
  },
];

async function seedRbacTestCases() {
  await connectDB();
  console.log('MongoDB Atlas Connected.');

  for (const item of ACCESS_CONTROL_TEST_CASES) {
    const existing = await TestCase.findOne({ testCaseId: item.testCaseId });
    if (existing) {
      await TestCase.updateOne({ testCaseId: item.testCaseId }, item);
      console.log(`✓ Updated: ${item.testCaseId} — ${item.name}`);
    } else {
      await TestCase.create(item);
      console.log(`✓ Created: ${item.testCaseId} — ${item.name}`);
    }
  }

  const count = await TestCase.countDocuments({ module: 'Access Control' });
  console.log(`\n🎉 SUCCESS: ${count} Access Control (RBAC) Test Cases saved in MongoDB Atlas!`);
  process.exit(0);
}

seedRbacTestCases().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
