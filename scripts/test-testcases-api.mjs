import { parseTestCaseContent } from '../lib/testCaseParser.js';

async function runTests() {
  console.log('==============================================');
  console.log('       TEST CASE PARSER TEST SUITE            ');
  console.log('==============================================\n');

  // Test 1: Standard Table
  console.log('1. Testing Standard Table Parser...');
  const sampleTable = `| Step | Action | Test Data | Expected Result |
|---|---|---|---|
| 1 | Navigate to /signin | /signin | Login form loaded |
| 2 | Enter credentials | user@test.com | Field accepts value |`;

  const parsed1 = parseTestCaseContent(sampleTable, 'table');
  console.log('   Parsed steps count:', parsed1.steps.length);
  if (parsed1.steps.length === 2 && parsed1.steps[0].action === 'Navigate to /signin') {
    console.log('   ✓ Test 1: Standard Table PASSED!');
  } else {
    throw new Error('Test 1 failed: ' + JSON.stringify(parsed1));
  }

  // Test 2: 6-column User Scenario Table from UI Screenshot
  console.log('\n2. Testing 6-Column Custom Scenario Table (User Screenshot)...');
  const userTable = `| TC ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
| ------- | ---------------------------------- | ----------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| LOGIN-001 | Login page loads successfully | Open application URL | Valid URL | Login page should display correctly | High |
| LOGIN-002 | Verify login page UI | Check username, password, Login button, Forgot Password | N/A | All required fields and controls should be visible | Medium |
| LOGIN-003 | Login with valid credentials | Enter valid username and password -> Click Login | Valid credentials | User should log in successfully and redirect to Dashboard | Critical |
| LOGIN-004 | Login with invalid username | Enter invalid username and valid password -> Login | Invalid username | Appropriate error message should be displayed | High |
| LOGIN-005 | Login with invalid password | Enter valid username and invalid password -> Login | Invalid password | Appropriate error message should be displayed | High |
| LOGIN-006 | Login with both fields blank | Click Login without entering data | Blank | Validation messages should be displayed | High |
| LOGIN-007 | Username blank | Enter password only -> Login | Username blank | Username required error displayed | High |`;

  const parsed2 = parseTestCaseContent(userTable, 'structured');
  console.log('   Detected format:', parsed2.format);
  console.log('   Parsed steps count:', parsed2.steps.length);
  if (parsed2.steps.length === 7 && parsed2.steps[0].expectedResult === 'Login page should display correctly') {
    console.log('   ✓ Test 2: 6-Column Custom Scenario Table PASSED (All 7 steps mapped)!');
  } else {
    throw new Error('Test 2 failed: ' + JSON.stringify(parsed2));
  }

  // Test 3: CSV Format
  console.log('\n3. Testing CSV Parser...');
  const sampleCsv = `"Step","Action","Test Data","Expected Result"
"1","Open app","https://app","Home screen"
"2","Click login","Click","Login modal"`;
  const parsed3 = parseTestCaseContent(sampleCsv, 'csv');
  console.log('   Parsed CSV steps count:', parsed3.steps.length);
  if (parsed3.steps.length === 2) {
    console.log('   ✓ Test 3: CSV Format PASSED!');
  } else {
    throw new Error('Test 3 failed');
  }

  // Test 4: Plain Text Format
  console.log('\n4. Testing Plain Text Format...');
  const sampleText = `Step 1: Open browser.
Expected Result: Browser launches cleanly.
Step 2: Load URL.
Expected Result: Page responds with 200.`;
  const parsed4 = parseTestCaseContent(sampleText, 'plain_text');
  console.log('   Parsed Text steps count:', parsed4.steps.length);
  if (parsed4.steps.length === 2) {
    console.log('   ✓ Test 4: Plain Text Format PASSED!');
  } else {
    throw new Error('Test 4 failed');
  }

  // Test 5: Excel TSV Format
  console.log('\n5. Testing Excel TSV Format...');
  const sampleTsv = `Step\tAction\tTest Data\tExpected Result
1\tClick checkout\tCart Items\tPayment modal appears
2\tPay with card\t4242...\tOrder placed`;
  const parsed5 = parseTestCaseContent(sampleTsv, 'excel');
  console.log('   Parsed TSV steps count:', parsed5.steps.length);
  if (parsed5.steps.length === 2) {
    console.log('   ✓ Test 5: Excel TSV Format PASSED!');
  } else {
    throw new Error('Test 5 failed');
  }

  console.log('\n==============================================');
  console.log('   🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY!  ');
  console.log('==============================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
