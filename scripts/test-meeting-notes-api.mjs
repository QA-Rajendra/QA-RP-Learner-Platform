/**
 * Integration Test for Meeting Notes (Runlog) Studio APIs
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('  RUNNING: test-meeting-notes-api.mjs (QA Notes / Runlog Studio)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // 1. GET Notes list
    console.log('[Step 1] Fetching Meeting Notes List (GET /api/meeting-notes)...');
    const resList = await fetch(`${BASE_URL}/api/meeting-notes`);
    const dataList = await resList.json();

    if (resList.ok && dataList.notes && dataList.notes.length > 0) {
      console.log(`  ✓ PASS: Found ${dataList.notes.length} meeting notes (Seed notes active)`);
      passed++;
    } else {
      console.error('  ✗ FAIL: Notes list is empty or request failed', dataList);
      failed++;
    }

    // 2. POST Create a new note (Topic: Playwright)
    console.log('\n[Step 2] Creating a new meeting note (Topic: Playwright)...');
    const newNotePayload = {
      title: 'Playwright regression & CI parallelization review',
      topic: 'Playwright',
      topicDescription: 'Cross-browser: Chromium, Firefox, WebKit.',
      tagColor: 'emerald',
      summary: {
        purpose: 'Establish parallel worker count on GitHub Actions for nightly regression.',
        coverageGoals: [
          'Verify checkout flow across 4 parallel workers.',
          'Assert visual snapshot diffs on WebKit and Chromium.',
        ],
        toolingDecision: 'Enforce Playwright Test with HTML trace reporter for all pull requests.',
        nextStep: 'Merge workflow YAML into main branch and verify run times.',
      },
    };

    const resCreate = await fetch(`${BASE_URL}/api/meeting-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotePayload),
    });
    const dataCreate = await resCreate.json();

    let createdId = null;
    if (resCreate.status === 201 && dataCreate.note && dataCreate.note._id) {
      createdId = dataCreate.note._id;
      console.log(`  ✓ PASS: Created note with ID: ${createdId}`);
      console.log(`  ✓ Title: "${dataCreate.note.title}" | Topic: "${dataCreate.note.topic}"`);
      passed++;
    } else {
      console.error('  ✗ FAIL: Failed to create note', dataCreate);
      failed++;
    }

    // 3. GET specific note by ID
    if (createdId) {
      console.log(`\n[Step 3] Fetching created note detail (GET /api/meeting-notes/${createdId})...`);
      const resDetail = await fetch(`${BASE_URL}/api/meeting-notes/${createdId}`);
      const dataDetail = await resDetail.json();

      if (resDetail.ok && dataDetail.note) {
        console.log(`  ✓ PASS: Successfully fetched note detail for "${dataDetail.note.title}"`);
        passed++;
      } else {
        console.error('  ✗ FAIL: Failed to fetch note detail', dataDetail);
        failed++;
      }

      // 4. PUT Update note tag color and summary
      console.log(`\n[Step 4] Updating note tag color to "amber" (PUT /api/meeting-notes/${createdId})...`);
      const resUpdate = await fetch(`${BASE_URL}/api/meeting-notes/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagColor: 'amber',
          summary: {
            ...dataDetail.note.summary,
            nextStep: 'Final sign-off completed by QA Lead.',
          },
        }),
      });
      const dataUpdate = await resUpdate.json();

      if (resUpdate.ok && dataUpdate.note.tagColor === 'amber') {
        console.log(`  ✓ PASS: Updated tagColor to "${dataUpdate.note.tagColor}" and nextStep`);
        passed++;
      } else {
        console.error('  ✗ FAIL: Failed to update note', dataUpdate);
        failed++;
      }

      // 4b. PUT Add custom dynamic section to note summary
      console.log(`\n[Step 4b] Adding dynamic custom section (PUT /api/meeting-notes/${createdId})...`);
      const resCustomSec = await fetch(`${BASE_URL}/api/meeting-notes/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: {
            ...dataUpdate.note.summary,
            customSections: [
              {
                id: 'sec_1',
                title: 'Risks & Blockers',
                type: 'callout',
                content: 'Requires third-party sandbox API keys before sprint close.',
              },
            ],
          },
        }),
      });
      const dataCustomSec = await resCustomSec.json();
      if (resCustomSec.ok && dataCustomSec.note?.summary?.customSections?.length > 0) {
        console.log(`  ✓ PASS: Added custom dynamic section: "${dataCustomSec.note.summary.customSections[0].title}" (${dataCustomSec.note.summary.customSections[0].type})`);
        passed++;
      } else {
        console.error('  ✗ FAIL: Failed to persist custom dynamic section', dataCustomSec);
        failed++;
      }

      // 5. POST AI Chat interaction
      console.log(`\n[Step 5] Querying AI Chat Copilot (POST /api/meeting-notes/${createdId}/chat)...`);
      const resChat = await fetch(`${BASE_URL}/api/meeting-notes/${createdId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Extract action items from this meeting' }),
      });
      const dataChat = await resChat.json();

      if (resChat.ok && dataChat.reply && dataChat.reply.content) {
        console.log(`  ✓ PASS: Received AI Copilot response:`);
        console.log(`    ${dataChat.reply.content.split('\n')[0]}`);
        passed++;
      } else {
        console.error('  ✗ FAIL: Failed to query chat endpoint', dataChat);
        failed++;
      }

      // 6. DELETE Note cleanup
      console.log(`\n[Step 6] Cleaning up test note (DELETE /api/meeting-notes/${createdId})...`);
      const resDelete = await fetch(`${BASE_URL}/api/meeting-notes/${createdId}`, {
        method: 'DELETE',
      });
      const dataDelete = await resDelete.json();

      if (resDelete.ok && dataDelete.success) {
        console.log(`  ✓ PASS: Deleted test note ID: ${createdId}`);
        passed++;
      } else {
        console.error('  ✗ FAIL: Failed to delete note', dataDelete);
        failed++;
      }
    }

    console.log('\n================================================================');
    console.log(`Meeting Notes Test Summary:`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test script crashed:', err);
    process.exit(1);
  }
}

runTests();
