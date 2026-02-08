/**
 * Add focus ring styles to <input> and <textarea> elements that have
 * outline: 'none' but no corresponding focus-ring (boxShadow) handling.
 *
 * For each qualifying element the script will:
 *   - If onFocus exists but does not set boxShadow  -> append boxShadow + borderColor lines
 *   - If onBlur  exists but does not reset boxShadow -> append boxShadow + borderColor reset lines
 *   - If no onFocus handler at all                   -> add onFocus + onBlur props before />
 *
 * Elements that already have BOTH onFocus AND onBlur with boxShadow are skipped.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'packages/core/src/components/custom');

// ---------------------------------------------------------------------------
// Walk the tree and collect every .tsx file
// ---------------------------------------------------------------------------
function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Starting from `pos` inside `src`, find the matching closing brace / bracket
 * for the character at `pos` (which must be one of { [ ().
 * Returns the index of the matching closer.
 */
function findMatchingClose(src, pos) {
  const open = src[pos];
  const close = { '{': '}', '[': ']', '(': ')' }[open];
  if (!close) return -1;

  let depth = 1;
  let i = pos + 1;
  while (i < src.length && depth > 0) {
    if (src[i] === open) depth++;
    else if (src[i] === close) depth--;
    // Skip template-literal expressions
    if (src[i] === '`') {
      i++;
      while (i < src.length && src[i] !== '`') {
        if (src[i] === '\\') i++; // skip escaped char
        if (src[i] === '$' && src[i + 1] === '{') {
          // recurse into template expression
          i++; // skip $
          const end = findMatchingClose(src, i);
          if (end !== -1) i = end;
        }
        i++;
      }
    }
    // Skip string literals (single and double quotes)
    if (src[i] === "'" || src[i] === '"') {
      const q = src[i];
      i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') i++;
        i++;
      }
    }
    i++;
  }
  return depth === 0 ? i - 1 : -1;
}

/**
 * Given the start of a JSX element (<input or <textarea), find the self-closing />
 * while correctly skipping nested braces inside props.
 * Returns the index of the '/' in '/>'.
 */
function findSelfClose(src, elementStart) {
  let i = elementStart;
  while (i < src.length) {
    const ch = src[i];
    // Found self-close
    if (ch === '/' && src[i + 1] === '>') return i;
    // Opening brace -> skip to matching close (JSX expression)
    if (ch === '{') {
      const end = findMatchingClose(src, i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }
    // End of an opening tag without self-close (closing >)
    if (ch === '>') return -1;
    // Skip string literals inside props
    if (ch === '"' || ch === "'") {
      i++;
      while (i < src.length && src[i] !== ch) {
        if (src[i] === '\\') i++;
        i++;
      }
    }
    i++;
  }
  return -1;
}

/**
 * Extract the full text of a JSX prop value that starts with `{`.
 * Returns { value, end } where end is the index after the closing `}`.
 */
function extractPropValue(src, braceStart) {
  const end = findMatchingClose(src, braceStart);
  if (end === -1) return null;
  return { value: src.slice(braceStart, end + 1), end: end + 1 };
}

// ---------------------------------------------------------------------------
// Main logic
// ---------------------------------------------------------------------------
const files = walk(ROOT);
let totalModified = 0;
let totalElements = 0;

console.log(`Scanning ${files.length} .tsx files for <input>/<textarea> with outline: 'none'...\n`);

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);
  let fileModified = false;
  let fileElementCount = 0;

  // We iterate by finding each <input or <textarea occurrence
  const elementPattern = /<(input|textarea)\b/g;
  let elementMatch;

  // We process from end-to-start so that insertions don't shift indices
  // of earlier matches.  Collect all matches first, then reverse.
  const matches = [];
  while ((elementMatch = elementPattern.exec(content)) !== null) {
    matches.push({ index: elementMatch.index, tag: elementMatch[1] });
  }
  matches.reverse();

  for (const { index: elemStart, tag } of matches) {
    // Find the self-closing /> for this element
    const selfCloseSlash = findSelfClose(content, elemStart);
    if (selfCloseSlash === -1) {
      // Not self-closing (e.g. <textarea>...</textarea>) — skip
      continue;
    }

    const elementText = content.slice(elemStart, selfCloseSlash + 2); // includes />

    // Check: does this element have outline: 'none'?
    if (!elementText.includes("outline: 'none'")) continue;

    // Determine what focus handling already exists
    const hasOnFocus = /\bonFocus\s*=/.test(elementText);
    const hasOnBlur = /\bonBlur\s*=/.test(elementText);

    // Check if existing handlers already set boxShadow
    const focusHasBoxShadow = hasOnFocus && (() => {
      const m = elementText.match(/\bonFocus\s*=\s*\{/);
      if (!m) return false;
      const braceIdx = elemStart + m.index + m[0].length - 1;
      const prop = extractPropValue(content, braceIdx);
      return prop ? prop.value.includes('boxShadow') : false;
    })();

    const blurHasBoxShadow = hasOnBlur && (() => {
      const m = elementText.match(/\bonBlur\s*=\s*\{/);
      if (!m) return false;
      const braceIdx = elemStart + m.index + m[0].length - 1;
      const prop = extractPropValue(content, braceIdx);
      return prop ? prop.value.includes('boxShadow') : false;
    })();

    // If both already handle boxShadow, nothing to do
    if (focusHasBoxShadow && blurHasBoxShadow) continue;

    // --- Determine indentation from the element's opening line ---
    let lineStart = content.lastIndexOf('\n', elemStart);
    lineStart = lineStart === -1 ? 0 : lineStart + 1;
    const leadingWhitespace = content.slice(lineStart, elemStart).match(/^(\s*)/)?.[1] || '';
    const propIndent = leadingWhitespace + '  '; // one level deeper for props

    // CASE 1: onFocus exists but has no boxShadow -> augment it
    if (hasOnFocus && !focusHasBoxShadow) {
      const focusMatch = elementText.match(/\bonFocus\s*=\s*\{/);
      if (focusMatch) {
        const absBraceStart = elemStart + focusMatch.index + focusMatch[0].length - 1;
        const braceEnd = findMatchingClose(content, absBraceStart);
        if (braceEnd !== -1) {
          // Insert our lines right before the closing }
          // Find the last non-whitespace before braceEnd
          const focusInsert =
            `\n${propIndent}  e.currentTarget.style.boxShadow = \`0 0 0 2px \${tokens.colors.primaryScale[100]}\`;` +
            `\n${propIndent}  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];`;

          // Walk backward from braceEnd to find where to insert (before trailing whitespace + })
          let insertAt = braceEnd;
          // We want to insert before the final } but after the last statement
          // Find position of last ; or { before braceEnd
          const innerContent = content.slice(absBraceStart + 1, braceEnd);
          const lastSemiOrBrace = Math.max(innerContent.lastIndexOf(';'), innerContent.lastIndexOf('{'));
          if (lastSemiOrBrace !== -1) {
            insertAt = absBraceStart + 1 + lastSemiOrBrace + 1;
          }

          content = content.slice(0, insertAt) + focusInsert + content.slice(insertAt);
          fileModified = true;
        }
      }
    }

    // CASE 2: onBlur exists but has no boxShadow -> augment it
    // Re-find selfCloseSlash because content may have shifted
    if (hasOnBlur && !blurHasBoxShadow) {
      // Re-scan element text after possible mutation
      const newSelfClose = findSelfClose(content, elemStart);
      if (newSelfClose === -1) continue;
      const updatedElementText = content.slice(elemStart, newSelfClose + 2);

      const blurMatch = updatedElementText.match(/\bonBlur\s*=\s*\{/);
      if (blurMatch) {
        const absBraceStart = elemStart + blurMatch.index + blurMatch[0].length - 1;
        const braceEnd = findMatchingClose(content, absBraceStart);
        if (braceEnd !== -1) {
          const blurInsert =
            `\n${propIndent}  e.currentTarget.style.boxShadow = 'none';` +
            `\n${propIndent}  e.currentTarget.style.borderColor = tokens.colors.neutral[300];`;

          const innerContent = content.slice(absBraceStart + 1, braceEnd);
          const lastSemiOrBrace = Math.max(innerContent.lastIndexOf(';'), innerContent.lastIndexOf('{'));
          let insertAt = braceEnd;
          if (lastSemiOrBrace !== -1) {
            insertAt = absBraceStart + 1 + lastSemiOrBrace + 1;
          }

          content = content.slice(0, insertAt) + blurInsert + content.slice(insertAt);
          fileModified = true;
        }
      }
    }

    // CASE 3: No onFocus at all -> add both onFocus and onBlur before />
    if (!hasOnFocus && !hasOnBlur) {
      // Re-find selfCloseSlash because content may have shifted
      const newSelfClose = findSelfClose(content, elemStart);
      if (newSelfClose === -1) continue;

      const focusBlurBlock =
        `\n${propIndent}onFocus={(e) => {` +
        `\n${propIndent}  e.currentTarget.style.boxShadow = \`0 0 0 2px \${tokens.colors.primaryScale[100]}\`;` +
        `\n${propIndent}  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];` +
        `\n${propIndent}}}` +
        `\n${propIndent}onBlur={(e) => {` +
        `\n${propIndent}  e.currentTarget.style.boxShadow = 'none';` +
        `\n${propIndent}  e.currentTarget.style.borderColor = tokens.colors.neutral[300];` +
        `\n${propIndent}}}` +
        `\n${leadingWhitespace}`;

      content = content.slice(0, newSelfClose) + focusBlurBlock + content.slice(newSelfClose);
      fileModified = true;
    }

    // CASE 4: Has onFocus (that we may have just augmented) but no onBlur -> add onBlur
    if (hasOnFocus && !hasOnBlur) {
      const newSelfClose = findSelfClose(content, elemStart);
      if (newSelfClose === -1) continue;

      const blurBlock =
        `\n${propIndent}onBlur={(e) => {` +
        `\n${propIndent}  e.currentTarget.style.boxShadow = 'none';` +
        `\n${propIndent}  e.currentTarget.style.borderColor = tokens.colors.neutral[300];` +
        `\n${propIndent}}}` +
        `\n${leadingWhitespace}`;

      content = content.slice(0, newSelfClose) + blurBlock + content.slice(newSelfClose);
      fileModified = true;
    }

    // CASE 5: Has onBlur but no onFocus -> add onFocus
    if (!hasOnFocus && hasOnBlur) {
      const newSelfClose = findSelfClose(content, elemStart);
      if (newSelfClose === -1) continue;

      const focusBlock =
        `\n${propIndent}onFocus={(e) => {` +
        `\n${propIndent}  e.currentTarget.style.boxShadow = \`0 0 0 2px \${tokens.colors.primaryScale[100]}\`;` +
        `\n${propIndent}  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];` +
        `\n${propIndent}}}` +
        `\n${leadingWhitespace}`;

      content = content.slice(0, newSelfClose) + focusBlock + content.slice(newSelfClose);
      fileModified = true;
    }

    if (fileModified) fileElementCount++;
  }

  if (fileModified) {
    writeFileSync(filePath, content, 'utf8');
    totalModified++;
    totalElements += fileElementCount;
    console.log(`  ✓ ${rel} (${fileElementCount} element${fileElementCount !== 1 ? 's' : ''})`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Files modified: ${totalModified}`);
console.log(`Elements updated: ${totalElements}`);
