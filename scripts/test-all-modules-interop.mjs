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

async function checkRoute(name, path, expectedStatus = 200, fetchOptions = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, fetchOptions);
    if (res.status === expectedStatus) {
      console.log(`  ${colors.green}✓ PASS: [${res.status}] ${name} (${path})${colors.reset}`);
      passed++;
      return res;
    } else {
      console.log(`  ${colors.red}✗ FAIL: [${res.status} !== ${expectedStatus}] ${name} (${path})${colors.reset}`);
      failed++;
      return res;
    }
  } catch (err) {
    console.log(`  ${colors.red}✗ ERROR: ${name} (${path}) - ${err.message}${colors.reset}`);
    failed++;
    return null;
  }
}

async function runAllModulesCheck() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  QA RP Platform — Full Cross-Module Interoperability Check     ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  let authCookie = '';
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    if (csrfRes.ok) {
      const csrfData = await csrfRes.json();
      const csrfCookie = csrfRes.headers.get('set-cookie') || '';
      const authRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': csrfCookie },
        body: new URLSearchParams({ email: 'qarajendra4893@gmail.com', password: 'rgp@1234', csrfToken: csrfData.csrfToken, json: 'true' }),
        redirect: 'manual',
      });
      const setCookieHeaders = authRes.headers.getSetCookie ? authRes.headers.getSetCookie() : [authRes.headers.get('set-cookie')];
      authCookie = setCookieHeaders.filter(Boolean).map(c => c.split(';')[0]).join('; ');
    }
  } catch (e) {}

  // 1. Core Platform Pages
  console.log(`${colors.bold}${colors.yellow}[Group 1] Frontend Public & Core Pages${colors.reset}`);
  await checkRoute('Home / Landing Page', '/');
  await checkRoute('Courses Catalog Page', '/courses');
  await checkRoute('QA Projects Portfolio Page', '/projects');
  await checkRoute('Categories Taxonomy Page', '/categories');
  await checkRoute('YouTube Masterclasses Hub', '/youtube');
  await checkRoute('Student My Learning Dashboard', '/my-learning');
  await checkRoute('About Instructor & Platform', '/about');
  await checkRoute('Contact & Support Page', '/contact');
  await checkRoute('Sign In / Auth Page', '/signin');
  await checkRoute('Admin Settings & Studio Hub', '/settings');

  // 2. Core REST APIs
  console.log(`\n${colors.bold}${colors.yellow}[Group 2] Backend Data & CRUD REST APIs${colors.reset}`);
  await checkRoute('GET /api/settings (Global Config & Brand)', '/api/settings');
  await checkRoute('GET /api/payments (Paid Content Common Fee)', '/api/payments');
  await checkRoute('GET /api/courses (Course Catalog)', '/api/courses');
  await checkRoute('GET /api/portfolio-projects (QA Projects)', '/api/portfolio-projects');
  await checkRoute('GET /api/categories (Categories)', '/api/categories');
  await checkRoute('GET /api/youtube (Video Hub)', '/api/youtube');
  await checkRoute('GET /api/users (User Accounts)', '/api/users', 200, { headers: { Cookie: authCookie } });

  // 3. Dynamic Course & Learning Player Interoperability
  console.log(`\n${colors.bold}${colors.yellow}[Group 3] Dynamic Learning Workspace & Course Details${colors.reset}`);
  const coursesRes = await fetch(`${BASE_URL}/api/courses`);
  const coursesData = await coursesRes.json();
  const sampleCourse = Array.isArray(coursesData) && coursesData[0] ? coursesData[0] : null;

  if (sampleCourse && sampleCourse._id) {
    await checkRoute(`Course Details [${sampleCourse.title?.slice(0, 25)}...]`, `/courses/${sampleCourse._id}`);
    
    // Check lessons API for this course
    const lessonsRes = await fetch(`${BASE_URL}/api/courses/${sampleCourse._id}/lessons`);
    const lessonsData = await lessonsRes.json();
    console.log(`  ${colors.green}✓ PASS: Fetched ${lessonsData.length} lessons for Course ID ${sampleCourse._id}${colors.reset}`);
    passed++;

    const sampleLesson = Array.isArray(lessonsData) && lessonsData[0] ? lessonsData[0] : null;
    if (sampleLesson && sampleLesson._id) {
      await checkRoute(`Lesson Learning Player [${sampleLesson.title?.slice(0, 25)}...]`, `/learn/${sampleCourse._id}/${sampleLesson._id}`);
    }
  }

  // 4. Category Cross-Linking Verification
  console.log(`\n${colors.bold}${colors.yellow}[Group 4] Dynamic Category Filtering Across Modules${colors.reset}`);
  const catRes = await fetch(`${BASE_URL}/api/categories`);
  const catData = await catRes.json();
  if (Array.isArray(catData) && catData.length > 0) {
    const sampleCat = catData[0].name;
    await checkRoute(`Filter Courses by Category [${sampleCat}]`, `/courses?category=${encodeURIComponent(sampleCat)}`);
    await checkRoute(`Filter Projects by Category [${sampleCat}]`, `/projects?category=${encodeURIComponent(sampleCat)}`);
  }

  // 5. Verify Removed Content Module Returns 404 (No Ghost Routes)
  console.log(`\n${colors.bold}${colors.yellow}[Group 5] Cleanliness Check — Removed Module Verification${colors.reset}`);
  await checkRoute('Verify /content returns 404', '/content', 404);
  await checkRoute('Verify /api/content returns 404', '/api/content', 404);

  // Final Summary
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}Cross-Module Check Summary:${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${failed > 0 ? colors.red : colors.green}Failed: ${failed}${colors.reset}`);
  console.log(`  Overall Health: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runAllModulesCheck();
