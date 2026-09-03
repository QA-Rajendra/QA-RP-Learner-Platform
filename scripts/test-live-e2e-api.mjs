async function runE2E() {
  console.log('Testing live test-cases API...');

  // 1. Test Sample endpoint
  const sampleRes = await fetch('http://localhost:3000/api/test-cases/sample?format=table&module=Login');
  const sampleData = await sampleRes.json();
  console.log('1. Sample API Status:', sampleRes.status);
  console.log('   Sample format:', sampleData.format);
  if (!sampleData.sampleContent) throw new Error('Failed to get sample content');
  console.log('   ✓ Sample API verified!');

  // 2. Test Create endpoint with exact fields from user UI
  const createPayload = {
    module: 'Login',
    scenarioId: 'TS-LOGIN-002',
    testCaseId: 'TC-LOGIN-002',
    name: 'Login with valid Email ID and invalid password',
    priority: 'High',
    type: 'Positive',
    description: 'Verify system validation and security controls when valid email and invalid password are provided.',
    content: sampleData.sampleContent,
    format: 'table',
  };

  const createRes = await fetch('http://localhost:3000/api/test-cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload),
  });
  const createdData = await createRes.json();
  console.log('2. Create API Status:', createRes.status);
  console.log('   Created ID:', createdData.testCaseId);
  console.log('   Parsed Steps count:', createdData.steps?.length);
  if (!createRes.ok) throw new Error('Create failed: ' + JSON.stringify(createdData));
  console.log('   ✓ Create API verified!');

  // 3. Test List endpoint
  const listRes = await fetch('http://localhost:3000/api/test-cases?module=Login');
  const listData = await listRes.json();
  console.log('3. List API Status:', listRes.status);
  console.log('   Test Cases found:', listData.testCases?.length);
  console.log('   Total in Stats:', listData.stats?.total);
  if (!listRes.ok) throw new Error('List failed');
  console.log('   ✓ List API verified!');

  // 4. Test Update endpoint
  const updateRes = await fetch(`http://localhost:3000/api/test-cases/${createdData._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Automated' }),
  });
  const updatedData = await updateRes.json();
  console.log('4. Update API Status:', updateRes.status);
  console.log('   New Status:', updatedData.status);
  if (updatedData.status !== 'Automated') throw new Error('Update status mismatch');
  console.log('   ✓ Update API verified!');

  console.log('\n🎉 ALL LIVE TEST CASE API ENDPOINTS ARE 100% OPERATIONAL!');
}

runE2E().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
