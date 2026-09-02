const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`\n================================================================`);
  console.log(`  QA RP Learner Platform — Live API & System Health Check`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`================================================================\n`);

  const results = [];

  async function testEndpoint(name, path, options = {}) {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
      const duration = Date.now() - start;
      let body;
      try {
        body = await res.json();
      } catch (e) {
        body = await res.text();
      }

      const passed = options.expectedStatus ? res.status === options.expectedStatus : (res.status >= 200 && res.status < 400);
      results.push({ name, path, status: res.status, duration, passed, error: passed ? null : JSON.stringify(body) });
      console.log(`${passed ? '✅ PASS' : '❌ FAIL'} [${res.status}] ${name} (${duration}ms) -> ${path}`);
      return { status: res.status, body };
    } catch (err) {
      const duration = Date.now() - start;
      results.push({ name, path, status: 'ERROR', duration, passed: false, error: err.message });
      console.log(`❌ ERROR: ${name} (${duration}ms) -> ${err.message}`);
      return { status: 500, error: err.message };
    }
  }

  // 1. Core Platform & Analytics
  console.log(`-- Core Platform & Analytics --`);
  await testEndpoint('GET Platform Settings', '/api/settings');
  await testEndpoint('GET Payment & Fee Config', '/api/payments');
  await testEndpoint('GET Analytics Dashboard', '/api/analytics');
  await testEndpoint('GET Users List', '/api/users');
  await testEndpoint('GET Students Roster', '/api/students');

  // 2. Categories Taxonomy
  console.log(`\n-- Categories Taxonomy --`);
  await testEndpoint('GET Categories List', '/api/categories');

  // 3. Courses & Lessons
  console.log(`\n-- Courses & Curriculum --`);
  const coursesRes = await testEndpoint('GET Courses Catalog', '/api/courses');
  if (Array.isArray(coursesRes.body) && coursesRes.body.length > 0) {
    const courseId = coursesRes.body[0]._id;
    await testEndpoint(`GET Course Detail [${courseId}]`, `/api/courses/${courseId}`);
    await testEndpoint(`GET Course Lessons [${courseId}]`, `/api/courses/${courseId}/lessons`);
  }

  // 4. QA Portfolio Projects
  console.log(`\n-- QA Portfolio Projects --`);
  const projectsRes = await testEndpoint('GET QA Projects', '/api/portfolio-projects');
  if (Array.isArray(projectsRes.body) && projectsRes.body.length > 0) {
    const projectId = projectsRes.body[0]._id;
    await testEndpoint(`GET Project Detail [${projectId}]`, `/api/portfolio-projects/${projectId}`);
  }

  // 5. Admin Media & Document Gallery
  console.log(`\n-- Admin Media & PDF Gallery --`);
  await testEndpoint('GET Gallery Assets', '/api/gallery');
  await testEndpoint('GET Gallery Images Only', '/api/gallery?type=image');
  await testEndpoint('GET Gallery PDFs Only', '/api/gallery?type=pdf');

  // 6. YouTube Masterclasses Hub
  console.log(`\n-- YouTube Video Hub --`);
  await testEndpoint('GET YouTube Videos', '/api/youtube');

  // 7. Messages & Inquiries
  console.log(`\n-- Contact & Enrollments --`);
  await testEndpoint('GET Contact Messages', '/api/messages');
  await testEndpoint('GET Student Enrollments', '/api/enrollments');

  // 8. Test Generator AI endpoint
  console.log(`\n-- QA Automation Test Generator --`);
  await testEndpoint('POST Generate Tests API', '/api/generate-tests', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Smoke Test Suite',
      category: 'API Automation',
      codeDetails: {
        apiUrl: 'https://api.example.com/v1/auth',
        apiMethod: 'POST',
      }
    }),
    expectedStatus: 200
  });

  console.log(`\n================================================================`);
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`  TEST RESULTS SUMMARY:`);
  console.log(`  Total Endpoints Tested: ${total}`);
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Failed: ${failedCount}`);
  console.log(`  Success Rate: ${((passedCount / total) * 100).toFixed(1)}%`);
  console.log(`================================================================\n`);
}

runTests();
