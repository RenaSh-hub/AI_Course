#!/usr/bin/env node
/**
 * afterFileEdit constitution guard for tests/** and pages/**.
 *
 * Matcher in hooks.json is tool type "Write"; this script filters paths via
 * file_path from stdin JSON.
 *
 * Exit 0 — allow
 * Exit 2 — block (WON'T violation introduced)
 * Other non-zero — fail closed when hooks.json has failClosed: true
 */

import fs from 'node:fs';
import path from 'node:path';

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

/** Glob-equivalent of tests/** or pages/** */
function inScope(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return /(^|\/)(tests|pages)\//.test(normalized);
}

/** Drop full-line // comments only — never strip inline // (breaks XPath strings). */
function stripFullLineComments(text) {
  return (text || '')
    .split(/\r?\n/)
    .map((line) => (line.trimStart().startsWith('//') ? '' : line))
    .join('\n');
}

/** Count literal expect( occurrences (including commented — used for drop detect). */
function countExpectOccurrences(text) {
  if (!text) return 0;
  return text.split('expect(').length - 1;
}

function isCommentedExpectLine(line) {
  const expectIdx = line.indexOf('expect(');
  if (expectIdx === -1) return false;
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//')) return true;
  const lineComment = line.indexOf('//');
  return lineComment !== -1 && lineComment < expectIdx;
}

function isActiveExpectLine(line) {
  return line.includes('expect(') && !isCommentedExpectLine(line);
}

function expectWasCommentedOut(oldText, newText) {
  const oldLines = (oldText || '').split(/\r?\n/);
  const newLines = (newText || '').split(/\r?\n/);
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    if (isActiveExpectLine(oldLines[i] ?? '') && isCommentedExpectLine(newLines[i] ?? '')) {
      return true;
    }
  }
  if (
    /\/\/\s*expect\(/.test(newText || '') &&
    !/\/\/\s*expect\(/.test(oldText || '')
  ) {
    const oldActive = (oldText || '').split(/\r?\n/).filter(isActiveExpectLine).length;
    const newActive = (newText || '').split(/\r?\n/).filter(isActiveExpectLine).length;
    if (newActive < oldActive) return true;
  }
  return false;
}

const CHECKS = [
  {
    id: 'waitForTimeout',
    message: 'page.waitForTimeout / waitForTimeout is forbidden',
    test: (code) => /\bwaitForTimeout\s*\(/.test(code),
  },
  {
    id: 'xpath',
    message: 'XPath locator is forbidden',
    test: (code) =>
      /\blocator\s*\(\s*(['"`])\s*(?:xpath\s*=\s*)?\/\//i.test(code) ||
      /\bxpath\s*[:=]\s*(['"`])\s*\/\//i.test(code) ||
      /\$x\s*\(/.test(code),
  },
  {
    id: 'any',
    message: 'TypeScript any is forbidden',
    test: (code) =>
      /(?::|\bas)\s*any\b/.test(code) ||
      /<\s*any\s*[>,]/.test(code) ||
      /\bany\s*\[\]/.test(code),
  },
  {
    id: 'hardcoded-credential',
    message: 'hardcoded credential/secret is forbidden',
    test: (code) => {
      // Ignore env lookups — secrets must come from process.env / CI secrets
      const stripped = code.replace(/process\.env\.\w+/g, 'process.env.ENV');
      return (
        /\b(?:password|passwd|pwd|secret|api[_-]?key|api[_-]?token|access[_-]?token|auth[_-]?token|DIDAXIS_PASSWORD|DIDAXIS_API_TOKEN)\s*[:=]\s*(['"`])[^'"`]{3,}\1/i.test(
          stripped,
        ) || /\bBearer\s+[A-Za-z0-9._\-+/=]{16,}/.test(stripped)
      );
    },
  },
  {
    id: 'describe-tag',
    message: 'tag on test.describe() is forbidden (tag individual tests only)',
    test: (code) =>
      /test\.describe(?:\.(?:only|skip|fix|serial|parallel))*\s*\(\s*(?:'[^']*'|"[^"]*"|`[^`]*`)\s*,\s*\{[\s\S]*?\btag\s*:/.test(
        code,
      ),
  },
];

function introducedViolations(oldCode, newCode) {
  const oldStripped = stripFullLineComments(oldCode);
  const newStripped = stripFullLineComments(newCode);
  const reasons = [];

  for (const check of CHECKS) {
    if (check.test(newStripped) && !check.test(oldStripped)) {
      reasons.push(check.message);
    }
  }

  const before = countExpectOccurrences(oldCode);
  const after = countExpectOccurrences(newCode);
  const commented = expectWasCommentedOut(oldCode, newCode);
  if (after < before) {
    reasons.push(`expect( occurrences dropped ${before} → ${after}`);
  }
  if (commented) {
    reasons.push('an expect( was commented out');
  }

  return reasons;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readStdin() || '{}');
  } catch (err) {
    process.stderr.write(
      `[block-wont-violations] invalid stdin JSON: ${err.message}\n`,
    );
    process.exit(1);
  }

  const filePath = payload.file_path || payload.filePath || '';
  if (!filePath || !inScope(filePath)) {
    process.exit(0);
  }

  const edits = Array.isArray(payload.edits) ? payload.edits : [];
  let oldBlob = '';
  let newBlob = '';

  if (edits.length > 0) {
    for (const edit of edits) {
      oldBlob += `${edit.old_string ?? edit.oldString ?? ''}\n`;
      newBlob += `${edit.new_string ?? edit.newString ?? ''}\n`;
    }
  } else {
    try {
      newBlob = fs.readFileSync(path.resolve(filePath), 'utf8');
      // Full rewrite with no before-image: treat empty old as baseline
      oldBlob = '';
    } catch (err) {
      process.stderr.write(
        `[block-wont-violations] cannot read ${filePath}: ${err.message}\n`,
      );
      process.exit(1);
    }
  }

  const reasons = introducedViolations(oldBlob, newBlob);
  if (reasons.length > 0) {
    process.stderr.write(
      `[block-wont-violations] BLOCKED ${filePath}: ${reasons.join('; ')}. ` +
        `See constitution WON'T — fix the edit, do not weaken the suite.\n`,
    );
    process.exit(2);
  }

  process.exit(0);
}

main();
