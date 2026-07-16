#!/usr/bin/env node
/**
 * afterFileEdit guard for tests/** — block edits that weaken assertions.
 *
 * Reads file_path (+ edits) from stdin JSON.
 * Exit 0 — allow
 * Exit 2 — block (fewer expect( occurrences, or an expect( commented out)
 * Other non-zero — fail closed (hooks.json failClosed: true)
 */

import fs from 'node:fs';
import path from 'node:path';

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

/** Count literal expect( occurrences. */
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

/** True if an active expect( in old became a commented expect( in new. */
function expectWasCommentedOut(oldText, newText) {
  const oldLines = (oldText || '').split(/\r?\n/);
  const newLines = (newText || '').split(/\r?\n/);
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    if (isActiveExpectLine(oldLines[i] ?? '') && isCommentedExpectLine(newLines[i] ?? '')) {
      return true;
    }
  }
  // Region replace: new introduces // expect( that old did not have as a comment
  if (
    /\/\/\s*expect\(/.test(newText || '') &&
    !/\/\/\s*expect\(/.test(oldText || '') &&
    [...(oldText || '').matchAll(/expect\(/g)].some(() => true)
  ) {
    // If any former active expect disappeared into a comment form
    const oldActive = (oldText || '')
      .split(/\r?\n/)
      .filter(isActiveExpectLine).length;
    const newActive = (newText || '')
      .split(/\r?\n/)
      .filter(isActiveExpectLine).length;
    if (newActive < oldActive) return true;
  }
  return false;
}

/** Glob-equivalent of tests/** */
function underTests(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return /(^|\/)tests\//.test(normalized);
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readStdin() || '{}');
  } catch (err) {
    process.stderr.write(
      `[block-weakened-assertions] invalid stdin JSON: ${err.message}\n`,
    );
    process.exit(1);
  }

  const filePath = payload.file_path || payload.filePath || '';
  if (!filePath || !underTests(filePath)) {
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
      oldBlob = newBlob;
    } catch (err) {
      process.stderr.write(
        `[block-weakened-assertions] cannot read ${filePath}: ${err.message}\n`,
      );
      process.exit(1);
    }
  }

  const before = countExpectOccurrences(oldBlob);
  const after = countExpectOccurrences(newBlob);
  const commented = expectWasCommentedOut(oldBlob, newBlob);

  if (after < before || commented) {
    const reasons = [];
    if (after < before) {
      reasons.push(`expect( occurrences dropped ${before} → ${after}`);
    }
    if (commented) {
      reasons.push('an expect( was commented out');
    }
    process.stderr.write(
      `[block-weakened-assertions] BLOCKED ${filePath}: ${reasons.join('; ')}. ` +
        `Never weaken or delete assertions to pass — heal POM locators only.\n`,
    );
    process.exit(2);
  }

  process.exit(0);
}

main();
