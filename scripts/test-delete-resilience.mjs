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

async function testDelete() {
  await connectDB();
  console.log('Testing delete endpoints against local server http://localhost:3000...');

  // 1. Create temporary test case via API
  const createRes = await fetch('http://localhost:3000/api/test-cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      module: 'TestDelete',
      name: 'Temporary Test Case To Delete',
      testCaseId: `TC-TEMP-${Date.now()}`,
    }),
  });
  const created = await createRes.json();
  console.log('Created test case ID:', created.testCaseId, '(_id:', created._id, ')');

  // 2. Test deleting by _id
  console.log('\nTesting DELETE by _id on /api/test-cases/:id...');
  const del1 = await fetch(`http://localhost:3000/api/test-cases/${created._id}`, { method: 'DELETE' });
  const del1Data = await del1.json();
  console.log('Delete 1 response:', del1.status, del1Data);
  if (!del1.ok) throw new Error('Delete by _id failed');

  // 3. Create another one to test deleting by testCaseId
  const tempId = `TC-TEMP2-${Date.now()}`;
  await TestCase.create({
    module: 'TestDelete',
    name: 'Temporary Test Case 2',
    testCaseId: tempId,
  });
  console.log('\nCreated test case in DB with testCaseId:', tempId);

  console.log('Testing DELETE by testCaseId string on /api/test-cases/:id...');
  const del2 = await fetch(`http://localhost:3000/api/test-cases/${tempId}`, { method: 'DELETE' });
  const del2Data = await del2.json();
  console.log('Delete 2 response:', del2.status, del2Data);
  if (!del2.ok) throw new Error('Delete by testCaseId failed');

  // 4. Test fallback query DELETE /api/test-cases?id=...
  const tempId3 = `TC-TEMP3-${Date.now()}`;
  await TestCase.create({
    module: 'TestDelete',
    name: 'Temporary Test Case 3',
    testCaseId: tempId3,
  });
  console.log('\nCreated test case 3 in DB with testCaseId:', tempId3);

  console.log('Testing fallback DELETE on /api/test-cases?id=...');
  const del3 = await fetch(`http://localhost:3000/api/test-cases?id=${tempId3}`, { method: 'DELETE' });
  const del3Data = await del3.json();
  console.log('Delete 3 response:', del3.status, del3Data);
  if (!del3.ok) throw new Error('Fallback query delete failed');

  console.log('\n🎉 ALL DELETE OPERATIONS (BY _ID, BY TESTCASEID, AND QUERY FALLBACK) ARE 100% OPERATIONAL!');
  process.exit(0);
}

testDelete().catch(err => {
  console.error('Delete test failed:', err);
  process.exit(1);
});
