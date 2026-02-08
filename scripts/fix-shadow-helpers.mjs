/**
 * P2.7: Adopt getCardHoverShadow in files with manual hover shadow patterns
 * P2.8: Add accent bars to chart-card and comparison-card
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(process.cwd(), 'packages/core/src/components/custom');

// === P2.7: Shadow helper adoption ===
console.log('=== P2.7: Shadow Helper Adoption ===\n');

const shadowTargets = [
  'team-manager/presets/cards/index.tsx',
  'outreach-table/presets/pipeline/index.tsx',
  'file-upload-zone/presets/dropzone/index.tsx',
  'bh-interview-center/presets/timeline/index.tsx',
  'feature-grid/presets/bento/index.tsx',
];

let shadowModified = 0;

for (const relFile of shadowTargets) {
  const fp = join(ROOT, relFile);
  let content;
  try { content = readFileSync(fp, 'utf8'); } catch { continue; }

  if (content.includes('getCardHoverShadow')) {
    console.log(`  → ${relFile} (already done)`);
    continue;
  }

  const original = content;

  // Replace manual hover shadow patterns
  // Pattern: boxShadow: isHovered ? tokens.shadows.md : 'none'
  content = content.replace(
    /boxShadow:\s*(\w+(?:\s*===\s*\S+)?)\s*\?\s*tokens\.shadows\.(sm|md|lg|xl)\s*:\s*'none'/g,
    (match, condition, elevation) => {
      return `boxShadow: ${condition} ? getCardHoverShadow(tokens, '${elevation === 'md' ? 'sm' : elevation}') : 'none'`;
    }
  );

  // Pattern: boxShadow: hoveredIndex === 0 ? tokens.shadows.md : tokens.shadows.sm
  content = content.replace(
    /boxShadow:\s*(\w+(?:\s*===\s*\S+)?)\s*\?\s*tokens\.shadows\.(sm|md|lg|xl)\s*:\s*tokens\.shadows\.(sm|md|lg|xl)/g,
    (match, condition, hoverElev, baseElev) => {
      return `boxShadow: ${condition} ? getCardHoverShadow(tokens, '${baseElev}') : tokens.shadows.${baseElev}`;
    }
  );

  if (content !== original) {
    // Add import
    const helpersMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/\.\.\/\.\.\/helpers['"]/);
    if (helpersMatch && !helpersMatch[1].includes('getCardHoverShadow')) {
      content = content.replace(helpersMatch[0],
        helpersMatch[0].replace(helpersMatch[1], helpersMatch[1].trimEnd() + ',\n  getCardHoverShadow,'));
    }

    writeFileSync(fp, content, 'utf8');
    console.log(`  ✓ ${relFile}`);
    shadowModified++;
  }
}

console.log(`Shadow files modified: ${shadowModified}\n`);

// === P2.8: Accent bars for chart-card + comparison-card ===
console.log('=== P2.8: Accent Bars ===\n');

const accentTargets = [
  'chart-card/presets/line/index.tsx',
  'chart-card/presets/area/index.tsx',
  'chart-card/presets/bar/index.tsx',
  'chart-card/presets/donut/index.tsx',
  'comparison-card/presets/side-by-side/index.tsx',
  'comparison-card/presets/stacked/index.tsx',
];

let accentModified = 0;

for (const relFile of accentTargets) {
  const fp = join(ROOT, relFile);
  let content;
  try { content = readFileSync(fp, 'utf8'); } catch { continue; }

  if (content.includes('createAccentBarStyle')) {
    console.log(`  → ${relFile} (already done)`);
    continue;
  }

  // Add import
  const helpersMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/\.\.\/\.\.\/helpers['"]/);
  if (helpersMatch) {
    content = content.replace(helpersMatch[0],
      helpersMatch[0].replace(helpersMatch[1], '  createAccentBarStyle,\n' + helpersMatch[1]));
  } else {
    const lastImport = content.lastIndexOf('\nimport ');
    if (lastImport !== -1) {
      const lineEnd = content.indexOf('\n', lastImport + 1);
      content = content.slice(0, lineEnd + 1) +
        "import { createAccentBarStyle } from '../../../helpers';\n" +
        content.slice(lineEnd + 1);
    }
  }

  // Find main container closing > after style={{ ...cardStyle... }}
  // Look for cardStyle or createCardStyle in a style prop, then find the > after
  const cardStylePattern = /style=\{\{[^}]*(?:cardStyle|createCardStyle|\.\.\.card)[^}]*\}\}[^>]*>/;
  const csMatch = content.match(cardStylePattern);

  if (csMatch) {
    const insertPos = csMatch.index + csMatch[0].length;
    content = content.slice(0, insertPos) +
      '\n        <div style={createAccentBarStyle(tokens, { position: \'top\' })} />' +
      content.slice(insertPos);

    writeFileSync(fp, content, 'utf8');
    console.log(`  ✓ ${relFile}`);
    accentModified++;
  } else {
    // Fallback: find return ( <Box/div ...> and insert after
    const returnMatch = content.match(/return\s*\(\s*\n\s*<(?:Box|div)\b/);
    if (returnMatch) {
      // Find the closing > of this element
      let searchFrom = returnMatch.index;
      let angleDepth = 0;
      let insertIdx = -1;
      for (let i = searchFrom; i < content.length; i++) {
        if (content[i] === '<') angleDepth++;
        if (content[i] === '>') {
          angleDepth--;
          if (angleDepth === 0) { insertIdx = i + 1; break; }
        }
      }
      if (insertIdx !== -1) {
        content = content.slice(0, insertIdx) +
          '\n        <div style={createAccentBarStyle(tokens, { position: \'top\' })} />' +
          content.slice(insertIdx);
        writeFileSync(fp, content, 'utf8');
        console.log(`  ✓ ${relFile} (fallback)`);
        accentModified++;
      }
    }
  }
}

console.log(`Accent bar files modified: ${accentModified}`);
