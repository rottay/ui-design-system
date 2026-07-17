#!/usr/bin/env node
// WO-SKIN-01 — fleet census: every component file under src/ui with
// counted inline paint, measured by the SAME lexer the arc09.inlinePaint
// ratchet uses (imported, never duplicated). Classic engines are excluded by
// construction (AntD owns its paint); tests/stories/types are not shipped
// render code. Output: a JSON artifact (machine, feeds the counter baseline
// extension) and a markdown table (human, feeds the batch plans).
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = join(ROOT, 'src/ui');

const EXCLUDE_RE =
  /(\/tests?\/|\/contracts\/|\.test\.|\.stories\.|\.types\.ts$|\/classic\.tsx$|\/engines\/classic\.tsx$|\/classic\/)/;

/** Files the ARC-09 ratchet already owns (all at 0) — done, not fleet work. */
const DONE = new Set([
  'primitives/display/Table/engines/modern/index.tsx',
  'primitives/display/Table/engines/rustic/index.tsx',
  'structures/workspace/field-filters-panel/index.tsx',
  'patterns/forms/filter-panel/engines/modern/index.tsx',
  'patterns/forms/filter-panel/engines/rustic/index.tsx',
  'structures/workspace/selection-preview-rail/index.tsx',
  'patterns/data/detail-panel/engines/modern/index.tsx',
  'patterns/data/detail-panel/engines/rustic/index.tsx',
  'patterns/data/data-table/engines/modern/index.tsx',
  'patterns/data/data-table/engines/rustic/index.tsx',
  'patterns/data/data-table/engines/modern/cell-editor/index.tsx',
  'patterns/data/data-table/presentation/table/mobile-cards/index.tsx',
  'patterns/data/data-table/presentation/table/index.tsx',
]);

const missingDoneFiles = [...DONE].filter((relativePath) => !existsSync(join(COMPONENTS, relativePath)));
if (missingDoneFiles.length > 0) {
  throw new Error(
    `skin census cannot classify missing ARC-09 sources:\n${missingDoneFiles
      .map((relativePath) => `  - ${relativePath}`)
      .join('\n')}`,
  );
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(name)) yield full;
  }
}

/** tier / group / component from a UI-root-relative path like
 *  primitives/inputs/Select/engines/modern/index.tsx */
function identify(rel) {
  const parts = rel.split('/');
  const tier = parts[0];
  if (tier === 'primitives' || tier === 'patterns' || tier === 'structures' || tier === 'surfaces') {
    return {
      tier,
      group: parts[1] ?? '',
      component: parts[2] ?? parts[1] ?? rel,
    };
  }
  return { tier, group: '', component: parts[1] ?? rel };
}

/** Batch assignment per the skin-adoption lane. */
function batchOf(tier, group) {
  if (tier === 'primitives' && group === 'inputs') return 'WO-SKIN-02';
  if (tier === 'primitives' && group === 'feedback') return 'WO-SKIN-03';
  if (tier === 'primitives' && (group === 'overlay' || group === 'navigation')) return 'WO-SKIN-04';
  if (tier === 'primitives') return 'WO-SKIN-05'; // display + layout
  return 'WO-SKIN-06'; // patterns + structures + surfaces remainder
}

/** Heuristic trap markers — each true marker pushes the file toward the
 *  opus tier; a file with none is a sonnet-tier static leaf. The heuristics
 *  are coarse by design: they pick the MODEL, the per-batch contract still
 *  resolves each collision exactly. */
function trapMarkers(text) {
  return {
    imperativePaint: /\.style\.[A-Za-z]+\s*=(?!=)|\.style\.setProperty\(/.test(text),
    hoverHandlers: /onMouseEnter|onPointerEnter/.test(text),
    stateHover: /useState[^;]*[Hh]over|hovered/.test(text),
    textColorProp: /<(Text|Heading|TypographyText)[\s\S]{0,400}?color:\s*['"]/.test(text),
    stylePropIntoChild: /<[A-Z][A-Za-z]*[^>]*\sstyle=\{/.test(text),
    keyframesTag: /<style[\s>][\s\S]{0,80}?@keyframes|dangerouslySetInnerHTML[\s\S]{0,120}?@keyframes/.test(text),
    portal: /createPortal|Portal[\s>]/.test(text),
  };
}

const files = [];
for (const full of walk(COMPONENTS)) {
  const rel = relative(COMPONENTS, full);
  if (EXCLUDE_RE.test(rel)) continue;
  const text = readFileSync(full, 'utf8');
  const count = countArc09PaintInFile(text, full);
  if (count === 0) continue;
  const traps = trapMarkers(text);
  const trapCount = Object.values(traps).filter(Boolean).length;
  files.push({
    file: rel,
    count,
    done: DONE.has(rel),
    traps,
    modelTier: trapCount >= 1 ? 'opus' : 'sonnet',
    ...identify(rel),
  });
}

files.sort((a, b) => b.count - a.count);
const fleet = files.filter((f) => !f.done);

const byComponent = new Map();
for (const f of fleet) {
  const key = `${f.tier}/${f.group}/${f.component}`;
  const entry = byComponent.get(key) ?? {
    key,
    tier: f.tier,
    group: f.group,
    component: f.component,
    batch: batchOf(f.tier, f.group),
    modelTier: 'sonnet',
    total: 0,
    files: [],
  };
  entry.total += f.count;
  if (f.modelTier === 'opus') entry.modelTier = 'opus';
  entry.files.push({
    file: f.file,
    count: f.count,
    traps: Object.entries(f.traps)
      .filter(([, v]) => v)
      .map(([k]) => k),
  });
  byComponent.set(key, entry);
}
const components = [...byComponent.values()].sort((a, b) => b.total - a.total);

const byTierGroup = new Map();
for (const c of components) {
  const key = `${c.tier}/${c.group}`;
  const e = byTierGroup.get(key) ?? {
    key,
    batch: c.batch,
    components: 0,
    total: 0,
    opus: 0,
  };
  e.components += 1;
  e.total += c.total;
  if (c.modelTier === 'opus') e.opus += 1;
  byTierGroup.set(key, e);
}

const byBatch = new Map();
for (const c of components) {
  const e = byBatch.get(c.batch) ?? {
    batch: c.batch,
    components: 0,
    files: 0,
    total: 0,
    opus: 0,
  };
  e.components += 1;
  e.files += c.files.length;
  e.total += c.total;
  if (c.modelTier === 'opus') e.opus += 1;
  byBatch.set(c.batch, e);
}

const summary = {
  measuredAt: new Date().toISOString().slice(0, 10),
  fleetFiles: fleet.length,
  fleetSites: fleet.reduce((s, f) => s + f.count, 0),
  fleetComponents: components.length,
  batches: [...byBatch.values()].sort((a, b) => a.batch.localeCompare(b.batch)),
  groups: [...byTierGroup.values()].sort((a, b) => b.total - a.total),
  components,
};

const out = join(ROOT, '../..', 'roadmap/skin-census.json');
writeFileSync(out, JSON.stringify(summary, null, 1) + '\n');

console.log(
  `fleet: ${summary.fleetComponents} components, ${summary.fleetFiles} files, ${summary.fleetSites} paint sites`
);
console.log('\nby batch:');
for (const b of summary.batches)
  console.log(
    `  ${b.batch}  ${String(b.components).padStart(3)} comp  ${String(b.files).padStart(3)} files  ${String(
      b.total
    ).padStart(5)} sites  (${b.opus} opus-tier)`
  );
console.log('\nby tier/group:');
for (const g of summary.groups)
  console.log(
    `  ${g.key.padEnd(28)} ${g.batch}  ${String(g.components).padStart(3)} comp  ${String(g.total).padStart(
      5
    )} sites  (${g.opus} opus)`
  );
console.log('\ntop 25 components:');
for (const c of components.slice(0, 25))
  console.log(
    `  ${(c.tier + '/' + c.group + '/' + c.component).padEnd(50)} ${c.batch}  ${String(c.total).padStart(4)}  ${
      c.modelTier
    }`
  );
