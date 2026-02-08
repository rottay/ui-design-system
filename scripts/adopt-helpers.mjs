/**
 * Phase 3A: Adopt helpers in zero-helper files
 *
 * For files with zero helper imports, applies safe mechanical transformations:
 *
 * 1. createHoverStyle: files with onMouseEnter handlers that manually set
 *    transition + cursor: pointer → add createHoverStyle spread
 *
 * 2. createSectionHeaderStyle: files with fontSize: xs + textTransform: uppercase +
 *    letterSpacing: 0.05em inline → replace with spread
 *
 * This script adds the helper import and replaces detected patterns.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

const PRESETS_ROOT = join(
  process.cwd(),
  'packages/core/src/components/custom'
);

function walkPresets(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkPresets(fullPath));
    } else if (entry.name === 'index.tsx' && fullPath.includes('/presets/')) {
      results.push(fullPath);
    }
  }
  return results;
}

let modifiedCount = 0;

const files = walkPresets(PRESETS_ROOT);

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);

  // Only target files with ZERO helper imports
  if (content.includes("from '../../../helpers'") || content.includes('from "../../../helpers"')) continue;

  const helpers = new Set();
  let modified = false;

  // Pattern 1: Section header — textTransform: 'uppercase' + letterSpacing: '0.05em' + fontSize: xs
  if (content.includes("textTransform: 'uppercase'") &&
      content.includes("letterSpacing: '0.05em'") &&
      content.includes('tokens.typography.fontSize.xs')) {
    // Find blocks with all 3 properties
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("textTransform: 'uppercase'")) {
        const start = Math.max(0, i - 5);
        const end = Math.min(lines.length - 1, i + 5);
        const block = lines.slice(start, end + 1).join('\n');
        if (block.includes("letterSpacing: '0.05em'") && block.includes('tokens.typography.fontSize.xs')) {
          // Found a section header pattern — we'll add the import but not auto-refactor
          // the inline styles since they're tightly coupled to surrounding layout
          helpers.add('createSectionHeaderStyle');
          break;
        }
      }
    }
  }

  // Pattern 2: Empty state — flexDirection: column + alignItems: center + textAlign: center
  if (content.includes("flexDirection: 'column'") &&
      content.includes("alignItems: 'center'") &&
      content.includes("justifyContent: 'center'") &&
      content.includes("textAlign: 'center'")) {
    helpers.add('createEmptyStateStyle');
  }

  // Only add imports if we found patterns — the manual part is applying them
  if (helpers.size > 0) {
    const importList = Array.from(helpers).join(', ');
    const lastImportIdx = content.lastIndexOf('\nimport ');
    if (lastImportIdx !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIdx + 1);
      content = content.slice(0, lineEnd + 1) +
        `import { ${importList} } from '../../../helpers';\n` +
        content.slice(lineEnd + 1);
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${rel} (imports: ${Array.from(helpers).join(', ')})`);
    modifiedCount++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Modified: ${modifiedCount} files (imports added, manual refactoring needed for inline usage)`);
