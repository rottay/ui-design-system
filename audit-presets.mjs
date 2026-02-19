/**
 * Audit script for bh-* preset production quality indicators.
 * Scans all 272 preset files and reports which patterns are missing.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const BASE = './packages/core/src/components/custom';

// Recursively find all bh-*/presets/*/index.tsx files
function findPresets(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry.startsWith('bh-')) {
        const presetsDir = join(full, 'presets');
        try {
          for (const preset of readdirSync(presetsDir)) {
            const presetFile = join(presetsDir, preset, 'index.tsx');
            try {
              statSync(presetFile);
              results.push(presetFile);
            } catch {}
          }
        } catch {}
      }
    }
  }
  return results.sort();
}

const CHECKS = [
  {
    id: 'entrance',
    name: 'Entrance animation',
    test: (src) => src.includes('createEntranceAnimation'),
  },
  {
    id: 'stagger',
    name: 'Stagger delays on .map()',
    test: (src) => {
      const hasMap = /\.map\s*\(/.test(src);
      if (!hasMap) return true; // no .map = N/A, pass
      return src.includes('createStaggerDelay') || src.includes('staggerDelay') || src.includes('animStyle');
    },
  },
  {
    id: 'accentBar',
    name: 'Personality accent bar',
    test: (src) => src.includes('createPersonalityAccentBar') || src.includes('accentBar'),
  },
  {
    id: 'cardHover',
    name: 'Card hover (onMouseEnter/Leave)',
    test: (src) => src.includes('onMouseEnter') && src.includes('onMouseLeave'),
  },
  {
    id: 'ptypo',
    name: 'Personality typography',
    test: (src) => src.includes('getPersonalityTypography'),
  },
  {
    id: 'badgeRadius',
    name: 'Badge personality radius',
    test: (src) => {
      const hasBadge = src.includes('createBadgeStyle') || src.includes('Badge');
      if (!hasBadge) return true; // no badges = N/A
      return src.includes('getPersonalityBadgeRadius') || src.includes('badgeRadius') || src.includes('badgeR');
    },
  },
  {
    id: 'divider',
    name: 'Dividers between sections',
    test: (src) => {
      // Only relevant for multi-section components
      const sectionCount = (src.match(/Section|section|{\/\*.*\*\/}/g) || []).length;
      if (sectionCount < 2) return true; // single section = N/A
      return src.includes('createDividerStyle') || src.includes('divider');
    },
  },
  {
    id: 'sectionHeader',
    name: 'Section headers',
    test: (src) => src.includes('createPersonalitySectionHeaderStyle') || src.includes('sectionLabel') || src.includes('sectionHeader') || src.includes('sectionHdr'),
  },
  {
    id: 'glass',
    name: 'Glass-aware surfaces',
    test: (src) => src.includes('useGlass') || src.includes('isGlass') || src.includes('createGlassContainerStyle') || src.includes('glass'),
  },
  {
    id: 'tokenSpacing',
    name: 'Token spacing (no hardcoded px)',
    test: (src) => {
      // Check for hardcoded padding/gap/margin numbers not using tokens
      const hardcoded = src.match(/(?:padding|gap|margin)\s*:\s*(?:[0-9]+(?!\s*[,}]))/g) || [];
      // Filter out 0 values which are fine
      const bad = hardcoded.filter(m => !m.match(/:\s*0$/));
      return bad.length === 0;
    },
  },
  {
    id: 'tokenTypo',
    name: 'Token typography (no hardcoded fontSize)',
    test: (src) => {
      const hardcoded = src.match(/fontSize\s*:\s*[0-9]+(?!\s*[,}])/g) || [];
      return hardcoded.length === 0;
    },
  },
  {
    id: 'emptyState',
    name: 'Empty states for arrays',
    test: (src) => {
      // If has .map(), should have empty state
      const hasArrayRender = /\.map\s*\(/.test(src);
      if (!hasArrayRender) return true;
      return src.includes('createEmptyStateStyle') || src.includes('length === 0') || src.includes('.length < 1') || src.includes('No ') || src.includes('Empty');
    },
  },
  {
    id: 'skeleton',
    name: 'Skeleton loading',
    test: (src) => src.includes('createPersonalitySkeletonStyle') || src.includes('skeleton') || src.includes('Skeleton') || src.includes('loading'),
  },
  {
    id: 'useMemo',
    name: 'useMemo on helpers',
    test: (src) => {
      // Check that personality helpers are wrapped
      const bareTypo = /const\s+\w+\s*=\s*getPersonalityTypography\(/.test(src) && !src.includes('useMemo(() => getPersonalityTypography');
      const bareBadge = /const\s+\w+\s*=\s*getPersonalityBadgeRadius\(/.test(src) && !src.includes('useMemo(() => getPersonalityBadgeRadius');
      return !bareTypo && !bareBadge;
    },
  },
  {
    id: 'deadImports',
    name: 'No dead imports',
    test: (src) => {
      // Check for useState/useEffect imported but not used
      const importsEffect = /\buseEffect\b/.test(src.split('\n').find(l => l.includes('import') && l.includes('react')) || '');
      const usesEffect = /\buseEffect\s*\(/.test(src);
      if (importsEffect && !usesEffect) return false;

      const importsState = /\buseState\b/.test(src.split('\n').find(l => l.includes('import') && l.includes('react')) || '');
      const usesState = /\buseState\s*[<(]/.test(src);
      if (importsState && !usesState) return false;

      return true;
    },
  },
  {
    id: 'formatters',
    name: 'Uses formatters for data',
    test: (src) => {
      // If displays numbers/currency/percent, should use formatters
      const hasNumberDisplay = /toFixed|toLocaleString|\$\{.*\.toLocaleString/.test(src);
      if (!hasNumberDisplay) return true;
      return src.includes('formatAbbreviated') || src.includes('formatCurrency') || src.includes('formatPercent') || src.includes('formatScore') || src.includes('formatDuration') || src.includes('numericValue') || src.includes('formatDate');
    },
  },
];

const files = findPresets(BASE);
console.log(`\nAuditing ${files.length} bh-* preset files...\n`);

// Per-file results
const fileResults = [];
const missingByCheck = {};
CHECKS.forEach(c => { missingByCheck[c.id] = []; });

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(BASE, file);
  const missing = [];

  for (const check of CHECKS) {
    const pass = check.test(src);
    if (!pass) {
      missing.push(check.id);
      missingByCheck[check.id].push(rel);
    }
  }

  const score = CHECKS.length - missing.length;
  fileResults.push({ file: rel, score, total: CHECKS.length, missing });
}

// Summary by indicator
console.log('=== INDICATOR COVERAGE ===\n');
console.log('Indicator                         | Pass | Fail | Coverage');
console.log('----------------------------------+------+------+---------');
for (const check of CHECKS) {
  const fail = missingByCheck[check.id].length;
  const pass = files.length - fail;
  const pct = ((pass / files.length) * 100).toFixed(0);
  const name = check.name.padEnd(34);
  console.log(`${name}| ${String(pass).padStart(4)} | ${String(fail).padStart(4)} | ${pct}%`);
}

// Score distribution
const scoreDist = {};
fileResults.forEach(r => {
  scoreDist[r.score] = (scoreDist[r.score] || 0) + 1;
});
console.log('\n=== SCORE DISTRIBUTION ===\n');
for (let s = CHECKS.length; s >= 0; s--) {
  if (scoreDist[s]) {
    const bar = '#'.repeat(Math.min(scoreDist[s], 60));
    console.log(`${String(s).padStart(2)}/${CHECKS.length} | ${String(scoreDist[s]).padStart(3)} files | ${bar}`);
  }
}

// Average score
const avgScore = fileResults.reduce((sum, r) => sum + r.score, 0) / fileResults.length;
const minScore = Math.min(...fileResults.map(r => r.score));
const maxScore = Math.max(...fileResults.map(r => r.score));
console.log(`\nAverage: ${avgScore.toFixed(1)}/${CHECKS.length}  Min: ${minScore}  Max: ${maxScore}`);

// Worst files
console.log('\n=== WORST FILES (score < 10) ===\n');
fileResults
  .filter(r => r.score < 10)
  .sort((a, b) => a.score - b.score)
  .slice(0, 30)
  .forEach(r => {
    console.log(`${String(r.score).padStart(2)}/${r.total} ${r.file}`);
    console.log(`      Missing: ${r.missing.join(', ')}`);
  });

// Top gaps - which indicators have most failures
console.log('\n=== TOP GAPS (most failures) ===\n');
CHECKS
  .map(c => ({ id: c.id, name: c.name, count: missingByCheck[c.id].length }))
  .sort((a, b) => b.count - a.count)
  .filter(g => g.count > 0)
  .forEach(g => {
    console.log(`${String(g.count).padStart(4)} files missing: ${g.name} (${g.id})`);
  });

// Export gap lists for targeted agents
console.log('\n=== FILES MISSING GLASS ===');
missingByCheck['glass'].slice(0, 10).forEach(f => console.log(`  ${f}`));
if (missingByCheck['glass'].length > 10) console.log(`  ... and ${missingByCheck['glass'].length - 10} more`);

console.log('\n=== FILES MISSING CARD HOVER ===');
missingByCheck['cardHover'].slice(0, 10).forEach(f => console.log(`  ${f}`));
if (missingByCheck['cardHover'].length > 10) console.log(`  ... and ${missingByCheck['cardHover'].length - 10} more`);

console.log('\n=== FILES MISSING STAGGER ===');
missingByCheck['stagger'].slice(0, 10).forEach(f => console.log(`  ${f}`));
if (missingByCheck['stagger'].length > 10) console.log(`  ... and ${missingByCheck['stagger'].length - 10} more`);

console.log('\n=== FILES MISSING DIVIDERS ===');
missingByCheck['divider'].slice(0, 10).forEach(f => console.log(`  ${f}`));
if (missingByCheck['divider'].length > 10) console.log(`  ... and ${missingByCheck['divider'].length - 10} more`);

// Write full JSON report
import { writeFileSync } from 'fs';
const report = {
  total: files.length,
  avgScore: avgScore.toFixed(1),
  minScore,
  maxScore,
  indicators: CHECKS.map(c => ({
    id: c.id,
    name: c.name,
    pass: files.length - missingByCheck[c.id].length,
    fail: missingByCheck[c.id].length,
    failFiles: missingByCheck[c.id],
  })),
  files: fileResults,
};
writeFileSync('./audit-report.json', JSON.stringify(report, null, 2));
console.log('\nFull report written to audit-report.json');
