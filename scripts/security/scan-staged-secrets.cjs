#!/usr/bin/env node
'use strict';

/**
 * Pre-commit hook: scan staged files for common secret patterns.
 * Blocks commit if potential secrets are found.
 *
 * Uses spawnSync (not execSync/shell) to prevent OS command injection
 * from malicious file names in the repository.
 */

const { spawnSync } = require('child_process');
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
  const result = spawnSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACM'],
    { encoding: 'utf8' }
  );
  if (result.status !== 0 || result.error) return [];
  return result.stdout.trim().split('\n').filter(Boolean);
}

function getStagedContent(file) {
  // Pass args as an array — never interpolated into a shell — to prevent injection.
  const result = spawnSync(
    'git',
    ['show', `--`, `:${file}`],
    { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 }
  );
  if (result.status !== 0 || result.error) return '';
  return result.stdout;
}

const staged = getStagedFiles();
let found = false;

for (const file of staged) {
  // Reject paths that start with '-' to prevent flag injection into git show.
  if (file.startsWith('-')) {
    console.error(`[SECRET SCAN] Skipping suspicious file path: "${file}"`);
    continue;
  }

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
