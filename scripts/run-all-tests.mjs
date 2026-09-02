import { spawn } from 'child_process';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const suites = [
  { name: '1. Platform REST APIs Health Suite', file: './scripts/test-all-apis.mjs' },
  { name: '2. Admin Media & PDF Gallery Suite', file: './scripts/test-gallery-integration.mjs' },
  { name: '3. Cross-Module Interoperability Suite', file: './scripts/test-all-modules-interop.mjs' },
  { name: '4. Master End-to-End & CRUD Suite', file: './scripts/master-e2e-suite.mjs' },
];

function runScript(suite) {
  return new Promise((resolve) => {
    console.log(`\n${colors.bold}${colors.yellow}================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}  RUNNING: ${suite.name} (${suite.file})${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}================================================================${colors.reset}`);

    const proc = spawn(process.execPath, [suite.file], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    proc.on('close', (code) => {
      resolve({ suite: suite.name, success: code === 0, code });
    });

    proc.on('error', (err) => {
      console.error(`Error executing ${suite.file}:`, err);
      resolve({ suite: suite.name, success: false, code: 1, error: err.message });
    });
  });
}

async function runAllSuites() {
  console.log(`\n${colors.bold}${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║   QA RP LEARNER PLATFORM — MASTER TEST RUNNER ORCHESTRATOR   ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);

  const results = [];
  const startTime = Date.now();

  for (const s of suites) {
    const res = await runScript(s);
    results.push(res);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  CONSOLIDATED TEST EXECUTION SCORECARD (${duration}s)          ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);

  let totalPassed = 0;
  for (const r of results) {
    if (r.success) totalPassed++;
    console.log(`  ${r.success ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset} : ${r.suite}`);
  }

  const passRate = Math.round((totalPassed / results.length) * 100);
  console.log(`\n  ${colors.bold}Test Suites Passed: ${totalPassed} / ${results.length} (${passRate}%)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(totalPassed === results.length ? 0 : 1);
}

runAllSuites();
