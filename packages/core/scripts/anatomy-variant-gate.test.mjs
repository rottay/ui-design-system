/**
 * Self-test for anatomy-variant-gate.mjs (W4-A).
 *
 * Unit-drills the pure helpers against in-memory fixtures with a LOCAL literal
 * copy of the anatomy vocabulary (stable regardless of the CONTRACT's landing
 * state), then integration-checks the real tree through both the exported
 * `runAnatomyGate` and the `--check` CLI (exit codes + fixture overrides).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  FAMILY_ATTRIBUTE,
  attributeToFamily,
  parseAnatomyVocabulary,
  findAnatomySelectors,
  checkFamilyMapping,
  checkForwardCoverage,
  checkReverseDeadSelectors,
  checkClassicManifest,
  runAnatomyGate,
} from './anatomy-variant-gate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'anatomy-variant-gate.mjs');

// Local literal copy of the vocabulary (design 1.2), used for unit assertions.
const VOCAB = {
  cardComponent: ['default', 'framed', 'underline', 'ghost'],
  table: ['default', 'ruled', 'zebra', 'open'],
  sidebar: ['default', 'rail', 'panel'],
  layout: ['default', 'flat', 'floating'],
};

/** Build the full set of expected (attr, variant) selector objects. */
function fullSelectorSet() {
  const out = [];
  for (const [family, variants] of Object.entries(VOCAB)) {
    const attr = FAMILY_ATTRIBUTE[family];
    for (const variant of variants) {
      if (variant === 'default') continue;
      out.push({ attr, variant });
    }
  }
  return out;
}

function runGate(args) {
  return spawnSync(process.execPath, [gate, ...args], { encoding: 'utf8' });
}

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'anatomy-gate-'));
  const write = (rel, source) => {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, source);
    return full;
  };
  return { dir, write, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

// ---- parseAnatomyVocabulary ------------------------------------------------

test('parseAnatomyVocabulary reads the as-const object literal', () => {
  const source = `
export const TENANT_THEME_ANATOMY_VARIANTS = {
  cardComponent: ["default", "framed", "underline", "ghost"],
  table: ["default", "ruled", "zebra", "open"],
  sidebar: ["default", "rail", "panel"],
  layout: ["default", "flat", "floating"],
} as const;
`;
  assert.deepEqual(parseAnatomyVocabulary(source), VOCAB);
});

test('parseAnatomyVocabulary returns null when the export is absent', () => {
  assert.equal(parseAnatomyVocabulary('export const SOMETHING_ELSE = 1;'), null);
});

// ---- findAnatomySelectors --------------------------------------------------

test('findAnatomySelectors extracts attr + variant across quote/whitespace forms', () => {
  const css = `
    [data-anatomy-card='underline'] .ds-card { border: 0; }
    [data-anatomy-table="zebra"] .x { }
    [ data-anatomy-layout = 'flat' ] .y { }
  `;
  assert.deepEqual(findAnatomySelectors(css), [
    { attr: 'card', variant: 'underline' },
    { attr: 'table', variant: 'zebra' },
    { attr: 'layout', variant: 'flat' },
  ]);
});

// ---- FAMILY_ATTRIBUTE / mapping --------------------------------------------

test('attributeToFamily inverts FAMILY_ATTRIBUTE', () => {
  assert.deepEqual(attributeToFamily(), {
    card: 'cardComponent',
    table: 'table',
    sidebar: 'sidebar',
    layout: 'layout',
  });
});

test('checkFamilyMapping is clean when vocab and FAMILY_ATTRIBUTE agree', () => {
  assert.deepEqual(checkFamilyMapping(VOCAB), []);
});

test('checkFamilyMapping flags a registered family with no attribute', () => {
  const issues = checkFamilyMapping({ ...VOCAB, toolbar: ['default', 'segmented'] });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /toolbar/);
});

// ---- checkForwardCoverage --------------------------------------------------

test('checkForwardCoverage passes when both engines carry every pair', () => {
  const all = fullSelectorSet();
  const issues = checkForwardCoverage(VOCAB, { modern: all, rustic: all });
  assert.deepEqual(issues, []);
});

test('checkForwardCoverage fails on a missing selector in one engine', () => {
  const all = fullSelectorSet();
  const rusticMissingGhost = all.filter(
    (s) => !(s.attr === 'card' && s.variant === 'ghost'),
  );
  const issues = checkForwardCoverage(VOCAB, {
    modern: all,
    rustic: rusticMissingGhost,
  });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /rustic/);
  assert.match(issues[0], /data-anatomy-card='ghost'/);
});

// ---- checkReverseDeadSelectors ---------------------------------------------

test('checkReverseDeadSelectors passes on registered non-default selectors', () => {
  const entries = fullSelectorSet().map((s) => ({ file: '/x/src/a.css', ...s }));
  assert.deepEqual(checkReverseDeadSelectors(VOCAB, entries), []);
});

test('checkReverseDeadSelectors flags unknown family, default, and unregistered variant', () => {
  const entries = [
    { file: '/x/src/a.css', attr: 'breadcrumb', variant: 'stacked' }, // unknown family
    { file: '/x/src/b.css', attr: 'card', variant: 'default' }, // default has no selector
    { file: '/x/src/c.css', attr: 'card', variant: 'outline' }, // unregistered variant
  ];
  const issues = checkReverseDeadSelectors(VOCAB, entries);
  assert.equal(issues.length, 3);
  assert.match(issues[0], /unknown anatomy family 'breadcrumb'/);
  assert.match(issues[1], /base rendering/);
  assert.match(issues[2], /not registered/);
});

// ---- checkClassicManifest --------------------------------------------------

function fullManifest() {
  const variants = {};
  for (const [family, list] of Object.entries(VOCAB)) {
    variants[family] = {};
    for (const variant of list) {
      if (variant === 'default') continue;
      variants[family][variant] = { support: 'approximated', reason: 'ok' };
    }
  }
  return { variants };
}

test('checkClassicManifest passes on a complete valid manifest', () => {
  assert.deepEqual(checkClassicManifest(VOCAB, fullManifest()), []);
});

test('checkClassicManifest flags missing row, bad support, empty reason, dead entry', () => {
  const manifest = fullManifest();
  delete manifest.variants.table.open; // missing row
  manifest.variants.sidebar.rail.support = 'partial'; // invalid support
  manifest.variants.layout.flat.reason = '   '; // empty reason
  manifest.variants.cardComponent.outline = { support: 'supported', reason: 'x' }; // dead entry

  const issues = checkClassicManifest(VOCAB, manifest);
  assert.ok(issues.some((i) => /missing row for table\.open/.test(i)));
  assert.ok(issues.some((i) => /sidebar\.rail has invalid support/.test(i)));
  assert.ok(issues.some((i) => /layout\.flat has an empty reason/.test(i)));
  assert.ok(issues.some((i) => /cardComponent\.outline is not a registered/.test(i)));
});

// ---- integration: real tree ------------------------------------------------

test('runAnatomyGate passes against the committed tree', () => {
  const { ok, sections, vocab } = runAnatomyGate();
  assert.ok(vocab, 'vocabulary must parse from the real CONTRACT');
  assert.deepEqual(Object.keys(vocab).sort(), [
    'cardComponent',
    'layout',
    'sidebar',
    'table',
  ]);
  assert.equal(ok, true, JSON.stringify(sections, null, 2));
});

test('CLI --check exits 0 on the real tree', () => {
  const result = runGate(['--check', '--quiet']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('CLI --check exits 1 when an engine skin dir has no anatomy selectors', () => {
  const f = fixture();
  try {
    // Empty skin dirs => forward coverage fails for every pair.
    f.write('modern/.keep', '');
    f.write('rustic/.keep', '');
    const result = runGate([
      '--check',
      '--modern-skin',
      join(f.dir, 'modern'),
      '--rustic-skin',
      join(f.dir, 'rustic'),
    ]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no \[data-anatomy-/);
  } finally {
    f.cleanup();
  }
});

test('CLI --check exits 1 when the vocabulary export is missing', () => {
  const f = fixture();
  try {
    const contract = f.write('contract.ts', 'export const OTHER = 1;\n');
    const result = runGate(['--check', '--contract', contract]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /vocabulary not landed|not found/);
  } finally {
    f.cleanup();
  }
});
