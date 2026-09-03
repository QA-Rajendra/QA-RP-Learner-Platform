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

async function runMasterIntegrationSuite() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  QA RP LEARNER PLATFORM — MASTER API & INTEGRATION TEST SUITE  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  let authCookie = '';
  let testCourseId = null;
  let testLessonId = null;
  let testProjectId = null;
  let testCategoryId = null;
  let testVideoId = null;

  // ══════════════════════════════════════════════════════════════════
  // SECTION 1: AUTHENTICATION & SECURITY
  // ══════════════════════════════════════════════════════════════════
  console.log(`${colors.bold}${colors.yellow}[Section 1] Admin Authentication & Security Handshake${colors.reset}`);
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    assert.strictEqual(csrfRes.status, 200);
    const { csrfToken } = await csrfRes.json();
    const csrfCookie = csrfRes.headers.get('set-cookie') || '';
    
    const signInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookie,
      },
      body: new URLSearchParams({
        email: 'qarajendra4893@gmail.com',
        password: 'rgp@1234',
        csrfToken: csrfToken,
        json: 'true',
      }),
      redirect: 'manual',
    });

    const setCookieHeaders = signInRes.headers.getSetCookie ? signInRes.headers.getSetCookie() : [signInRes.headers.get('set-cookie')];
    authCookie = setCookieHeaders.filter(Boolean).map(c => c.split(';')[0]).join('; ');
    assert.ok(authCookie.includes('next-auth.session-token'), 'Must contain session token');
    logPass('NextAuth Admin Authentication handshake succeeded with session token');
  } catch (err) {
    logFail('Authentication handshake failed', err.message);
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 2: GLOBAL SETTINGS & BILLING APIS
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 2] Platform Settings & Billing REST APIs${colors.reset}`);
  try {
    const sRes = await fetch(`${BASE_URL}/api/settings`);
    assert.strictEqual(sRes.status, 200);
    const sData = await sRes.json();
    assert.ok(sData.siteName, 'siteName must exist');
    logPass(`GET /api/settings returns siteName: "${sData.siteName}"`);
  } catch (e) { logFail('GET /api/settings failed', e.message); }

  try {
    const pRes = await fetch(`${BASE_URL}/api/payments`);
    assert.strictEqual(pRes.status, 200);
    const pData = await pRes.json();
    assert.ok(pData.paymentSettings !== undefined);
    logPass(`GET /api/payments returns Common Fee: ₹${pData.paymentSettings?.commonFeeAmount || 499}`);
  } catch (e) { logFail('GET /api/payments failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 3: CATEGORIES CRUD & TAXONOMY API
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 3] Categories Taxonomy API & Dynamic Linkage${colors.reset}`);
  try {
    const catPost = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify({
        name: `Automated Test Category ${Date.now()}`,
        slug: `auto-test-cat-${Date.now()}`,
        icon: '🔬',
        description: 'Dynamically created category for automated testing',
      }),
    });
    assert.strictEqual(catPost.status, 201);
    const catJson = await catPost.json();
    testCategoryId = catJson._id;
    logPass(`POST /api/categories created category: ID ${testCategoryId}`);
  } catch (e) { logFail('POST /api/categories failed', e.message); }

  try {
    const catList = await fetch(`${BASE_URL}/api/categories`);
    assert.strictEqual(catList.status, 200);
    const cats = await catList.json();
    assert.ok(Array.isArray(cats) && cats.length > 0);
    logPass(`GET /api/categories returns ${cats.length} active categories`);
  } catch (e) { logFail('GET /api/categories failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 4: COURSES & 5-POINT LESSON STUDIO APIS
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 4] Courses & 5-Point Lesson Learning Studio APIs${colors.reset}`);
  try {
    const cPost = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify({
        title: `Playwright E2E Masterclass ${Date.now()}`,
        shortDescription: 'Master modern Playwright test automation with Page Object Models and sharding.',
        category: 'QA Automation',
        level: 'Intermediate',
        difficulty: 'Intermediate',
        duration: '10 Weeks',
        instructor: 'QA RP',
        isFree: true,
        price: 0,
        status: 'Active',
      }),
    });
    assert.strictEqual(cPost.status, 201);
    const cJson = await cPost.json();
    testCourseId = cJson._id;
    logPass(`POST /api/courses created course: ID ${testCourseId}`);
  } catch (e) { logFail('POST /api/courses failed', e.message); }

  try {
    const bPost = await fetch(`${BASE_URL}/api/courses/${testCourseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify({
        lessons: [
          {
            title: '1. Framework Architecture Setup',
            sectionTitle: 'Section 1: Architecture',
            duration: '14:00',
            accessType: 'FREE',
            notes: 'Detailed architectural breakdown of test runners.',
            codeSnippet: 'import { test } from "@playwright/test";',
            terminalCommand: 'npx playwright test',
            objectives: ['Setup NodeJS runtime', 'Configure playwright.config.ts'],
            quiz: [{ question: 'What is Playwright?', options: ['E2E framework', 'Relational DB'], correctAnswerIndex: 0, explanation: 'Playwright is an E2E testing library.' }],
            attachments: [{ name: 'playwright.config.ts', size: '2.1 KB', url: '#' }],
          },
          {
            title: '2. Page Object Model Design',
            sectionTitle: 'Section 1: Architecture',
            duration: '18:30',
            accessType: 'PAID',
            notes: 'Encapsulate selectors inside clean page classes.',
            codeSnippet: 'export class BasePage {}',
            terminalCommand: 'npx playwright test --grep="POM"',
            objectives: ['Implement BasePage', 'Extend LoginPage'],
            quiz: [{ question: 'Why use POM?', options: ['Maintainability', 'More locators'], correctAnswerIndex: 0, explanation: 'POM isolates UI changes.' }],
            attachments: [{ name: 'pom-guide.pdf', size: '1.8 MB', url: '#' }],
          }
        ]
      }),
    });
    assert.strictEqual(bPost.status, 201);
    const bJson = await bPost.json();
    testLessonId = Array.isArray(bJson) ? bJson[0]?._id : bJson._id;
    assert.ok(testLessonId, 'Lesson ID must be defined');
    logPass(`POST /api/courses/:id/lessons batch created ${Array.isArray(bJson) ? bJson.length : 1} lessons (ID: ${testLessonId})`);
  } catch (e) { logFail('POST /api/courses/:id/lessons batch creation failed', e.message); }

  try {
    const lGet = await fetch(`${BASE_URL}/api/courses/${testCourseId}/lessons`);
    assert.strictEqual(lGet.status, 200);
    const lList = await lGet.json();
    assert.strictEqual(lList.length, 2);
    logPass(`GET /api/courses/:id/lessons verified both lessons in curriculum`);
  } catch (e) { logFail('GET /api/courses/:id/lessons failed', e.message); }

  try {
    const lPut = await fetch(`${BASE_URL}/api/lessons/${testLessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify({
        notes: 'Updated architectural notes with multi-stage CI/CD breakdown.',
        codeSnippet: 'test("Updated Spec", async ({ page }) => { await page.goto("/dashboard"); });',
        terminalCommand: 'npx playwright test --headed',
        objectives: ['Master multi-stage execution', 'Trace viewer analysis'],
        quiz: [{ question: 'Updated Question?', options: ['A', 'B'], correctAnswerIndex: 0, explanation: 'Correct.' }],
      }),
    });
    assert.strictEqual(lPut.status, 200);
    logPass(`PUT /api/lessons/:id updated 5-Point Learning Studio data`);
  } catch (e) { logFail('PUT /api/lessons/:id failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 5: QA PORTFOLIO PROJECTS API
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 5] QA Portfolio Projects API${colors.reset}`);
  try {
    const pPost = await fetch(`${BASE_URL}/api/portfolio-projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify({
        title: `Enterprise Banking Automation Suite ${Date.now()}`,
        category: 'Web Automation',
        clientName: 'Global Finance Corp',
        industry: 'Banking',
        automationCoverage: 96,
        testCases: 420,
        defectsFound: 58,
        technologies: ['Playwright', 'TypeScript', 'Docker', 'Allure'],
        links: { github: 'https://github.com/qarajendra/suite', live: 'https://allure.example.com' },
      }),
    });
    assert.strictEqual(pPost.status, 201);
    const pJson = await pPost.json();
    testProjectId = pJson._id;
    logPass(`POST /api/portfolio-projects created project: ID ${testProjectId}`);
  } catch (e) { logFail('POST /api/portfolio-projects failed', e.message); }

  try {
    const pList = await fetch(`${BASE_URL}/api/portfolio-projects`);
    assert.strictEqual(pList.status, 200);
    const projs = await pList.json();
    assert.ok(Array.isArray(projs) && projs.length > 0);
    logPass(`GET /api/portfolio-projects returns ${projs.length} projects`);
  } catch (e) { logFail('GET /api/portfolio-projects failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 6: YOUTUBE VIDEO HUB API
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 6] YouTube Video Hub API${colors.reset}`);
  try {
    const vPost = await fetch(`${BASE_URL}/api/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookie },
      body: JSON.stringify({
        title: `Playwright Full Course Video ${Date.now()}`,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'QA Automation',
        description: 'Comprehensive test automation tutorial video',
      }),
    });
    assert.strictEqual(vPost.status, 201);
    const vJson = await vPost.json();
    testVideoId = vJson._id;
    logPass(`POST /api/youtube created video: ID ${testVideoId}`);
  } catch (e) { logFail('POST /api/youtube failed', e.message); }

  try {
    const vList = await fetch(`${BASE_URL}/api/youtube`);
    assert.strictEqual(vList.status, 200);
    const vids = await vList.json();
    assert.ok(Array.isArray(vids) && vids.length > 0);
    logPass(`GET /api/youtube returns ${vids.length} videos`);
  } catch (e) { logFail('GET /api/youtube failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 7: UPLOAD ENGINE (IMAGES & PDFS)
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 7] File & Media Upload Pipeline API${colors.reset}`);
  try {
    const pngFormData = new FormData();
    const pngBlob = new Blob([Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489', 'hex')], { type: 'image/png' });
    pngFormData.append('file', pngBlob, 'e2e-test-cover.png');
    pngFormData.append('fileType', 'image');

    const uRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Cookie': authCookie },
      body: pngFormData,
    });
    assert.strictEqual(uRes.status, 200);
    const uJson = await uRes.json();
    assert.ok(uJson.url?.startsWith('/uploads/'));
    logPass(`POST /api/upload (Image PNG) -> Generated: ${uJson.url}`);
  } catch (e) { logFail('POST /api/upload (Image) failed', e.message); }

  try {
    const pdfFormData = new FormData();
    const pdfBlob = new Blob(['%PDF-1.4 sample test document'], { type: 'application/pdf' });
    pdfFormData.append('file', pdfBlob, 'e2e-guide.pdf');
    pdfFormData.append('fileType', 'pdf');

    const pRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Cookie': authCookie },
      body: pdfFormData,
    });
    assert.strictEqual(pRes.status, 200);
    const pJson = await pRes.json();
    assert.ok(pJson.url?.startsWith('/uploads/'));
    logPass(`POST /api/upload (PDF Document) -> Generated: ${pJson.url}`);
  } catch (e) { logFail('POST /api/upload (PDF) failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 8: USERS, ANALYTICS, MESSAGES & TEST GENERATOR APIS
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 8] Ancillary & Automation Utility REST APIs${colors.reset}`);
  try {
    const uRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Cookie': authCookie },
    });
    assert.strictEqual(uRes.status, 200);
    logPass('GET /api/users returns user directory');
  } catch (e) { logFail('GET /api/users failed', e.message); }

  try {
    const aRes = await fetch(`${BASE_URL}/api/analytics`);
    assert.strictEqual(aRes.status, 200);
    const aData = await aRes.json();
    assert.ok(aData.overview?.totalCourses !== undefined);
    logPass(`GET /api/analytics returns ${aData.overview.totalCourses} courses & ${aData.overview.totalLessons} lessons`);
  } catch (e) { logFail('GET /api/analytics failed', e.message); }

  try {
    const mRes = await fetch(`${BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated E2E Tester',
        email: 'tester@example.com',
        subject: 'Master Test Verification',
        message: 'Platform health inquiry',
      }),
    });
    assert.strictEqual(mRes.status, 201);
    logPass('POST /api/messages contact inquiry accepted');
  } catch (e) { logFail('POST /api/messages failed', e.message); }

  try {
    const gRes = await fetch(`${BASE_URL}/api/generate-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Master Checkout API Suite',
        category: 'API Testing',
        codeDetails: {
          apiUrl: 'https://api.example.com/v1/checkout',
          apiMethod: 'POST',
          apiHeaders: '{\n  "Authorization": "Bearer sample_token"\n}',
          apiBody: '{\n  "orderId": "ORD-1234"\n}',
          testSteps: [{ action: 'POST /v1/checkout' }],
        }
      }),
    });
    assert.strictEqual(gRes.status, 200);
    const gData = await gRes.json();
    assert.ok(gData.playwrightTypeScript?.includes('import { test'));
    assert.ok(gData.restAssuredJava?.includes('io.restassured'));
    logPass('POST /api/generate-tests generated Playwright TypeScript & RestAssured Java specs');
  } catch (e) { logFail('POST /api/generate-tests failed', e.message); }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 9: FRONTEND PAGES & DEEP LINKING
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 9] Frontend UI Pages & Deep Linking Health${colors.reset}`);
  const pages = [
    { name: 'Home Page', path: '/' },
    { name: 'Courses Catalog', path: '/courses' },
    { name: 'Filtered Courses by Category', path: '/courses?category=QA%20Automation' },
    { name: 'Course Details Page', path: `/courses/${testCourseId}` },
    { name: 'Lesson Learning Workspace', path: `/learn/${testCourseId}/${testLessonId}` },
    { name: 'Projects Showcase', path: '/projects' },
    { name: 'Filtered Projects by Category', path: '/projects?category=Web%20Automation' },
    { name: 'Categories Hub', path: '/categories' },
    { name: 'YouTube Masterclasses', path: '/youtube' },
    { name: 'My Learning Dashboard', path: '/my-learning' },
    { name: 'About Platform', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Sign In', path: '/signin' },
    { name: 'Admin Settings Hub', path: '/settings' },
  ];

  for (const p of pages) {
    try {
      const res = await fetch(`${BASE_URL}${p.path}`);
      assert.strictEqual(res.status, 200);
      logPass(`[200] ${p.name} (${p.path})`);
    } catch (e) {
      logFail(`UI Page ${p.name} (${p.path}) failed`, e.message);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 10: CLEANUP & TEARDOWN
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.yellow}[Section 10] Safe Cleanup of Test Artifacts${colors.reset}`);
  try {
    if (testCourseId) await fetch(`${BASE_URL}/api/courses/${testCourseId}`, { method: 'DELETE', headers: { 'Cookie': authCookie } });
    if (testProjectId) await fetch(`${BASE_URL}/api/portfolio-projects/${testProjectId}`, { method: 'DELETE', headers: { 'Cookie': authCookie } });
    if (testCategoryId) await fetch(`${BASE_URL}/api/categories/${testCategoryId}`, { method: 'DELETE', headers: { 'Cookie': authCookie } });
    if (testVideoId) await fetch(`${BASE_URL}/api/youtube/${testVideoId}`, { method: 'DELETE', headers: { 'Cookie': authCookie } });
    logPass('Teardown complete: Cleaned up temporary test documents');
  } catch (e) {
    logFail('Cleanup warning', e.message);
  }

  // ══════════════════════════════════════════════════════════════════
  // MASTER SUMMARY
  // ══════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}Master API & Integration Test Summary:${colors.reset}`);
  console.log(`  ${colors.green}Total Passed: ${passed}${colors.reset}`);
  console.log(`  ${failed > 0 ? colors.red : colors.green}Total Failed: ${failed}${colors.reset}`);
  console.log(`  Overall System Health: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runMasterIntegrationSuite();
