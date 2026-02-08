/**
 * Phase 2G: Replace inline card-like styles with createCardStyle
 *
 * Targets the root/main container style block in each preset that has:
 *   - backgroundColor: tokens.colors.common.white (simple, not conditional)
 *   - boxShadow: tokens.shadows.XX (simple, not conditional)
 *   - borderRadius: tokens.borderRadius.XX (simple, not conditional)
 *
 * Replaces those 3 properties with:
 *   ...createCardStyle(tokens, { elevation: 'XX' })
 *
 * Excludes:
 *   - Files already importing createCardStyle
 *   - Conditional values (ternary expressions)
 *   - Elements with height: '100%' or position: 'fixed'
 *   - navigation-editor/
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
    } else if (entry.name === 'index.tsx' && fullPath.includes('/presets/')) {
      results.push(fullPath);
    }
  }
  return results;
}

let modifiedCount = 0;
let skippedCount = 0;

const files = walkPresets(PRESETS_ROOT);
console.log(`Found ${files.length} preset files\n`);

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);

  // Skip files that already import createCardStyle
  if (content.includes('createCardStyle')) {
    skippedCount++;
    continue;
  }

  const lines = content.split('\n');
  let modified = false;

  // Find style blocks with all 3 simple (non-conditional) card properties
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for simple backgroundColor: tokens.colors.common.white (no ternary)
    if (line !== "backgroundColor: tokens.colors.common.white," &&
        line !== "backgroundColor: tokens.colors.common.white") continue;

    const bgLine = i;

    // Scan ±12 lines for the other two properties
    const scanStart = Math.max(0, bgLine - 12);
    const scanEnd = Math.min(lines.length - 1, bgLine + 12);

    let shadowLine = -1;
    let shadowElevation = '';
    let radiusLine = -1;

    for (let j = scanStart; j <= scanEnd; j++) {
      const trimmed = lines[j].trim();

      // Simple boxShadow: tokens.shadows.XX (no ternary, no template literal)
      const shadowMatch = trimmed.match(/^boxShadow:\s*tokens\.shadows\.(sm|md|lg|xl),?$/);
      if (shadowMatch) {
        shadowLine = j;
        shadowElevation = shadowMatch[1];
      }

      // Simple borderRadius: tokens.borderRadius.XX (no ternary)
      const radiusMatch = trimmed.match(/^borderRadius:\s*tokens\.borderRadius\.(sm|md|lg|xl),?$/);
      if (radiusMatch) {
        radiusLine = j;
      }
    }

    if (shadowLine === -1 || radiusLine === -1) continue;

    // Check the block doesn't contain exclusion patterns
    const blockText = lines.slice(scanStart, scanEnd + 1).join('\n');
    if (blockText.includes("height: '100%'") || blockText.includes("position: 'fixed'")) continue;

    // Get indentation from the bg line
    const indent = lines[bgLine].match(/^(\s*)/)?.[1] || '';

    // Replace: put the spread at the first line, null the others
    const spreadLine = `${indent}...createCardStyle(tokens, { elevation: '${shadowElevation}' }),`;

    const sortedIdxs = [bgLine, shadowLine, radiusLine].sort((a, b) => a - b);
    lines[sortedIdxs[0]] = spreadLine;
    lines[sortedIdxs[1]] = null;
    lines[sortedIdxs[2]] = null;

    modified = true;
    break; // One replacement per file for safety
  }

  if (modified) {
    const newLines = lines.filter((l) => l !== null);
    let newContent = newLines.join('\n');

    // Add createCardStyle to imports
    const helpersImportMatch = newContent.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/\.\.\/\.\.\/helpers['"]/);
    if (helpersImportMatch) {
      const existingImports = helpersImportMatch[1];
      if (!existingImports.includes('createCardStyle')) {
        const newImports = `createCardStyle,${existingImports}`;
        newContent = newContent.replace(helpersImportMatch[0],
          `import { ${newImports} } from '../../../helpers'`);
      }
    } else {
      // Add new import line after the last import
      const lastImportIdx = newContent.lastIndexOf('\nimport ');
      if (lastImportIdx !== -1) {
        const lineEnd = newContent.indexOf('\n', lastImportIdx + 1);
        newContent = newContent.slice(0, lineEnd + 1) +
          "import { createCardStyle } from '../../../helpers';\n" +
          newContent.slice(lineEnd + 1);
      }
    }

    writeFileSync(filePath, newContent, 'utf8');
    console.log(`  ✓ ${rel} (elevation: '${lines.find(l => l && l.includes('createCardStyle'))?.match(/elevation:\s*'(\w+)'/)?.[1] || '?'}')`);
    modifiedCount++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Modified: ${modifiedCount} files`);
console.log(`Already using createCardStyle: ${skippedCount} files`);
