/**
 * Phase 3A: Audit helper adoption gaps
 *
 * Report-only scan detecting common patterns in files with no helper imports:
 * - Card patterns (white bg + shadow + radius)
 * - Badge patterns (inline-flex + borderRadius: full + fontSize: xs)
 * - List item patterns (padding + borderBottom + cursor: pointer)
 * - Section header patterns (fontSize: xs + textTransform: uppercase)
 * - Empty state patterns (flex + center + padding + neutral color)
 */

import { readFileSync, readdirSync } from 'fs';
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

const files = walkPresets(PRESETS_ROOT);

const noHelperFiles = files.filter(f => {
  const c = readFileSync(f, 'utf8');
  return !c.includes("from '../../../helpers'") && !c.includes('from "../../../helpers"');
});

console.log(`Files with ZERO helper imports: ${noHelperFiles.length}\n`);

const suggestions = [];

for (const filePath of noHelperFiles) {
  const content = readFileSync(filePath, 'utf8');
  const rel = relative(process.cwd(), filePath);
  const fileSuggestions = [];

  // Card pattern
  if (content.includes('tokens.colors.common.white') &&
      content.includes('tokens.shadows') &&
      content.includes('tokens.borderRadius')) {
    fileSuggestions.push('createCardStyle / createSurfaceStyle');
  }

  // Badge pattern
  if (content.includes("display: 'inline-flex'") &&
      content.includes('tokens.borderRadius.full') &&
      content.includes('tokens.typography.fontSize.xs')) {
    fileSuggestions.push('createBadgeStyle');
  }

  // List item pattern
  if (content.includes('borderBottom:') &&
      content.includes("cursor: 'pointer'") &&
      content.includes('tokens.spacing[2]')) {
    fileSuggestions.push('createListItemStyle');
  }

  // Section header pattern
  if (content.includes("textTransform: 'uppercase'") &&
      content.includes('tokens.typography.fontSize.xs') &&
      content.includes("letterSpacing: '0.05em'")) {
    fileSuggestions.push('createSectionHeaderStyle');
  }

  // Empty state pattern
  if (content.includes("flexDirection: 'column'") &&
      content.includes("alignItems: 'center'") &&
      content.includes("justifyContent: 'center'") &&
      content.includes("textAlign: 'center'")) {
    fileSuggestions.push('createEmptyStateStyle');
  }

  // Hover pattern
  if ((content.includes('onMouseEnter') || content.includes('isHovered')) &&
      !content.includes('createHoverStyle')) {
    fileSuggestions.push('createHoverStyle');
  }

  // Progress bar pattern
  if (content.includes("height: '100%'") &&
      content.includes('width: `${') &&
      content.includes('tokens.borderRadius.full') &&
      content.includes('%')) {
    fileSuggestions.push('createProgressBarStyle');
  }

  // Panel header pattern
  if (content.includes('borderBottom:') &&
      content.includes('tokens.colors.neutral[200]') &&
      (content.includes('tokens.colors.neutral[50]') || content.includes('tokens.gradients'))) {
    fileSuggestions.push('createPanelHeaderStyle');
  }

  if (fileSuggestions.length > 0) {
    suggestions.push({ file: rel, helpers: fileSuggestions });
    console.log(`  ${rel}`);
    fileSuggestions.forEach(h => console.log(`    → ${h}`));
  }
}

console.log(`\n=== Summary ===`);
console.log(`Files with zero helpers: ${noHelperFiles.length}`);
console.log(`Files with suggestions: ${suggestions.length}`);
console.log(`\nTop suggested helpers:`);
const helperCounts = {};
suggestions.forEach(s => s.helpers.forEach(h => { helperCounts[h] = (helperCounts[h] || 0) + 1; }));
Object.entries(helperCounts).sort((a, b) => b[1] - a[1]).forEach(([h, c]) => console.log(`  ${h}: ${c} files`));

// Output JSON for scripted consumption
import { writeFileSync } from 'fs';
writeFileSync('scripts/helper-gaps-report.json', JSON.stringify(suggestions, null, 2));
console.log('\nFull report written to scripts/helper-gaps-report.json');
