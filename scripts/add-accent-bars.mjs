/**
 * Phase 3E: Add accent bars to key dashboard/card presets
 *
 * Targets: dashboard-card, kpi-grid, stat-widget, profile-card presets
 * Adds createAccentBarStyle import and an accent bar <div> as the first child
 * inside the main card container.
 *
 * The accent bar is a thin gradient line at the top of the card.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const PRESETS_ROOT = join(
  process.cwd(),
  'packages/core/src/components/custom'
);

const TARGET_FILES = [
  'dashboard-card/presets/chart/index.tsx',
  'dashboard-card/presets/compact/index.tsx',
  'dashboard-card/presets/trending/index.tsx',
  'dashboard-card/presets/detailed/index.tsx',
  'kpi-grid/presets/compact/index.tsx',
  'kpi-grid/presets/detailed/index.tsx',
  'kpi-grid/presets/cards/index.tsx',
  'stat-widget/presets/compact/index.tsx',
  'stat-widget/presets/ring/index.tsx',
  'stat-widget/presets/standard/index.tsx',
  'profile-card/presets/minimal/index.tsx',
  'profile-card/presets/horizontal/index.tsx',
  'profile-card/presets/standard/index.tsx',
];

let modifiedCount = 0;

for (const relFile of TARGET_FILES) {
  const filePath = join(PRESETS_ROOT, relFile);
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch (e) {
    console.log(`  ✗ ${relFile} (not found)`);
    continue;
  }

  if (content.includes('createAccentBarStyle')) {
    console.log(`  → ${relFile} (already has accent bar)`);
    continue;
  }

  // 1. Add createAccentBarStyle to imports
  const helpersImport = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/\.\.\/\.\.\/helpers['"]/);
  if (helpersImport) {
    const existing = helpersImport[1];
    if (!existing.includes('createAccentBarStyle')) {
      const newImports = existing.trimEnd() + ',\n  createAccentBarStyle,';
      content = content.replace(helpersImport[0],
        `import {\n  createAccentBarStyle,${existing}\n} from '../../../helpers'`);
    }
  } else {
    // No helpers import yet — add one
    const lastImportIdx = content.lastIndexOf('\nimport ');
    if (lastImportIdx !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIdx + 1);
      content = content.slice(0, lineEnd + 1) +
        "import { createAccentBarStyle } from '../../../helpers';\n" +
        content.slice(lineEnd + 1);
    }
  }

  // 2. Find the main card container's first child position
  // Look for the pattern: style={{...cardStyle... or style={{ ...createCardStyle...
  // Then find the > that closes that element's opening tag and insert the accent bar after it

  // Strategy: find the first opening tag with cardStyle/createCardStyle and insert accent bar after >
  const cardContainerPattern = /style=\{\{[^}]*(?:cardStyle|createCardStyle|\.\.\.card)[^}]*\}\}[^>]*>/;
  const match = content.match(cardContainerPattern);

  if (match) {
    const insertPos = match.index + match[0].length;

    // Check what's after — skip if there's a loading conditional right away
    const afterContent = content.slice(insertPos, insertPos + 50);

    // Insert accent bar div
    const accentBar = `\n        <div style={createAccentBarStyle(tokens, { position: 'top' })} />`;
    content = content.slice(0, insertPos) + accentBar + content.slice(insertPos);

    writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${relFile}`);
    modifiedCount++;
  } else {
    // Fallback: look for the return statement's main wrapper
    // Find first <Box or <div after "return ("
    const returnMatch = content.match(/return\s*\(\s*\n?\s*(<(?:Box|div)\b[^>]*>)/);
    if (returnMatch) {
      const insertPos = content.indexOf(returnMatch[1]) + returnMatch[1].length;
      const accentBar = `\n        <div style={createAccentBarStyle(tokens, { position: 'top' })} />`;
      content = content.slice(0, insertPos) + accentBar + content.slice(insertPos);

      writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ ${relFile} (fallback)`);
      modifiedCount++;
    } else {
      console.log(`  ✗ ${relFile} (could not find insertion point)`);
    }
  }
}

console.log(`\n=== Summary ===`);
console.log(`Modified: ${modifiedCount} files`);
