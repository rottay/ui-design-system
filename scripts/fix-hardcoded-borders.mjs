/**
 * Replace hardcoded border width/style values with design tokens.
 *
 * Patterns handled:
 *
 * 1. Template literals with expressions:
 *    `1px solid ${expr}` → `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${expr}`
 *    `2px solid ${expr}` → `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${expr}`
 *
 * 2. Stand-alone string literals (single or double quotes):
 *    '1px solid transparent' → `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`
 *    '2px solid var(--ds-color-primary)' → `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-primary)`
 *
 * 3. String concatenation ('1px solid ' + expr):
 *    '1px solid ' + expr → `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${expr}`
 *
 * Exclusions:
 *   - Files under navigation-editor/ are skipped entirely
 *   - Lines already containing `tokens.surface.borderWidth` are left untouched
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'packages/core/src/components/custom');
const TOKEN_PREFIX = '${tokens.surface.borderWidth} ${tokens.surface.borderStyle}';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    // Skip navigation-editor directory entirely
    if (entry.isDirectory() && entry.name === 'navigation-editor') continue;

    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Process a single file's content line-by-line so we can skip lines that
 * already use the token and count replacements accurately.
 */
function processFile(content) {
  const lines = content.split('\n');
  let replacements = 0;

  const processed = lines.map((line) => {
    // Skip lines that already use the token
    if (line.includes('tokens.surface.borderWidth')) return line;

    let updated = line;

    // -----------------------------------------------------------------------
    // Pattern 1: Template literal – `Npx solid ${...}`
    //
    // Matches the portion  Npx solid  that sits just before a ${  inside a
    // template literal.  We replace only the "Npx solid " part.
    // Also handles backtick strings that START with the border value, e.g.
    //   `2px solid ${expr}`
    // -----------------------------------------------------------------------
    updated = updated.replace(
      /([12])px solid (\$\{)/g,
      (match, _size, exprStart) => {
        replacements++;
        return `\${tokens.surface.borderWidth} \${tokens.surface.borderStyle} ${exprStart}`;
      },
    );

    // -----------------------------------------------------------------------
    // Pattern 2: Quoted stand-alone string – '1px solid <rest>'
    //
    // Handles things like:
    //   '2px solid transparent'
    //   '2px solid var(--ds-color-primary)'
    //   "1px solid #ccc"
    //
    // Converts to a template literal with tokens.
    // -----------------------------------------------------------------------
    updated = updated.replace(
      /(['"])([12])px solid ([^'"\n]+?)\1/g,
      (match, quote, _size, rest) => {
        // If the rest already contains a template expression somehow, skip
        if (rest.includes('tokens.surface.borderWidth')) return match;
        replacements++;
        return `\`\${tokens.surface.borderWidth} \${tokens.surface.borderStyle} ${rest}\``;
      },
    );

    // -----------------------------------------------------------------------
    // Pattern 3: String concatenation – '1px solid ' + expr
    //
    // Converts to template literal:
    //   `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${expr}`
    //
    // The "expr" portion runs until end-of-statement context (comma, closing
    // brace, closing paren, etc.).
    // -----------------------------------------------------------------------
    updated = updated.replace(
      /(['"])([12])px solid \1\s*\+\s*(.+?)(?=[,;}\n]|$)/g,
      (match, _quote, _size, expr) => {
        if (expr.includes('tokens.surface.borderWidth')) return match;
        replacements++;
        return `\`\${tokens.surface.borderWidth} \${tokens.surface.borderStyle} \${${expr.trim()}}\``;
      },
    );

    return updated;
  });

  return { content: processed.join('\n'), replacements };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = walk(ROOT);
let modifiedCount = 0;
let totalReplacements = 0;

for (const filePath of files) {
  const original = readFileSync(filePath, 'utf8');
  const { content, replacements } = processFile(original);

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    const rel = relative(process.cwd(), filePath);
    console.log(`  modified: ${rel}  (${replacements} replacement${replacements === 1 ? '' : 's'})`);
    modifiedCount++;
    totalReplacements += replacements;
  }
}

console.log(`\n=== Hardcoded Border Replacements ===`);
console.log(`Files modified: ${modifiedCount}`);
console.log(`Total replacements: ${totalReplacements}`);
