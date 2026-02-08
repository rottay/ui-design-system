/**
 * fix-glass-adoption.mjs
 *
 * Adds glass effect support for the Modern engine in preset files that use
 * `createCardStyle(tokens, { ... })` but don't pass a `glass` parameter.
 *
 * For each qualifying file:
 *   1. Adds `glass: isGlass` to every createCardStyle options object that lacks it
 *   2. Inserts `const isGlass = engine === 'modern' && !!tokens.glass;` if missing
 *   3. Ensures `engine` is destructured from the preset context if missing
 *
 * Skips:
 *   - Files where ALL createCardStyle calls already have `glass:`
 *   - navigation-editor/ directory
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const PRESETS_ROOT = join(
  process.cwd(),
  'packages/core/src/components/custom'
);

const EXCLUDE_DIRS = ['navigation-editor'];

function walkPresets(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      results.push(...walkPresets(fullPath));
    } else if (entry.name.endsWith('.tsx') && fullPath.includes('/presets/')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Find all createCardStyle(tokens, { ... }) call sites and check whether they
 * already contain a `glass` key. Returns an array of { start, end } char
 * offsets for calls that are MISSING `glass`.
 */
function findCallsWithoutGlass(content) {
  const results = [];
  // Match `createCardStyle(tokens, {` and capture offset
  const callRe = /createCardStyle\s*\(\s*tokens\s*,\s*\{/g;
  let match;
  while ((match = callRe.exec(content)) !== null) {
    const openBraceIndex = match.index + match[0].length - 1; // position of `{`
    // Walk forward to find the matching `}`
    let depth = 1;
    let i = openBraceIndex + 1;
    while (i < content.length && depth > 0) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') depth--;
      i++;
    }
    const closeBraceIndex = i - 1; // position of matching `}`
    const optionsBody = content.substring(openBraceIndex + 1, closeBraceIndex);

    // Check if `glass` key is already present in this options body
    // We look for `glass:` or `glass :` as a standalone key (not inside a string)
    if (!/\bglass\s*:/.test(optionsBody)) {
      results.push({
        start: openBraceIndex,
        end: closeBraceIndex,
        optionsBody,
      });
    }
  }
  return results;
}

/**
 * Insert `glass: isGlass` into an options object body.
 * We add it after the opening `{` (before the first existing property).
 */
function insertGlassIntoOptions(content, calls) {
  // Process from end to start so offsets stay valid
  const sorted = [...calls].sort((a, b) => b.start - a.start);
  let result = content;
  for (const call of sorted) {
    const afterBrace = call.start + 1; // right after `{`
    const restAfterBrace = result.substring(afterBrace, call.end);
    const trimmed = restAfterBrace.trimStart();

    if (trimmed.length === 0) {
      // Empty options `{}` — insert as sole property
      result =
        result.substring(0, afterBrace) +
        ' glass: isGlass ' +
        result.substring(call.end);
    } else {
      // There are existing properties — add `glass: isGlass,` before first one
      // Preserve the existing whitespace after `{`
      const leadingWS = restAfterBrace.substring(
        0,
        restAfterBrace.length - trimmed.length
      );
      result =
        result.substring(0, afterBrace) +
        leadingWS +
        'glass: isGlass,' +
        leadingWS +
        trimmed +
        result.substring(call.end);
    }
  }
  return result;
}

/**
 * Ensure `const isGlass = engine === 'modern' && !!tokens.glass;` exists.
 * Insert it after the context destructuring line.
 */
function ensureIsGlassDeclaration(content) {
  if (/const\s+isGlass\s*=/.test(content)) return content;

  // Find the context destructuring line.
  // Pattern 1 (function form): `const { primitives, props, tokens ... } = context;`
  // Pattern 2 (object/render form): `({ primitives, props, tokens, engine }: PresetContext<...>) =>`
  //   In this case, there's no single assignment line — we insert after the first
  //   `const { ... } = primitives;` or `const { ... } = props;` destructuring,
  //   or after the opening lines of the render function body.

  // Strategy: find the line that destructures `tokens` from context:
  //   `const { ... tokens ... } = context;`
  // OR if using the render form, find first usage of `tokens` in a const line.

  const lines = content.split('\n');
  let insertAfterLine = -1;

  // First try: `const { ... } = context;`
  for (let i = 0; i < lines.length; i++) {
    if (/const\s+\{[^}]*\}\s*=\s*context\s*;/.test(lines[i])) {
      insertAfterLine = i;
      break;
    }
  }

  // Second try: find lines destructuring from props (which comes after context destructuring)
  if (insertAfterLine === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (/const\s+\{[^}]*\}\s*=\s*props\s*;/.test(lines[i])) {
        // Insert before this line (after the primitives line)
        // Actually, look backwards from here for a primitives line
        for (let j = i - 1; j >= 0; j--) {
          if (/const\s+\{[^}]*\}\s*=\s*primitives\s*;/.test(lines[j])) {
            insertAfterLine = j;
            break;
          }
        }
        if (insertAfterLine === -1) insertAfterLine = i;
        break;
      }
    }
  }

  // Third try: for object-form presets with `render:` — find the first `const {` after the render arrow
  if (insertAfterLine === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (/const\s+\{[^}]*\bBox\b/.test(lines[i]) || /const\s+\{[^}]*\bprimitives\b/.test(lines[i])) {
        insertAfterLine = i;
        break;
      }
    }
  }

  if (insertAfterLine === -1) {
    // Fallback: insert before the first createCardStyle call
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('createCardStyle')) {
        insertAfterLine = i - 1;
        break;
      }
    }
  }

  if (insertAfterLine === -1) return content; // cannot determine insertion point

  // Detect indentation from the line after which we insert
  const refLine = lines[insertAfterLine];
  const indentMatch = refLine.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '    ';

  lines.splice(
    insertAfterLine + 1,
    0,
    `${indent}const isGlass = engine === 'modern' && !!tokens.glass;`
  );

  return lines.join('\n');
}

/**
 * Ensure `engine` is destructured from the preset context.
 *
 * Pattern 1 (function form):
 *   `const { primitives, props, tokens } = context;`
 *   → `const { primitives, props, tokens, engine } = context;`
 *
 * Pattern 2 (object render form):
 *   `({ primitives, props, tokens }: PresetContext<...>)`
 *   → `({ primitives, props, tokens, engine }: PresetContext<...>)`
 *
 * Also handles inline destructuring in render arrow:
 *   `render: ({ primitives, props, tokens }: PresetContext<...>) =>`
 */
function ensureEngineDestructured(content) {
  // If engine is already present in context destructuring, nothing to do
  if (/\bengine\b/.test(content)) {
    // More specific check: is it destructured from context or in the preset params?
    if (
      /const\s+\{[^}]*\bengine\b[^}]*\}\s*=\s*context/.test(content) ||
      /\(\s*\{[^}]*\bengine\b[^}]*\}\s*:\s*PresetContext/.test(content) ||
      /\(\s*\{[^}]*\bengine\b[^}]*\}\s*\)\s*=>/.test(content)
    ) {
      return content;
    }
  }

  // Pattern 1: `const { primitives, props, tokens } = context;`
  const contextDestructureRe =
    /(const\s+\{)([^}]*?)(\}\s*=\s*context\s*;)/;
  const contextMatch = content.match(contextDestructureRe);
  if (contextMatch) {
    const existing = contextMatch[2].trim();
    // Add engine before closing brace
    const updated = contextMatch[1] + ' ' + existing + ', engine ' + contextMatch[3];
    return content.replace(contextDestructureRe, updated);
  }

  // Pattern 2: `({ primitives, props, tokens }: PresetContext<...>)` or
  //            `({ primitives, props, tokens, engine }: PresetContext<...>)`
  const presetParamsRe =
    /(\(\s*\{)([^}]*?)(\}\s*:\s*PresetContext\s*<[^>]*>\s*\))/;
  const paramsMatch = content.match(presetParamsRe);
  if (paramsMatch) {
    const existing = paramsMatch[2].trim();
    const updated = paramsMatch[1] + ' ' + existing + ', engine ' + paramsMatch[3];
    return content.replace(presetParamsRe, updated);
  }

  // Pattern 3: function form without type annotation
  //   `(context) =>` where context is used later with `const { ... } = context;`
  // Already handled by Pattern 1 above.

  return content;
}

// ─── Main ────────────────────────────────────────────────────────────────────

let modifiedCount = 0;
let skippedCount = 0;

const files = walkPresets(PRESETS_ROOT);
console.log(`Found ${files.length} preset .tsx files\n`);

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);

  // Skip files that don't use createCardStyle at all
  if (!content.includes('createCardStyle')) {
    skippedCount++;
    continue;
  }

  // Find createCardStyle calls without `glass:`
  const callsWithoutGlass = findCallsWithoutGlass(content);

  if (callsWithoutGlass.length === 0) {
    // All existing calls already have glass
    skippedCount++;
    continue;
  }

  // --- Apply modifications ---

  // Step 1: Ensure `engine` is destructured from context
  content = ensureEngineDestructured(content);

  // Step 2: Ensure `const isGlass = ...` declaration exists
  content = ensureIsGlassDeclaration(content);

  // Step 3: Re-find calls (offsets may have shifted after steps 1-2)
  const updatedCalls = findCallsWithoutGlass(content);
  if (updatedCalls.length === 0) {
    // Shouldn't happen, but guard
    skippedCount++;
    continue;
  }

  // Step 4: Insert `glass: isGlass` into each call
  content = insertGlassIntoOptions(content, updatedCalls);

  writeFileSync(filePath, content, 'utf8');
  modifiedCount++;
  console.log(`  MODIFIED  ${rel}`);
}

console.log(`\nDone. Modified: ${modifiedCount}, Skipped: ${skippedCount}`);
