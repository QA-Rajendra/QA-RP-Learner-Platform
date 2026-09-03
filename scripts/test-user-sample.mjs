import { parseTestCaseContent } from '../lib/testCaseParser.js';

const userPasted = `| TC ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
| ------- | ---------------------------------- | ----------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| LOGIN-001 | Login page loads successfully | Open application URL | Valid URL | Login page should display correctly | High |
| LOGIN-002 | Verify login page UI | Check username, password, Login button, Forgot Password | N/A | All required fields and controls should be visible | Medium |
| LOGIN-003 | Login with valid credentials | Enter valid username and password -> Click Login | Valid credentials | User should log in successfully and redirect to Dashboard | Critical |
| LOGIN-004 | Login with invalid username | Enter invalid username and valid password -> Login | Invalid username | Appropriate error message should be displayed | High |
| LOGIN-005 | Login with invalid password | Enter valid username and invalid password -> Login | Invalid password | Appropriate error message should be displayed | High |
| LOGIN-006 | Login with both fields blank | Click Login without entering data | Blank | Validation messages should be displayed | High |
| LOGIN-007 | Username blank | Enter password only -> Login | Username blank | Username required error displayed | High |`;

console.log('Testing parsing of user exact table:');
const result = parseTestCaseContent(userPasted, 'structured');
console.log('Detected format:', result.format);
console.log('Parsed steps count:', result.steps.length);
console.log('\nSteps:');
result.steps.forEach(s => {
  console.log(`Step ${s.stepNumber}:`);
  console.log(`  Action: ${s.action}`);
  console.log(`  Data: ${s.testData}`);
  console.log(`  Expected: ${s.expectedResult}`);
});
