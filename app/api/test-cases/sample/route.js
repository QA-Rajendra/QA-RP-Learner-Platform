import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'structured';
  const moduleName = searchParams.get('module') || 'Login';

  const isRbac = moduleName.toLowerCase().includes('access') || moduleName.toLowerCase().includes('role');

  const rbacTableSample = `| TC ID | Test Scenario | Test Steps | Test Data | Expected Result | Priority |
| ------- | ---------------------------------- | ----------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| RBAC-001 | Admin has full CRUD access to Courses | Open Creator Studio -> Create new course with sections | Admin Credentials | Course created, saved to MongoDB Atlas, and published to course catalog | Critical |
| RBAC-002 | Student has Read-Only access to Course Catalog | Open /courses catalog -> Inspect action buttons | Student Credentials | Courses list is viewable; Add, Edit, and Delete controls are absent | Critical |
| RBAC-003 | Admin can update global Common Fee | Open Settings -> Paid Content -> Change fee to ₹499 | Admin Session | PUT /api/settings succeeds; global lesson fee updated in MongoDB | High |
| RBAC-004 | Student is blocked from Settings Studio | Navigate directly to /settings in browser | Student / Guest | Settings Studio and Admin Gallery are restricted; no mutation controls rendered | Critical |
| RBAC-005 | Student has Read-Only access to Portfolio Projects | Open /projects -> Inspect case studies and metrics | Student Session | Project descriptions, repos, and test coverage metrics viewable in read-only mode | High |
| RBAC-006 | Student cannot delete Portfolio Projects | Send DELETE /api/portfolio-projects/:id | Student Session | Request rejected; unauthorized deletion prevented | Critical |
| RBAC-007 | Admin can promote or demote user roles | Open Roles tab -> Change User to Admin | Admin Session | User role updated in database and new permissions take effect immediately | High |`;

  const samples = {
    table: isRbac ? rbacTableSample : `| Step | Action Description | Test Data / Input | Expected Result |
|---|---|---|---|
| 1 | Navigate to Login URL | https://qarp.io/signin | Login page displays with Email & Password input fields |
| 2 | Enter valid email address | tester.qa@example.com | Email input accepted with checkmark validation |
| 3 | Enter invalid password | WrongPass!99 | Password masked with eye toggle available |
| 4 | Click "Sign In" button | Click Action | Error notification displays: "Invalid email or password" |
| 5 | Verify password field state | Inspection | Password field remains cleared and focused for re-entry |`,

    excel: `Step\tAction Description\tTest Data\tExpected Result
1\tOpen Application Login Screen\thttps://qarp.io/signin\tPage loaded in under 1.5 seconds with SSL verified
2\tEnter Registered User Email\tqa.automation@qarp.com\tInput validated without syntax warnings
3\tEnter Incorrect Password\tInvalidPass#2026\tPassword masked, login button enabled
4\tSubmit Login Form\tClick Submit\tHTTP 401 response handled; banner: "Invalid credentials"
5\tVerify Attempt Lockout Counter\t3 Consecutive attempts\tCaptcha challenge is presented after 3 failures`,

    csv: `"Step","Action","Test Data","Expected Result"
"1","Navigate to Portal Login","https://qarp.io/signin","Login container is visible and accessible"
"2","Provide valid registered email","admin@qarp.com","Email syntax passes RFC 5322 validation"
"3","Provide mismatched secret key","Abc#99999","Asterisks displayed in input field"
"4","Trigger submit handler","Click CTA button","Toast alert displays: 'Authentication Failed'"
"5","Inspect network telemetry","POST /api/auth/callback","Response status code 401 with error code 'ERR_AUTH_INVALID'"`,

    plain_text: `Step 1: Navigate to the user authentication endpoint (/signin).
Expected Result: Login form renders with Email, Password inputs, and OAuth provider buttons.

Step 2: Enter registered email "qarajendra4893@gmail.com".
Expected Result: Field accepts string with no validation warning.

Step 3: Enter invalid password "IncorrectPassword@123".
Expected Result: Characters are securely masked in the password input.

Step 4: Click the "Sign In" button.
Expected Result: Error banner appears stating "Invalid credentials. Please try again."

Step 5: Verify that user session token is NOT created in browser cookies or localStorage.
Expected Result: No auth-token is issued and user remains on the login page.`,

    structured: `[
  {
    "stepNumber": 1,
    "action": "Navigate to login screen at /signin",
    "testData": "URL: /signin",
    "expectedResult": "Authentication modal renders with email and password fields",
    "status": "Not Run"
  },
  {
    "stepNumber": 2,
    "action": "Enter valid email address",
    "testData": "email: tester@qarp.io",
    "expectedResult": "Valid email format is recognized with green border",
    "status": "Not Run"
  },
  {
    "stepNumber": 3,
    "action": "Enter invalid password",
    "testData": "password: WrongPassword#2026",
    "expectedResult": "Input is masked and submit button becomes active",
    "status": "Not Run"
  },
  {
    "stepNumber": 4,
    "action": "Click 'Sign In' button",
    "testData": "Action: Click CTA",
    "expectedResult": "System returns 401 error and shows toast: 'Invalid credentials'",
    "status": "Not Run"
  },
  {
    "stepNumber": 5,
    "action": "Verify failed attempt counter and audit log",
    "testData": "Audit Event: AUTH_FAILURE",
    "expectedResult": "Security event logged and attempt count incremented by 1",
    "status": "Not Run"
  }
]`,
  };

  const sampleContent = samples[format.toLowerCase()] || samples.structured;

  return NextResponse.json({
    format,
    module: moduleName,
    sampleContent,
  });
}
