#!/usr/bin/env node
'use strict';

/**
 * Pre-commit hook: scan staged files for common secret patterns.
 * Blocks commit if potential secrets are found.
 */

const { execSync } = require('child_process');
const path = require('path');

const SECRET_PATTERNS = [
  { name: 'Generic API Key',      pattern: /api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9\-_]{20,}/i },
  { name: 'Generic Secret',       pattern: /secret\s*[:=]\s*['"]?[A-Za-z0-9\-_]{20,}/i },
  { name: 'Generic Password',     pattern: /password\s*[:=]\s*['"]?[^\s'"]{8,}/i },
  { name: 'AWS Access Key',       pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Header',   pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'JWT Token',            pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];

// Files to skip (binary, lock files, coverage, etc.)
const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2',
  '.ttf', '.eot', '.pdf', '.zip', '.gz', '.lock', '.html',
]);

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function getStagedContent(file) {
  try {
    return execSync(`git show :${file}`, { encoding: 'utf8' });
  } catch {
    return '';
  }
}

const staged = getStagedFiles();
let found = false;

for (const file of staged) {
  const ext = path.extname(file).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) continue;

  const content = getStagedContent(file);
  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`[SECRET SCAN] Potential secret detected in "${file}": ${name}`);
      found = true;
    }
  }
}

if (found) {
  console.error('\n[SECRET SCAN] Commit blocked. Remove secrets before committing.');
  console.error('To skip this check (NOT recommended): set SKIP_SIMPLE_GIT_HOOKS=1\n');
  process.exit(1);
} else {
  console.log('[SECRET SCAN] No secrets detected. Proceeding with commit.');
  process.exit(0);
}
