/** Style reuse and differentiation, read with the axis-difference instrument through its own `scenarios` and
 *  `compile` injection points; the browser half says why when it cannot run. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { before, describe, it } from 'node:test';

import { COMPILER_MODULE, SCENARIOS, run } from '../../../axis-difference/index.mjs';
import { AXIS_IDS } from '../../../population/index.mjs';
import { resolvePlaywright } from '../../../../tokens/cascade/probe/runtime/browser/index.mjs';
import { CATALOG_SOURCE, readThemeCatalog } from '../../../../../libraries/theme-catalog/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
const HAS_DIST = existsSync(join(ROOT, COMPILER_MODULE));
const distReason = HAS_DIST ? false : `${COMPILER_MODULE} is absent; run pnpm build`;
const browserReason = (() => {
  if (!HAS_DIST) return distReason;
  try {
    resolvePlaywright();
    return false;
  } catch (error) {
    return `no Chromium reachable: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`;
  }
})();

const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
const BITHIRE = readJson('src/foundation/presets/verticals/bithire/document/index.json').decisions;
const BRAND_ROWS = ['palette.seeds', 'palette.status-seeds', 'palette.neutral-temperature', 'palette.contrast-posture', 'palette.dark-mode', 'typography.families'];
/** BitHire's own brand, held fixed on both arms of every differentiation pair. */
const BRAND = Object.fromEntries(BRAND_ROWS.map((id) => [id, BITHIRE[id]]));
const PALETTE_ONLY = SCENARIOS.find((scenario) => scenario.id === 'palette-only');
/** Two brands for the reuse pair: BitHire's own seeds, and the instrument's own second palette. */
const BRANDS = { a: { 'palette.seeds': BITHIRE['palette.seeds'] }, b: PALETTE_ONLY.b };

const ref = (id) => ({ id, version: 1 });
const DIFFER = { a: ref('product-dense'), b: ref('editorial-quiet') };
const SHARED = ref('structural-neutral');

const CATALOG = new Map(readThemeCatalog(CATALOG_SOURCE).map((row) => [row.id, row]));
const bare = (channel) => channel.replace(/^[a-z]+:/u, '');
const declares = (row, channel) => (CATALOG.get(row).produces?.channels ?? []).some((declared) =>
  declared.endsWith('*') ? bare(channel).startsWith(declared.slice(0, -1)) : bare(channel) === declared);

let door;
before(async () => {
  if (HAS_DIST) door = await import(pathToFileURL(join(ROOT, COMPILER_MODULE)).href);
});

const v3 = (decisions, style) => ({ version: 3, plan: 'pro', decisions, style });
function compiled(vertical, decisions, style) {
  const { artifact } = door.compileTenantThemeDocumentV2({
    document: v3(decisions, style), tenantId: `style-proof-${vertical}`, slug: `style-proof-${vertical}`, verticalKey: vertical, rowVersion: 1,
  });
  const flat = { ...artifact.variables };
  for (const delta of artifact.modeDeltas ?? []) {
    for (const [name, value] of Object.entries(delta.variables ?? {})) flat[`${delta.mode}:${name}`] = value;
  }
  return flat;
}
const differing = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((name) => a[name] !== b[name]).sort();
const leaves = (value, path = []) => (value && typeof value === 'object' && !Array.isArray(value)
  ? Object.entries(value).flatMap(([key, child]) => leaves(child, [...path, key]))
  : [[path.join('.'), JSON.stringify(value)]]);

/** The leaves the style reference owns in one admission, by the ledger's own attribution. */
function styleLeaves(vertical, decisions, style) {
  const admission = door.admitDocument({ vertical, document: v3(decisions, style) });
  const entry = admission.ledger.entries.find((candidate) => candidate.ref.kind === 'style-reference');
  const patch = new Map(leaves(admission.patch));
  return {
    owned: new Map(entry.effectiveLeaves.map((leaf) => [leaf, [...patch].filter(([key]) => key === leaf || key.startsWith(`${leaf}.`))])),
    patch,
  };
}

describe('style reuse: one style, each vertical its own brand', { skip: distReason }, () => {
  it('the style-owned leaves are identical across two brands, in BitHire and in Evnto; only palette leaves move', () => {
    for (const vertical of ['bithire', 'evnto']) {
      const a = styleLeaves(vertical, BRANDS.a, SHARED);
      const b = styleLeaves(vertical, BRANDS.b, SHARED);
      assert.ok(a.owned.size > 0, `${vertical}: the style reference owns leaves`);
      assert.deepEqual([...a.owned], [...b.owned], `${vertical}: a brand moved a style-owned leaf`);
      const moved = [...new Set([...a.patch.keys(), ...b.patch.keys()])].filter((key) => a.patch.get(key) !== b.patch.get(key));
      assert.ok(moved.length > 0, `${vertical}: the two brands must paint differently`);
      assert.deepEqual(moved.filter((key) => !key.startsWith('palette.')), [], `${vertical}: ${moved.join(', ')}`);
    }
  });

  it('BitHire with its own brand and Evnto with another resolve the SAME style-owned leaves', () => {
    const bithire = styleLeaves('bithire', BRAND, SHARED).owned;
    const evnto = styleLeaves('evnto', BRANDS.b, SHARED).owned;
    assert.deepEqual([...bithire], [...evnto]);
  });
});

describe('style differentiation: two styles in one vertical, brand held fixed', { skip: distReason }, () => {
  it('no colour and no font-family channel moves; the moved declared rows are exactly the style rows that can reach paint', () => {
    const a = compiled('bithire', BRAND, DIFFER.a);
    const b = compiled('bithire', BRAND, DIFFER.b);
    const moved = differing(a, b);
    assert.ok(moved.length > 0);
    assert.deepEqual(moved.filter((name) => /--ds-color-|font-family/u.test(name)), []);
    const styleA = readJson('src/contracts/theme/runtime/styles/composition/registry/product-dense/document/index.json').decisions;
    const styleB = readJson('src/contracts/theme/runtime/styles/composition/registry/editorial-quiet/document/index.json').decisions;
    const contrasting = Object.keys(styleA).filter((row) => JSON.stringify(styleA[row]) !== JSON.stringify(styleB[row]));
    const reached = contrasting.filter((row) => moved.some((name) => declares(row, name)));
    assert.deepEqual(reached, [
      'typography.scale', 'typography.role-weights', 'typography.numeric', 'shape.radius-scale', 'shape.nesting',
      'shape.button-style', 'shape.control-height', 'density.mode', 'spacing.rhythm', 'surfaces.elevation-posture',
      'surfaces.border-style', 'surfaces.effect-intensity', 'states.emphasis', 'states.focus-style', 'motion.dial',
      'motion.character', 'navigation.sidebar-tone', 'profiles.expressive',
    ]);
    // recipe-profile, chrome.anatomy and responsive.posture (data only since G103-02) declare no channel;
    // the pairing is masked by the brand's own fonts.
    assert.deepEqual(contrasting.filter((row) => !reached.includes(row)), [
      'typography.pairing', 'recipe-profile', 'chrome.anatomy', 'responsive.posture',
    ]);
  });

  it('the pairing is masked by the held brand fonts, not dead: without typography.families it moves its fonts', () => {
    const brandless = Object.fromEntries(Object.entries(BRAND).filter(([row]) => row !== 'typography.families'));
    const moved = differing(compiled('bithire', brandless, DIFFER.a), compiled('bithire', brandless, DIFFER.b));
    assert.deepEqual(moved.filter((name) => declares('typography.pairing', name)), ['--ds-font-family-base', '--ds-font-family-heading']);
  });
});

describe('style reuse and differentiation through the axis-difference instrument', { skip: browserReason }, () => {
  const scenarios = [
    ...AXIS_IDS.map((axis) => ({ id: `differ-${axis}`, kind: 'positive', axis, a: BRAND, b: BRAND })),
    { ...PALETTE_ONLY, id: 'reuse-brand', a: BRANDS.a, b: BRANDS.b },
  ];
  // The same published compiler: the instrument's v2 arm gains only the style reference its scenario names.
  const compile = (input) => {
    const [, kind, arm] = /^(differ|reuse)-.*-(a|b)$/u.exec(input.slug);
    const style = kind === 'differ' ? DIFFER[arm] : SHARED;
    return door.compileTenantThemeDocumentV2({ ...input, document: { ...input.document, version: 3, style } });
  };
  let cells;
  before(async () => {
    ({ cells } = await run({ verticals: ['bithire', 'evnto'], themes: ['light', 'dark'], scenarios, compile }));
    for (const cell of cells) {
      console.info(`[style axis] ${cell.vertical}/${cell.theme} ${cell.scenario} ${cell.axis}: ${cell.moved}/${cell.denominator}`
        + ` (${cell.percent.toFixed(1)} %), evidential ${cell.evidential}`);
    }
  });

  it('every cell was read off the page', () => {
    assert.ok(cells.length > 0);
    for (const cell of cells) assert.equal(cell.resolvedSource, 'browser');
  });

  it('two styles in BitHire, brand held: every declared non-colour axis moves, in both modes', () => {
    for (const theme of ['light', 'dark']) {
      for (const axis of AXIS_IDS) {
        const cell = cells.find((candidate) => candidate.vertical === 'bithire' && candidate.theme === theme && candidate.scenario === `differ-${axis}`);
        assert.equal(cell.evidential, true, `bithire/${theme} ${axis}`);
        assert.ok(cell.moved > 0, `bithire/${theme} ${axis} moved nothing`);
      }
    }
  });

  it('one style under two brands, in BitHire and Evnto: the brand repaints and every style-owned axis holds at 0 %', () => {
    for (const vertical of ['bithire', 'evnto']) {
      for (const theme of ['light', 'dark']) {
        for (const axis of AXIS_IDS) {
          const cell = cells.find((candidate) => candidate.vertical === vertical && candidate.theme === theme
            && candidate.scenario === 'reuse-brand' && candidate.axis === axis);
          assert.ok(cell.witness.differing > 0, `${vertical}/${theme}: the brands did not reach the page as different maps`);
          assert.equal(cell.moved, 0, `${vertical}/${theme} ${axis}: ${cell.moved}/${cell.denominator}`);
        }
      }
    }
  });
});
