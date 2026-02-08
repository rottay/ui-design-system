/**
 * P0.2: Replace property-specific transitions with tokens.transitions
 *
 * - background-color ${tokens.motion.hover} → background-color ${tokens.transitions?.fast || tokens.motion.hover}
 * - color ${tokens.motion.hover} → color ${tokens.transitions?.fast || tokens.motion.hover}
 * - border-color ${tokens.motion.hover} → border-color ${tokens.transitions?.fast || tokens.motion.hover}
 * - border ${tokens.motion.hover} → border ${tokens.transitions?.fast || tokens.motion.hover}
 * - opacity ${tokens.motion.hover} → opacity ${tokens.transitions?.fast || tokens.motion.hover}
 * - width ${tokens.motion.hover} → width ${tokens.transitions?.normal || tokens.motion.hover}
 * - height ${tokens.motion.hover} → height ${tokens.transitions?.normal || tokens.motion.hover}
 * - max-height ${tokens.motion.hover} → max-height ${tokens.transitions?.normal || tokens.motion.hover}
 *
 * Does NOT touch: `all ${tokens.motion.hover}` (correct for hover timing)
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

const FAST_PROPS = ['background-color', 'background', 'color', 'border-color', 'border', 'opacity', 'box-shadow', 'fill', 'stroke'];
const NORMAL_PROPS = ['width', 'height', 'max-height', 'max-width', 'min-height', 'min-width', 'transform', 'left', 'right', 'top', 'bottom'];

let modified = 0;
let replacements = 0;

for (const fp of walk(ROOT)) {
  let content = readFileSync(fp, 'utf8');
  if (!content.includes('tokens.motion.hover')) continue;

  const rel = relative(process.cwd(), fp);
  const original = content;

  // Replace property-specific fast transitions
  for (const prop of FAST_PROPS) {
    const pattern = new RegExp(`(${prop})\\s*\\$\\{tokens\\.motion\\.hover\\}`, 'g');
    content = content.replace(pattern, (match, p) => {
      replacements++;
      return `${p} \${tokens.transitions?.fast || tokens.motion.hover}`;
    });
  }

  // Replace property-specific normal transitions
  for (const prop of NORMAL_PROPS) {
    const pattern = new RegExp(`(${prop})\\s*\\$\\{tokens\\.motion\\.hover\\}`, 'g');
    content = content.replace(pattern, (match, p) => {
      replacements++;
      return `${p} \${tokens.transitions?.normal || tokens.motion.hover}`;
    });
  }

  // Also handle comma-separated transitions like:
  // `background-color ${tokens.motion.hover}, color ${tokens.motion.hover}`
  // These were already handled above since the regex is global

  if (content !== original) {
    writeFileSync(fp, content, 'utf8');
    console.log(`  ✓ ${rel}`);
    modified++;
  }
}

console.log(`\n=== Transition Tokens ===`);
console.log(`Files modified: ${modified}`);
console.log(`Total replacements: ${replacements}`);
