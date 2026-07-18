/**
 * Self-test for css-layer-paint-gate.mjs (CMP-01 / P-76).
 *
 * Drills the gate against fixtures (paint inside a layered import MUST fail;
 * important/allowlisted/unlayered paint must pass) and pins the structural
 * cascade laws of the paint-bridge system: bridge twins imported unlayered in
 * the right positions, and the reduced-motion --ds-motion-* neutralization
 * sitting AFTER the unlayered animations foundation so it wins the
 * source-order tie on :root.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'css-layer-paint-gate.mjs');
const cssRoot = join(scriptDir, '..', 'src/foundation/tokens/css');

function runGate(args) {
  return spawnSync(process.execPath, [gate, ...args], { encoding: 'utf8' });
}

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'css-layer-paint-gate-'));
  const write = (rel, source) => {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, source);
    return full;
  };
  const allowlist = (entries) => write('allowlist.json', JSON.stringify(entries));
  return { dir, write, allowlist, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test('gate passes on the real entrypoints with the committed allowlist', () => {
  const result = runGate([]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('negative drill: normal paint inside a layered import fails', () => {
  const f = fixture();
  try {
    f.write('layered.css', '.x { padding: 4px; }\n');
    const entry = f.write('entry.css', "@import './layered.css' layer(rottay-components);\n");
    const allow = f.allowlist([]);
    const result = runGate(['--entry', entry, '--allowlist', allow]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /paint inside a layered import/);
    assert.match(result.stderr, /padding/);
  } finally {
    f.cleanup();
  }
});

test('nested relative imports inherit the layer', () => {
  const f = fixture();
  try {
    f.write('inner.css', '.x { margin: 0; }\n');
    f.write('outer.css', "@import './inner.css';\n");
    const entry = f.write('entry.css', "@import './outer.css' layer(rottay-tokens);\n");
    const allow = f.allowlist([]);
    const result = runGate(['--entry', entry, '--allowlist', allow]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /inner\.css/);
  } finally {
    f.cleanup();
  }
});

test('important declarations, border-radius, custom properties and keyframes are exempt', () => {
  const f = fixture();
  try {
    f.write(
      'layered.css',
      [
        '.x { padding: 4px !important; border-radius: 8px; --ds-thing: 1px; color: red; }',
        '@keyframes spin { to { margin-left: 4px; } }',
        '',
      ].join('\n')
    );
    const entry = f.write('entry.css', "@import './layered.css' layer(rottay-components);\n");
    const allow = f.allowlist([]);
    const result = runGate(['--entry', entry, '--allowlist', allow]);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    f.cleanup();
  }
});

test('unlayered paint passes; a skin import carrying layer() fails', () => {
  const f = fixture();
  try {
    f.write('paint.css', '.x { padding: 4px; }\n');
    f.write('skin/button.css', '.x { background: red; }\n');
    const goodEntry = f.write('good.css', "@import './paint.css';\n@import './skin/button.css';\n");
    const badEntry = f.write('bad.css', "@import './skin/button.css' layer(rottay-engines);\n");
    const allow = f.allowlist([]);
    assert.equal(runGate(['--entry', goodEntry, '--allowlist', allow]).status, 0);
    const bad = runGate(['--entry', badEntry, '--allowlist', allow]);
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /layered skin import/);
  } finally {
    f.cleanup();
  }
});

test('allowlist: ceiling admits, growth past the ceiling and stale entries fail', () => {
  const f = fixture();
  try {
    f.write('layered.css', '.x { padding: 4px; background: red; }\n');
    const entry = f.write('entry.css', "@import './layered.css' layer(rottay-components);\n");

    const rel = join(f.dir, 'layered.css');
    const ok = f.allowlist([{ file: rel, maxDeclarations: 2, reason: 'drill' }]);
    assert.equal(runGate(['--entry', entry, '--allowlist', ok]).status, 0);

    const tooTight = f.allowlist([{ file: rel, maxDeclarations: 1, reason: 'drill' }]);
    const grew = runGate(['--entry', entry, '--allowlist', tooTight]);
    assert.equal(grew.status, 1);
    assert.match(grew.stderr, /allowlisted layered paint grew/);

    const stale = f.allowlist([
      { file: rel, maxDeclarations: 2, reason: 'drill' },
      { file: join(f.dir, 'gone.css'), maxDeclarations: 3, reason: 'drill' },
    ]);
    const staleResult = runGate(['--entry', entry, '--allowlist', stale]);
    assert.equal(staleResult.status, 1);
    assert.match(staleResult.stderr, /stale allowlist entry/);
  } finally {
    f.cleanup();
  }
});

test('bridge twins are wired unlayered in both entrypoints, in cascade-correct positions', () => {
  for (const entry of ['facade/entrypoints/base.css', 'facade/entrypoints/styles.css']) {
    const css = readFileSync(join(cssRoot, entry), 'utf8');

    const patternsPaint = css.indexOf("@import '../../presentation/components/patterns-paint.css';");
    assert.ok(patternsPaint >= 0, `${entry}: patterns-paint.css must be imported`);
    const firstSkin = css.search(/@import '[^']*\/skin\/[^']*';/);
    assert.ok(firstSkin >= 0, `${entry}: expected skin imports`);
    assert.ok(patternsPaint < firstSkin, `${entry}: patterns-paint.css must precede every skin so skins win ties`);

    const animations = css.indexOf("@import '../../foundation/animations/index.css';");
    const personalityPaint = css.indexOf("@import '../../runtime/personality-paint.css';");
    assert.ok(animations >= 0 && personalityPaint >= 0, `${entry}: animations + personality-paint must be imported`);
    assert.ok(
      personalityPaint > animations,
      `${entry}: personality-paint.css must come after foundation/animations so its :root reduced-motion guard wins the source-order tie`
    );

    for (const twin of ['patterns-paint.css', 'collapse-paint.css', 'personality-paint.css']) {
      assert.doesNotMatch(
        css,
        new RegExp(`@import '[^']*${twin.replace('.', '\\.')}'\\s+layer\\(`),
        `${entry}: ${twin} must stay unlayered`
      );
    }
  }

  // The collapse bridge is a base.css-only import (see runtime/engines/index.css);
  // its paint twin must mirror that asymmetry.
  const base = readFileSync(join(cssRoot, 'facade/entrypoints/base.css'), 'utf8');
  const styles = readFileSync(join(cssRoot, 'facade/entrypoints/styles.css'), 'utf8');
  assert.match(base, /@import '\.\.\/\.\.\/runtime\/bridges\/collapse-paint\.css';/);
  assert.ok(!styles.includes('collapse-paint.css'), 'styles.css must not import collapse-paint.css');
  assert.ok(!styles.includes("'../../runtime/bridges/collapse.css'"), 'styles.css must not import the collapse bridge');
});

test('MOT-03: personality-paint zeroes every --ds-motion-* canon duration under both reduce seams', () => {
  const css = readFileSync(join(cssRoot, 'runtime/personality-paint.css'), 'utf8');
  const tokens = ['--ds-motion-instant', '--ds-motion-fast', '--ds-motion-normal', '--ds-motion-slow', '--ds-motion-glacial'];

  const media = css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/);
  assert.ok(media, 'expected a prefers-reduced-motion guard');
  const seam = css.match(/html\[data-ds-motion='reduced'\] \{[\s\S]*?\n\}/);
  assert.ok(seam, "expected the html[data-ds-motion='reduced'] seam");
  for (const token of tokens) {
    assert.match(media[0], new RegExp(`${token}: 0s;`), `${token} must be zeroed under the OS media guard`);
    assert.match(seam[0], new RegExp(`${token}: 0s;`), `${token} must be zeroed under the runtime seam`);
  }

  // The base durations live in the UNLAYERED animations foundation; a layered
  // guard can never beat them. Pin the foundation still declaring them so this
  // file's tie-breaking position stays meaningful.
  const foundation = readFileSync(join(cssRoot, 'foundation/animations/transitions.css'), 'utf8');
  for (const token of tokens) {
    assert.match(foundation, new RegExp(`${token}:`), `${token} must still be declared by the animations foundation`);
  }
});

test('bridge twins carry paint only: no custom properties outside the reduced-motion guards', () => {
  const twins = [
    'presentation/components/patterns-paint.css',
    'runtime/bridges/collapse-paint.css',
    'runtime/personality-paint.css',
  ];
  for (const rel of twins) {
    const css = readFileSync(join(cssRoot, rel), 'utf8');
    const withoutGuards = css
      .replace(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g, '')
      .replace(/html\[data-ds-motion='reduced'\] \{[\s\S]*?\n\}/g, '');
    assert.doesNotMatch(
      withoutGuards,
      /^\s*--[a-z]/m,
      `${rel}: custom properties belong in the layered originals, not the paint twin`
    );
    assert.doesNotMatch(css, /@import/, `${rel}: twins are leaf files`);
  }
});
