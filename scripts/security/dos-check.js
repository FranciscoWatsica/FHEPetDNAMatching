#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🛡️  Checking for DoS vulnerabilities...
');

const files = execSync('find contracts -name "*.sol"').toString().split('
').filter(Boolean);

const dosPatterns = [
  { pattern: /fors*([^)]*.length[^)]*)/, message: 'Unbounded loop detected - potential DoS' },
  { pattern: /whiles*(true)/, message: 'Infinite loop detected' },
  { pattern: /external.*payable/, message: 'Payable external function - ensure reentrancy protection' }
];

let issuesFound = false;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  dosPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      console.log();
      issuesFound = true;
    }
  });
});

if (!issuesFound) {
  console.log('✅ No DoS vulnerabilities detected');
}

console.log('
✅ DoS protection check complete!');
