import { spawn } from 'child_process';
import fs from 'fs';
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

// All scripts in scripts/ directory except run-all-tests.mjs
const scriptsDir = './scripts';
const files = fs.readdirSync(scriptsDir)
  .filter(f => f.endsWith('.mjs') && f !== 'run-all-tests.mjs')
  .sort();

function runScript(file) {
  return new Promise((resolve) => {
    const filePath = path.join(scriptsDir, file);
    console.log(`\n${colors.bold}${colors.yellow}================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}  RUNNING: ${file}${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}================================================================${colors.reset}`);

    const proc = spawn(process.execPath, [filePath], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    proc.on('close', (code) => {
      resolve({ file, success: code === 0, code });
    });

    proc.on('error', (err) => {
      console.error(`Error executing ${file}:`, err);
      resolve({ file, success: false, code: 1, error: err.message });
    });
  });
}

async function runAll() {
  console.log(`\n${colors.bold}${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║    QA RP LEARNER PLATFORM — EXECUTING ALL .MJS SCRIPTS       ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`Found ${files.length} scripts to execute:`);
  files.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));

  const results = [];
  const startTime = Date.now();

  for (const f of files) {
    const res = await runScript(f);
    results.push(res);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  CONSOLIDATED EXECUTION SCORECARD (${duration}s)                ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);

  let totalPassed = 0;
  for (const r of results) {
    if (r.success) totalPassed++;
    console.log(`  ${r.success ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset} : ${r.file} (exit ${r.code})`);
  }

  const passRate = Math.round((totalPassed / results.length) * 100);
  console.log(`\n  ${colors.bold}Scripts Succeeded: ${totalPassed} / ${results.length} (${passRate}%)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  process.exit(totalPassed === results.length ? 0 : 1);
}

runAll();
