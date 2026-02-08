/**
 * Replace hardcoded rgba() overlay values with `tokens.overlay.*` tokens
 * in all .tsx files under packages/core/src/components/custom/.
 *
 * Mapping (handles both spaced and unspaced rgba):
 *   rgba(0,0,0,0.3)  → tokens.overlay.light
 *   rgba(0,0,0,0.4)  → tokens.overlay.light
 *   rgba(0,0,0,0.5)  → tokens.overlay.medium
 *   rgba(0,0,0,0.6)  → tokens.overlay.heavy
 *   rgba(0,0,0,0.7)  → tokens.overlay.heavy
 *   rgba(255,255,255,0.9)  → tokens.overlay.white
 *   rgba(255,255,255,0.85) → tokens.overlay.white
 *   rgba(255,255,255,0.8)  → tokens.overlay.white
 *   rgba(255,255,255,0.5)  → tokens.overlay.whiteMedium
 *   rgba(255,255,255,0.2)  → tokens.overlay.whiteLight
 *
 * Exclusions:
 *   - Lines containing 'linear-gradient' are skipped
 *   - rgba(0,0,0,0.1) and rgba(0,0,0,0.15) are skipped (shadow fallbacks)
 *   - Lines already containing 'tokens.overlay.' are skipped
 *
 * Context-aware replacement:
 *   - Standalone string value:  'rgba(...)' or "rgba(...)" → tokens.overlay.*
 *   - Inside template literal:  `...rgba(...)...` → `...${tokens.overlay.*}...`
 *   - JSX attribute:            attr="rgba(...)" → attr={tokens.overlay.*}
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'packages/core/src/components/custom');

// ---------------------------------------------------------------------------
// Overlay mapping
// ---------------------------------------------------------------------------

/** @type {Array<{ r: number, g: number, b: number, a: string, token: string }>} */
const OVERLAY_MAP = [
  // Black overlays
  { r: 0, g: 0, b: 0, a: '0.3', token: 'tokens.overlay.light' },
  { r: 0, g: 0, b: 0, a: '0.4', token: 'tokens.overlay.light' },
  { r: 0, g: 0, b: 0, a: '0.5', token: 'tokens.overlay.medium' },
  { r: 0, g: 0, b: 0, a: '0.6', token: 'tokens.overlay.heavy' },
  { r: 0, g: 0, b: 0, a: '0.7', token: 'tokens.overlay.heavy' },
  // White overlays
  { r: 255, g: 255, b: 255, a: '0.9', token: 'tokens.overlay.white' },
  { r: 255, g: 255, b: 255, a: '0.85', token: 'tokens.overlay.white' },
  { r: 255, g: 255, b: 255, a: '0.8', token: 'tokens.overlay.white' },
  { r: 255, g: 255, b: 255, a: '0.5', token: 'tokens.overlay.whiteMedium' },
  { r: 255, g: 255, b: 255, a: '0.2', token: 'tokens.overlay.whiteLight' },
];

/**
 * Build a regex that matches `rgba(r, g, b, a)` with optional spaces after
 * commas for a given mapping entry.
 */
function buildRgbaPattern(entry) {
  const { r, g, b, a } = entry;
  // Allow optional spaces after each comma
  return `rgba\\(${r},\\s*${g},\\s*${b},\\s*${a.replace('.', '\\.')}\\)`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Process a single file's content line-by-line.
 */
function processFile(content) {
  const lines = content.split('\n');
  let replacements = 0;

  const processed = lines.map((line) => {
    // Skip lines containing linear-gradient — rgba needed for gradient stops
    if (line.includes('linear-gradient')) return line;

    // Skip lines already using tokens.overlay
    if (line.includes('tokens.overlay.')) return line;

    let updated = line;

    for (const entry of OVERLAY_MAP) {
      const rgbaPatternStr = buildRgbaPattern(entry);
      const token = entry.token;

      // -----------------------------------------------------------------------
      // Pattern 1: JSX attribute — attr="rgba(...)"
      //
      // e.g.  fill="rgba(255,255,255,0.85)"
      // becomes  fill={tokens.overlay.white}
      // -----------------------------------------------------------------------
      const jsxAttrRegex = new RegExp(
        `(\\w+)="${rgbaPatternStr}"`,
        'g',
      );
      updated = updated.replace(jsxAttrRegex, (match, attrName) => {
        replacements++;
        return `${attrName}={${token}}`;
      });

      // -----------------------------------------------------------------------
      // Pattern 2: Standalone quoted string — 'rgba(...)' or "rgba(...)"
      //
      // e.g.  backgroundColor: 'rgba(0,0,0,0.5)'
      // becomes  backgroundColor: tokens.overlay.medium
      //
      // This regex matches a quote, the rgba call, and the same closing quote.
      // We replace the entire quoted string with just the token reference.
      // -----------------------------------------------------------------------
      const quotedRegex = new RegExp(
        `(['"])${rgbaPatternStr}\\1`,
        'g',
      );
      updated = updated.replace(quotedRegex, (match) => {
        replacements++;
        return token;
      });

      // -----------------------------------------------------------------------
      // Pattern 3: Inside template literal — `...rgba(...)...`
      //
      // A bare rgba() that hasn't been caught by the patterns above and sits
      // inside a template literal. We wrap it with ${...}.
      //
      // We detect this by checking if the rgba call is NOT already inside ${}
      // and the line contains a backtick context.
      // -----------------------------------------------------------------------
      const bareRgbaRegex = new RegExp(rgbaPatternStr, 'g');
      updated = updated.replace(bareRgbaRegex, (match, offset) => {
        // Check if this occurrence is already inside a ${...} wrapper
        // by looking backwards for ${ without a closing }
        const before = updated.substring(0, offset);
        const lastDollarBrace = before.lastIndexOf('${');
        const lastCloseBrace = before.lastIndexOf('}');
        if (lastDollarBrace > lastCloseBrace) {
          // Already inside a ${...} expression, skip
          return match;
        }

        // Check if we're in a template literal context (backtick on the line)
        if (line.includes('`')) {
          replacements++;
          return `\${${token}}`;
        }

        // Not in a recognized context — leave it alone
        return match;
      });
    }

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

console.log(`\n=== RGBA Overlay Replacements ===`);
console.log(`Files modified: ${modifiedCount}`);
console.log(`Total replacements: ${totalReplacements}`);
