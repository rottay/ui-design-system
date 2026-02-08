/**
 * P1.4: Replace hardcoded fontSize pixel values with token equivalents
 *
 * Safe mappings (exact rem equivalents at 16px base):
 *   '12px' → tokens.typography.fontSize.xs   (0.75rem)
 *   '14px' → tokens.typography.fontSize.sm   (0.875rem)
 *   '16px' → tokens.typography.fontSize.md   (1rem)
 *   '18px' → tokens.typography.fontSize.lg   (1.125rem)
 *   '20px' → tokens.typography.fontSize.xl   (1.25rem)
 *   '24px' → tokens.typography.fontSize['2xl'] (1.5rem)
 *   '30px' → tokens.typography.fontSize['3xl'] (1.875rem)
 *   '36px' → tokens.typography.fontSize['4xl'] (2.25rem)
 *
 * Sizes without exact token match are logged but NOT replaced.
 * SVG fontSize attributes are skipped.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'packages/core/src/components/custom');

function walk(dir) {
  const results = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) results.push(...walk(p));
    else if (e.name === 'index.tsx' && p.includes('/presets/')) results.push(p);
  }
  return results;
}

const FONT_MAP = {
  '12px': 'tokens.typography.fontSize.xs',
  '14px': 'tokens.typography.fontSize.sm',
  '16px': 'tokens.typography.fontSize.md',
  '18px': 'tokens.typography.fontSize.lg',
  '20px': 'tokens.typography.fontSize.xl',
  '24px': "tokens.typography.fontSize['2xl']",
  '30px': "tokens.typography.fontSize['3xl']",
  '36px': "tokens.typography.fontSize['4xl']",
};

let modified = 0;
let totalReplacements = 0;
const unmapped = {};

for (const fp of walk(ROOT)) {
  let content = readFileSync(fp, 'utf8');
  const rel = relative(process.cwd(), fp);
  const original = content;

  // Match fontSize: '??px' in style objects
  content = content.replace(/fontSize:\s*'(\d+)px'/g, (match, size) => {
    const key = `${size}px`;
    if (FONT_MAP[key]) {
      totalReplacements++;
      return `fontSize: ${FONT_MAP[key]}`;
    }
    // Track unmapped sizes
    unmapped[key] = (unmapped[key] || 0) + 1;
    return match;
  });

  if (content !== original) {
    writeFileSync(fp, content, 'utf8');
    console.log(`  ✓ ${rel}`);
    modified++;
  }
}

console.log(`\n=== fontSize Replacements ===`);
console.log(`Files modified: ${modified}`);
console.log(`Total replacements: ${totalReplacements}`);
if (Object.keys(unmapped).length > 0) {
  console.log(`\nUnmapped sizes (no token equivalent):`);
  Object.entries(unmapped).sort((a, b) => b[1] - a[1]).forEach(([size, count]) => {
    console.log(`  ${size}: ${count} occurrences`);
  });
}
