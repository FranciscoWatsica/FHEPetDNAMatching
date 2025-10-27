#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔐 Running Security Audit...
');

// 1. npm audit
console.log('1️⃣ Checking for vulnerable dependencies...');
try {
  execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ No critical vulnerabilities found
');
} catch (error) {
  console.warn('⚠️  Vulnerabilities detected. Review above.
');
}

// 2. Check for common security issues
console.log('2️⃣ Checking for common security patterns...');
const files = execSync('find contracts -name "*.sol"').toString().split('
').filter(Boolean);

const securityPatterns = [
  { pattern: /tx.origin/, message: 'WARNING: tx.origin usage detected' },
  { pattern: /delegatecall/, message: 'WARNING: delegatecall usage detected' },
  { pattern: /selfdestruct/, message: 'WARNING: selfdestruct usage detected' },
  { pattern: /block.timestamp/, message: 'INFO: block.timestamp usage (ensure not used for critical logic)' },
  { pattern: /block.number/, message: 'INFO: block.number usage detected' }
];

let issuesFound = false;
files.forEach(file => {
  const content = require('fs').readFileSync(file, 'utf8');
  securityPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      console.log();
      issuesFound = true;
    }
  });
});

if (!issuesFound) {
  console.log('✅ No common security issues found
');
}

// 3. Check for proper access control
console.log('3️⃣ Checking access control patterns...');
files.forEach(file => {
  const content = require('fs').readFileSync(file, 'utf8');
  const hasOwner = /owner/.test(content);
  const hasModifier = /modifier/.test(content);
  if (hasOwner && !hasModifier) {
    console.log();
  }
});

console.log('
✅ Security audit complete!');
