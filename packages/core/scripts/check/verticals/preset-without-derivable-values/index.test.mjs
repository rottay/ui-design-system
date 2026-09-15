import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  COMPILER_MODULE,
  PRESETS_ROOT,
  derivableFindings,
  overrideLeaves,
  readPresets,
  runGate,
  structuralFindings,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const DIST_PRESENT = existsSync(join(ROOT, COMPILER_MODULE));
const REASON = 'the input error ink is not derived from any decision today, so the vertical states it here until the derivation lane owns it';

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/** A copy of the three real presets, so a planted defect never touches the tree. */
function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'der06-presets-'));
  sandboxes.push(dir);
  mkdirSync(join(dir, PRESETS_ROOT), { recursive: true });
  cpSync(join(ROOT, PRESETS_ROOT), join(dir, PRESETS_ROOT), { recursive: true });
  return dir;
}
const documentPath = (dir, vertical) => join(dir, PRESETS_ROOT, vertical, 'document/index.json');
const manifestPath = (dir, vertical) => join(dir, PRESETS_ROOT, vertical, 'manifest/index.json');
const edit = (path, mutate) => {
  const value = JSON.parse(readFileSync(path, 'utf8'));
  mutate(value);
  writeFileSync(path, JSON.stringify(value, null, 2));
};
const presetOf = (dir, vertical) => readPresets(dir).presets.find((preset) => preset.vertical === vertical);
const rules = (findings) => findings.map((entry) => entry.rule);

let doorPromise = null;
const door = () => {
  doorPromise ??= import(pathToFileURL(join(ROOT, COMPILER_MODULE)).href);
  return doorPromise;
};

describe('preset-without-derivable-values — the three first-party presets', () => {
  it('are on disk, on the internal seat, and pass every structural rule', () => {
    const { presets, findings } = readPresets(ROOT);
    assert.deepEqual(findings, []);
    assert.deepEqual(presets.map((preset) => preset.vertical), ['rottay', 'bithire', 'evnto']);
    for (const preset of presets) {
      assert.equal(preset.document.plan, 'internal');
      assert.deepEqual(structuralFindings(preset), [], `${preset.vertical}: ${JSON.stringify(structuralFindings(preset))}`);
      assert.deepEqual(overrideLeaves(preset.document).leaves, [], `${preset.vertical} carries no sanctioned override today`);
    }
  });

  it('pass the published door and carry nothing the compiler derives', { skip: DIST_PRESENT ? false : `${COMPILER_MODULE} absent` }, async () => {
    const result = await runGate({ root: ROOT });
    assert.equal(result.doorChecked, true);
    assert.deepEqual(result.findings, []);
    assert.equal(result.ok, true);
  });

  it('a preset folder without a document or a manifest is refused by name', () => {
    const dir = sandbox();
    rmSync(join(dir, PRESETS_ROOT, 'evnto', 'document'), { recursive: true, force: true });
    const { findings } = readPresets(dir);
    assert.ok(findings.some((entry) => entry.preset === 'evnto' && entry.rule === 'missing'), JSON.stringify(findings));
  });
});

describe('preset-without-derivable-values — drills', () => {
  it('MUTANT: a raw channel inside a decision is refused by name', () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => { document.decisions['typography.scale'] = 'var(--ds-type-scale)'; });
    const findings = structuralFindings(presetOf(dir, 'bithire'));
    assert.ok(findings.some((entry) => entry.rule === 'raw-channel' && entry.path === 'decisions.typography.scale'), JSON.stringify(findings));
    assert.ok(findings.some((entry) => entry.rule === 'domain' && entry.path === 'decisions.typography.scale'), JSON.stringify(findings));
  });

  it('MUTANT: a decision outside the catalog, a value outside its closed domain, and a scale outside its bounds are each named', () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => {
      document.decisions['palette.mood'] = 'moody';
      document.decisions['shape.button-style'] = 'round';
      document.decisions['shape.radius-scale'] = 9;
      document.decisions['palette.seeds'].foreground = '#000000';
      document.decisions['profiles.expressive'].texture = 'zigzag';
    });
    const findings = structuralFindings(presetOf(dir, 'bithire'));
    const paths = findings.map((entry) => `${entry.rule}:${entry.path}`);
    for (const expected of [
      'decision:decisions.palette.mood',
      'domain:decisions.shape.button-style',
      'domain:decisions.shape.radius-scale',
      'domain:decisions.palette.seeds.foreground',
      'domain:decisions.profiles.expressive.texture',
    ]) assert.ok(paths.includes(expected), `${expected} missing from ${paths.join(' | ')}`);
  });

  it('MUTANT: a pro decision on the standard plan is refused, and a legacy visual field is not a document field', () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => { document.plan = 'standard'; document.tokenOverrides = { '--ds-radius-md': '4px' }; });
    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.plan = 'standard'; });
    const findings = structuralFindings(presetOf(dir, 'bithire'));
    assert.ok(findings.some((entry) => entry.rule === 'tier' && entry.path === 'decisions.palette.contrast-posture'), JSON.stringify(findings));
    assert.ok(findings.some((entry) => entry.rule === 'shape' && entry.path === 'tokenOverrides'), JSON.stringify(findings));
  });

  it('MUTANT: an override without a written reason fails; the same override with a reason passes structurally; a reason without an override is an orphan', () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => { document.overrides = { chrome: { controls: { input: { errorColor: '#FF6B6B' } } } }; });
    let findings = structuralFindings(presetOf(dir, 'bithire'));
    assert.deepEqual(rules(findings), ['unreasoned-override']);
    assert.equal(findings[0].path, 'chrome.controls.input.errorColor');

    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.overrideReasons = { 'chrome.controls.input.errorColor': REASON }; });
    assert.deepEqual(structuralFindings(presetOf(dir, 'bithire')), []);

    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.overrideReasons['chrome.controls.button.primaryBg'] = REASON; });
    findings = structuralFindings(presetOf(dir, 'bithire'));
    assert.deepEqual(rules(findings), ['orphan-reason']);

    edit(documentPath(dir, 'bithire'), (document) => { document.overrides = { tokens: { '--ds-radius-md': '4px' } }; });
    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.overrideReasons = {}; });
    findings = structuralFindings(presetOf(dir, 'bithire'));
    assert.ok(findings.some((entry) => entry.rule === 'override'), JSON.stringify(findings));
    assert.ok(findings.some((entry) => entry.rule === 'raw-channel'), JSON.stringify(findings));
  });

  it('MUTANT (door): an override on a channel the decisions already produce is DERIVABLE and fails naming the key and the channel', { skip: DIST_PRESENT ? false : `${COMPILER_MODULE} absent` }, async () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => { document.overrides = { chrome: { controls: { input: { borderFocus: '#FF0000' } } } }; });
    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.overrideReasons = { 'chrome.controls.input.borderFocus': REASON }; });
    const preset = presetOf(dir, 'bithire');
    assert.deepEqual(structuralFindings(preset), []);
    const { checked, findings } = await derivableFindings(preset, { root: ROOT, door: await door() });
    assert.equal(checked, true);
    assert.deepEqual(rules(findings), ['derivable']);
    assert.equal(findings[0].path, 'chrome.controls.input.borderFocus');
    assert.ok(findings[0].message.includes('--ds-input-border-focus'), findings[0].message);
  });

  it('MUTANT (door): an override that restates a value the decisions already derive fails naming that channel', { skip: DIST_PRESENT ? false : `${COMPILER_MODULE} absent` }, async () => {
    const dir = sandbox();
    const seeds = presetOf(dir, 'bithire').document.decisions['palette.status-seeds'];
    edit(documentPath(dir, 'bithire'), (document) => { document.overrides = { chrome: { controls: { input: { errorColor: seeds.error } } } }; });
    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.overrideReasons = { 'chrome.controls.input.errorColor': REASON }; });
    const { findings } = await derivableFindings(presetOf(dir, 'bithire'), { root: ROOT, door: await door() });
    assert.deepEqual(rules(findings), ['restated-derived-value']);
    assert.ok(findings[0].message.includes('--ds-color-error'), findings[0].message);
  });

  it('a closed override with a written reason on a channel the decisions do not produce passes the door and the derivability check', { skip: DIST_PRESENT ? false : `${COMPILER_MODULE} absent` }, async () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => { document.overrides = { chrome: { controls: { input: { errorColor: '#FF6B6B' } } } }; });
    edit(manifestPath(dir, 'bithire'), (manifest) => { manifest.overrideReasons = { 'chrome.controls.input.errorColor': REASON }; });
    const result = await runGate({ root: dir, distRoot: ROOT });
    assert.equal(result.doorChecked, true);
    assert.deepEqual(result.findings, []);
  });

  it('MUTANT (door): a document the door refuses is named as an admission finding', { skip: DIST_PRESENT ? false : `${COMPILER_MODULE} absent` }, async () => {
    const dir = sandbox();
    edit(documentPath(dir, 'bithire'), (document) => { document.decisions['typography.families'].base = 'comic-sans'; });
    const preset = presetOf(dir, 'bithire');
    const { findings } = await derivableFindings(preset, { root: ROOT, door: await door() });
    assert.deepEqual(rules(findings), ['admission']);
    assert.ok(findings[0].message.includes('comic-sans'), findings[0].message);

    // A record's values are the family contract's: the door names them, the structural pass does not.
    const zigzag = sandbox();
    edit(documentPath(zigzag, 'bithire'), (document) => { document.decisions['profiles.expressive'].motif = 'zigzag'; });
    assert.deepEqual(structuralFindings(presetOf(zigzag, 'bithire')), []);
    const refused = await derivableFindings(presetOf(zigzag, 'bithire'), { root: ROOT, door: await door() });
    assert.deepEqual(rules(refused.findings), ['admission']);
    assert.ok(refused.findings[0].message.includes('zigzag'), refused.findings[0].message);
  });
});
