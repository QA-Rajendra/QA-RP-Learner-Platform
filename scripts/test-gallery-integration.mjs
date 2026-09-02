import assert from 'assert';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

function logPass(msg) {
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${msg}`);
  passed++;
}

function logFail(msg, err) {
  console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${msg} ${err ? `(${err})` : ''}`);
  failed++;
}

async function runGalleryIntegrationSuite() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  QA RP LEARNER PLATFORM — ADMIN GALLERY INTEGRATION TEST SUITE ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  let imageId = null;
  let pdfId = null;

  // 1. Upload PNG Image
  console.log(`${colors.bold}${colors.yellow}[Step 1] Image Upload & Metadata Persistence${colors.reset}`);
  try {
    const imgFormData = new FormData();
    const imgBlob = new Blob([Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489', 'hex')], { type: 'image/png' });
    imgFormData.append('files', imgBlob, 'playwright-architecture-diagram.png');
    imgFormData.append('name', 'Playwright Architecture Blueprint');
    imgFormData.append('category', 'QA Architecture');
    imgFormData.append('description', 'Comprehensive end-to-end test execution flowchart');
    imgFormData.append('tags', 'Playwright, TypeScript, CI/CD');

    const res = await fetch(`${BASE_URL}/api/gallery`, {
      method: 'POST',
      body: imgFormData,
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    imageId = data._id;
    assert.ok(imageId, 'Image ID must exist');
    assert.strictEqual(data.fileType, 'image');
    assert.ok(data.url.startsWith('/uploads/'));
    logPass(`POST /api/gallery (Image) -> Created ID: ${imageId} (${data.sizeFormatted})`);
  } catch (e) {
    logFail('Image upload failed', e.message);
  }

  // 2. Upload PDF Document
  console.log(`\n${colors.bold}${colors.yellow}[Step 2] PDF Study Guide Upload & Metadata Persistence${colors.reset}`);
  try {
    const pdfFormData = new FormData();
    const pdfBlob = new Blob(['%PDF-1.4 sample Playwright Study Guide content'], { type: 'application/pdf' });
    pdfFormData.append('files', pdfBlob, 'playwright-complete-handbook.pdf');
    pdfFormData.append('name', 'Playwright Complete Handbook 2025');
    pdfFormData.append('category', 'Study Guides');
    pdfFormData.append('description', 'Deep-dive PDF manual for test automation engineers');
    pdfFormData.append('tags', 'PDF, Guide, Playwright');

    const res = await fetch(`${BASE_URL}/api/gallery`, {
      method: 'POST',
      body: pdfFormData,
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    pdfId = data._id;
    assert.ok(pdfId, 'PDF ID must exist');
    assert.strictEqual(data.fileType, 'pdf');
    assert.ok(data.url.startsWith('/uploads/'));
    logPass(`POST /api/gallery (PDF) -> Created ID: ${pdfId} (${data.sizeFormatted})`);
  } catch (e) {
    logFail('PDF upload failed', e.message);
  }

  // 3. GET /api/gallery (Search & Filtering)
  console.log(`\n${colors.bold}${colors.yellow}[Step 3] Gallery Search, Type Filters & Sorting APIs${colors.reset}`);
  try {
    const listRes = await fetch(`${BASE_URL}/api/gallery`);
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(Array.isArray(listData.files));
    assert.ok(listData.overview.images >= 1);
    assert.ok(listData.overview.pdfs >= 1);
    logPass(`GET /api/gallery returns ${listData.total} files (Images: ${listData.overview.images}, PDFs: ${listData.overview.pdfs})`);
  } catch (e) {
    logFail('GET /api/gallery failed', e.message);
  }

  try {
    const imgFilterRes = await fetch(`${BASE_URL}/api/gallery?type=image`);
    assert.strictEqual(imgFilterRes.status, 200);
    const imgData = await imgFilterRes.json();
    assert.ok(imgData.files.every(f => f.fileType === 'image'));
    logPass(`GET /api/gallery?type=image correctly filters only image assets (${imgData.files.length} items)`);
  } catch (e) {
    logFail('GET /api/gallery?type=image failed', e.message);
  }

  try {
    const pdfFilterRes = await fetch(`${BASE_URL}/api/gallery?type=pdf`);
    assert.strictEqual(pdfFilterRes.status, 200);
    const pdfData = await pdfFilterRes.json();
    assert.ok(pdfData.files.every(f => f.fileType === 'pdf'));
    logPass(`GET /api/gallery?type=pdf correctly filters only PDF documents (${pdfData.files.length} items)`);
  } catch (e) {
    logFail('GET /api/gallery?type=pdf failed', e.message);
  }

  try {
    const searchRes = await fetch(`${BASE_URL}/api/gallery?q=Handbook`);
    assert.strictEqual(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.files.length >= 1);
    assert.ok(searchData.files[0].name.includes('Handbook'));
    logPass(`GET /api/gallery?q=Handbook returns matching keyword files`);
  } catch (e) {
    logFail('GET /api/gallery?q=Handbook failed', e.message);
  }

  // 4. PUT /api/gallery/:id (Update Metadata)
  console.log(`\n${colors.bold}${colors.yellow}[Step 4] Update File Metadata (PUT /api/gallery/:id)${colors.reset}`);
  try {
    const putRes = await fetch(`${BASE_URL}/api/gallery/${imageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Architecture Blueprint v2',
        category: 'Enterprise Frameworks',
        tags: ['Playwright', 'Updated', 'V2'],
      }),
    });
    assert.strictEqual(putRes.status, 200);
    const putData = await putRes.json();
    assert.strictEqual(putData.name, 'Updated Architecture Blueprint v2');
    assert.strictEqual(putData.category, 'Enterprise Frameworks');
    logPass('PUT /api/gallery/:id successfully updated metadata in MongoDB');
  } catch (e) {
    logFail('PUT /api/gallery/:id failed', e.message);
  }

  // 5. Frontend Gallery Page
  console.log(`\n${colors.bold}${colors.yellow}[Step 5] Frontend Gallery Page Health (/gallery)${colors.reset}`);
  try {
    const pageRes = await fetch(`${BASE_URL}/gallery`);
    assert.strictEqual(pageRes.status, 200);
    logPass('GET /gallery rendered successfully with HTTP 200');
  } catch (e) {
    logFail('GET /gallery failed', e.message);
  }

  // 6. Safe Cleanup (DELETE /api/gallery/:id)
  console.log(`\n${colors.bold}${colors.yellow}[Step 6] Teardown & Permanent Deletion (DELETE /api/gallery/:id)${colors.reset}`);
  try {
    if (imageId) {
      const delImg = await fetch(`${BASE_URL}/api/gallery/${imageId}`, { method: 'DELETE' });
      assert.strictEqual(delImg.status, 200);
    }
    if (pdfId) {
      const delPdf = await fetch(`${BASE_URL}/api/gallery/${pdfId}`, { method: 'DELETE' });
      assert.strictEqual(delPdf.status, 200);
    }
    logPass('DELETE /api/gallery/:id safely unlinked files from disk & deleted MongoDB records');
  } catch (e) {
    logFail('DELETE /api/gallery/:id failed', e.message);
  }

  // Summary
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}Gallery Integration Test Summary:${colors.reset}`);
  console.log(`  ${colors.green}Total Passed: ${passed}${colors.reset}`);
  console.log(`  ${failed > 0 ? colors.red : colors.green}Total Failed: ${failed}${colors.reset}`);
  console.log(`  Overall Health: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runGalleryIntegrationSuite();
