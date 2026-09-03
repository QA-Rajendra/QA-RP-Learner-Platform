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

async function checkDb() {
  await connectDB();
  console.log('MongoDB Atlas Connected Successfully!\n');

  const testCases = await TestCase.find({}).sort({ createdAt: -1 }).lean();
  console.log(`================================================================`);
  console.log(`  TOTAL TEST CASES CURRENTLY SAVED IN MONGODB: ${testCases.length}`);
  console.log(`================================================================\n`);

  testCases.forEach((tc, idx) => {
    console.log(`[#${idx + 1}] ID: ${tc.testCaseId}`);
    console.log(`     Module:        ${tc.module}`);
    console.log(`     Scenario ID:   ${tc.scenarioId || 'N/A'}`);
    console.log(`     Name:          ${tc.name}`);
    console.log(`     Priority:      ${tc.priority}`);
    console.log(`     Type:          ${tc.type}`);
    console.log(`     Status:        ${tc.status}`);
    console.log(`     Format:        ${tc.format}`);
    console.log(`     Steps Count:   ${tc.steps?.length || 0}`);
    if (tc.steps && tc.steps.length > 0) {
      tc.steps.slice(0, 3).forEach(s => {
        console.log(`       - Step ${s.stepNumber}: ${s.action} | Expected: ${s.expectedResult}`);
      });
      if (tc.steps.length > 3) {
        console.log(`       ... and ${tc.steps.length - 3} more steps`);
      }
    }
    console.log('----------------------------------------------------------------');
  });

  process.exit(0);
}

checkDb().catch(err => {
  console.error(err);
  process.exit(1);
});
