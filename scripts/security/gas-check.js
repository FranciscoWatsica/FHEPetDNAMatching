#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('⛽ Running Gas Optimization Check...
');

console.log('1️⃣ Analyzing contract sizes...');
try {
  execSync('npx hardhat size-contracts', { stdio: 'inherit' });
} catch (error) {
  console.warn('Contract size check failed');
}

console.log('
2️⃣ Checking for gas optimization opportunities...');

const files = execSync('find contracts -name "*.sol"').toString().split('
').filter(Boolean);

const gasOptimizations = [
  { pattern: /strings+memory/, message: 'Consider using bytes32 instead of string' },
  { pattern: /uint256[]s+memory/, message: 'Consider using calldata for read-only arrays' },
  { pattern: /fors*(.*length.*)/, message: 'Cache array length in loops' },
  { pattern: /publics+w+s*;/, message: 'Consider using private variables with getter' }
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  gasOptimizations.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      console.log();
    }
  });
});

console.log('
✅ Gas optimization check complete!');
