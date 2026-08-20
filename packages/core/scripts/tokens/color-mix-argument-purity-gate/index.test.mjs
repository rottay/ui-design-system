import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runColorMixArgumentPurityGate } from './index.mjs';

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'color-mix-purity-gate-'));
  for (const [relativePath, source] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, source);
  }
  return root;
}

function run(root, options = {}) {
  return runColorMixArgumentPurityGate({ root, silent: true, ...options });
}

/**
 * The drill. `--ds-empty-state-bg` was declared as a gradient at `:root` and
 * mixed against in widget-board.css, so the board's error region painted no
 * background under every tenant for as long as it shipped.
 */
test('fails on the reintroduced defect: a gradient token used as a color-mix argument', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': `
:root {
  --ds-empty-state-bg: linear-gradient(145deg, #ffffff, #f4f8fd);
  --ds-surface-panel-bg: #f4f8fd;
}
`,
    'src/foundation/tokens/css/board.css': `
.ds-widget-board__error {
  background: color-mix(in srgb, var(--ds-color-error) 4%, var(--ds-empty-state-bg));
}
`,
  });
  assert.throws(() => run(root), /mixes against --ds-empty-state-bg, which can resolve to gradient/);
});

test('passes once the argument is a colour, and still checks the argument', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': `
:root {
  --ds-empty-state-bg: linear-gradient(145deg, #ffffff, #f4f8fd);
  --ds-surface-panel-bg: #f4f8fd;
}
`,
    'src/foundation/tokens/css/board.css': `
.ds-widget-board__error {
  background: color-mix(in srgb, var(--ds-color-error) 4%, var(--ds-surface-panel-bg));
}
`,
  });
  const report = run(root);
  assert.equal(report.colorMixSites, 1);
  assert.ok(report.checkedArguments >= 1, 'the repaired argument must still be inspected');
});

/**
 * The shape that survives review: the base theme declares a colour, so three
 * tenants render correctly, and only the tenant that authored a gradient goes
 * blank. A gate that resolved one scope at a time would call this clean.
 */
test('fails when only ONE tenant scope turns the token into a gradient', () => {
  const root = fixture({
    'src/foundation/tokens/css/default.css': ':root { --ds-color-surface-raised: #ffffff; }\n',
    'src/foundation/tokens/css/artifacts/bithire.css': `
:is(html[data-tenant='bithire']) {
  --ds-surface-raised: linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%);
  --ds-color-surface-raised: var(--ds-surface-raised);
}
`,
    'src/foundation/tokens/css/alert.css': `
.alert__icon { background: color-mix(in srgb, var(--ds-alert-tone) 11%, var(--ds-color-surface-raised)); }
`,
  });
  assert.throws(() => run(root), /--ds-color-surface-raised/);
});

test('follows an alias chain to the gradient at its root', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': `
:root {
  --ds-surface-icon-bg: linear-gradient(145deg, #eef, #fff);
  --ds-icon-tile-bg: var(--ds-surface-icon-bg);
}
`,
    'src/foundation/tokens/css/tile.css': '.tile { background: color-mix(in srgb, #3A6FB0 12%, var(--ds-icon-tile-bg)); }\n',
  });
  assert.throws(() => run(root), /--ds-surface-icon-bg/);
});

/**
 * A declared name never reaches its own `var()` fallback. Treating the fallback
 * as an escape hatch is precisely how a sweep talks itself out of a live defect.
 */
test('does not let an unreachable fallback excuse a declared gradient', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': ':root { --ds-empty-state-bg: linear-gradient(145deg, #fff, #eee); }\n',
    'src/foundation/tokens/css/board.css':
      '.error { background: color-mix(in srgb, #f00 4%, var(--ds-empty-state-bg, #f4f8fd)); }\n',
  });
  assert.throws(() => run(root), /--ds-empty-state-bg/);
});

test('follows the fallback when the name is declared nowhere', () => {
  const gradientFallback = fixture({
    'src/foundation/tokens/css/board.css':
      '.error { background: color-mix(in srgb, #f00 4%, var(--ds-nowhere, linear-gradient(145deg, #fff, #eee))); }\n',
  });
  assert.throws(() => run(gradientFallback), /--ds-nowhere/);

  const colourFallback = fixture({
    'src/foundation/tokens/css/board.css':
      '.error { background: color-mix(in srgb, #f00 4%, var(--ds-nowhere, #f4f8fd)); }\n',
  });
  assert.doesNotThrow(() => run(colourFallback));
});

test('leaves a gradient alone where it is painted directly', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': ':root { --ds-surface-raised: linear-gradient(180deg, #fff, #f8fbfd); }\n',
    'src/foundation/tokens/css/tile.css': '.tile { background: var(--ds-surface-raised); }\n',
  });
  assert.doesNotThrow(() => run(root));
});

test('does not mistake the percentage position for a colour', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': ':root { --ds-state-hover-shift: 4%; --ds-surface-card: #ffffff; }\n',
    'src/foundation/tokens/css/state.css':
      '.row:hover { background: color-mix(in srgb, #3A6FB0 var(--ds-state-hover-shift, 4%), var(--ds-surface-card)); }\n',
  });
  assert.doesNotThrow(() => run(root));
});

test('does not mistake a calc() multiplier for a colour', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': ':root { --ds-effect-intensity: 0.58; --ds-color-text-on-primary: #ffffff; }\n',
    'src/foundation/tokens/css/glow.css': `
.well {
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-on-primary) calc(48% * var(--ds-effect-intensity)), transparent);
}
`,
  });
  assert.doesNotThrow(() => run(root));
});

test('treats a gradient inside a comment as prose, not as a declaration', () => {
  const root = fixture({
    'src/foundation/tokens/css/tokens.css': `
:root {
  /* --ds-surface-card: linear-gradient(180deg, #fff, #eee); was considered and rejected */
  --ds-surface-card: #ffffff;
}
`,
    'src/foundation/tokens/css/card.css': '.card { background: color-mix(in srgb, #3A6FB0 8%, var(--ds-surface-card)); }\n',
  });
  assert.doesNotThrow(() => run(root));
});

test('reads BrandTheme .ts sources, where the gradient is actually authored', () => {
  const root = fixture({
    'src/foundation/tokens/ts/brand-themes/bithire/index.ts':
      'export const vars = { "--ds-surface-raised": "linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)" };\n',
    'src/foundation/tokens/css/alert.css':
      '.well { background: color-mix(in srgb, #D6A04E 11%, var(--ds-surface-raised)); }\n',
  });
  assert.throws(() => run(root), /--ds-surface-raised/);
});

/** A gate that scans nothing passes everything. */
test('fails closed when the corpus falls below its floor', () => {
  const root = fixture({
    'src/foundation/tokens/css/only.css': '.a { color: red; }\n',
  });
  assert.throws(() => run(root, { minSources: 5 }), /below the corpus floor of 5/);
});

test('the default root resolves to the real corpus and clears its own floor', () => {
  const report = runColorMixArgumentPurityGate({ silent: true });
  assert.ok(report.sources >= 300, `expected the real corpus, scanned ${report.sources}`);
  assert.ok(report.colorMixSites > 1000, `expected the real call sites, found ${report.colorMixSites}`);
});
