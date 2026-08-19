import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { analyzeRuntimeSvgPaint } from './lib/runtime-svg-paint-counter.mjs';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_SRC = join(findPackageRoot(HERE), 'src');
const COMPONENTS = join(CORE_SRC, 'ui');
const CSS = join(CORE_SRC, 'foundation/tokens/css');

function component(relativePath) {
  const file = join(COMPONENTS, relativePath);
  return { file, source: readFileSync(file, 'utf8') };
}

function stylesheet(relativePath) {
  return readFileSync(join(CSS, relativePath), 'utf8');
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Proves a skin rule by extracting the ONE top-level block the selector opens
 * and comparing its body byte-for-byte (leading/trailing whitespace aside).
 *
 * A permissive `includes` check would pass on any superset: a resurrected dead
 * fallback, an extra declaration smuggled into the same block, or a second
 * competing rule later in the file would all survive it. The uniqueness half
 * matters as much as the equality half -- the last rule wins in the cascade,
 * so proving that one exists proves nothing about what actually paints.
 *
 * `(?:^|\})` anchors the match to a top-level rule: a selector reached only as
 * one arm of a comma list, or as the first rule inside an `@media` block, is
 * deliberately NOT this rule and must not satisfy the assertion.
 */
function assertSoleRule(css, selector, expectedBody, label) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const pattern = new RegExp(
    `(?:^|\\})\\s*${escapeForRegExp(selector)}\\s*\\{([^{}]*)\\}`,
    'g'
  );
  const bodies = [...withoutComments.matchAll(pattern)].map((match) => match[1].trim());
  assert.equal(bodies.length, 1, `${label}: expected exactly one top-level rule for ${selector}`);
  assert.equal(bodies[0], expectedBody, label);
}

test('the twenty runtime paint sites keep their exact property identity', () => {
  const boxProperties = [
    'background',
    'backgroundColor',
    'border',
    'borderWidth',
    'borderColor',
    'borderStyle',
    'transform',
    'color',
  ];

  for (const engine of ['modern', 'rustic']) {
    const box = component(`primitives/layout/Box/engines/${engine}/index.tsx`);
    assert.equal(countArc09PaintInFile(box.source, box.file), 8, engine);
    const assignments = [
      ...box.source.matchAll(
        /\bstyle\.(background|backgroundColor|border|borderWidth|borderColor|borderStyle|transform|color)\s*=/g
      ),
    ].map((match) => match[1]);
    assert.deepEqual(assignments, boxProperties, engine);
  }

  const card = component('primitives/display/Card/engines/rustic/index.tsx');
  assert.equal(countArc09PaintInFile(card.source, card.file), 1);
  assert.match(card.source, /\.\.\.\(backgroundColor \? \{ backgroundColor \} : \{\}\)/);

  const overlay = component('primitives/runtime/overlay/backdrop/index.tsx');
  assert.equal(countArc09PaintInFile(overlay.source, overlay.file), 1);
  assert.match(overlay.source, /const overlayStyle: React\.CSSProperties = \{[\s\S]*?\n\s*backgroundColor,/);

  const chartExport = component('patterns/visualization/charts/runtime/exporting/foundation/file/index.ts');
  assert.equal(countArc09PaintInFile(chartExport.source, chartExport.file), 2);
  assert.equal((chartExport.source.match(/\.style\.setProperty\(prop, value\)/g) ?? []).length, 2);
  const runtimeSvg = analyzeRuntimeSvgPaint(chartExport.source, chartExport.file);
  assert.equal(runtimeSvg.count, 5);
  assert.equal(runtimeSvg.classifiedPaint, 5);
  assert.equal(runtimeSvg.unclassified, 0);
  assert.deepEqual(runtimeSvg.unclassifiedSites, []);
  assert.deepEqual(
    runtimeSvg.sites.map(({ kind, property }) => ({ kind, property })),
    [
      { kind: 'dom-set-attribute', property: 'computed-paint-copy' },
      { kind: 'dom-set-attribute', property: 'fill' },
      { kind: 'dom-set-attribute', property: 'computed-paint-copy' },
      { kind: 'dom-set-attribute', property: 'computed-paint-copy' },
      { kind: 'dom-set-attribute', property: 'fill' },
    ]
  );
});

test('the recovered static paint lives in wired, logical-property skins', () => {
  const group = component('primitives/inputs/Input/compound/Group/index.tsx');
  assert.equal(countArc09PaintInFile(group.source, group.file), 0);
  assert.doesNotMatch(group.source, /childStyle\.border(?:Top|Bottom)/);
  assert.match(group.source, /data-compact=\{compact \? 'true' : 'false'\}/);
  const inputCss = stylesheet('presentation/components/skin/input-compounds.css');
  assert.equal(
    (
      inputCss.match(
        /border-(?:start|end)-(?:start|end)-radius: 0 !important;/g,
      ) ?? []
    ).length,
    4,
  );
  assert.doesNotMatch(
    inputCss,
    /border-(?:top|bottom)-(?:left|right)-radius: 0 !important;/,
  );

  // The two engines recovered the SAME inline paint into DIFFERENT skins, so
  // one shared expectation table was a fiction that only held while both were
  // read through a permissive substring check.
  //
  // Modern rides the declared DS scale bare: every `--ds-radius-*` and
  // `--ds-elevation-1..6` channel is declared in the default theme, so a
  // literal fallback beside it is dead bytes that can never fire (the engine's
  // fallback-parity law). `2xl` mounts `--ds-elevation-6` -- the rung the
  // token layer grew -- not a reference back down to 5.
  //
  // Rustic keeps its seven radius fallbacks and its six shadows BYTE-EXACT.
  // It is the vanilla-CSS fallback engine: it is the one skin expected to
  // render standalone, outside the DS theme, where the fallback IS the value.
  // These strings are transcribed from the rustic source and are asserted, not
  // edited -- this atom touches no rustic byte.
  const boxSkinExpectations = new Map([
    [
      'modern',
      {
        radius: new Map([
          ['xs', 'var(--ds-radius-xs)'],
          ['sm', 'var(--ds-radius-sm)'],
          ['md', 'var(--ds-radius-md)'],
          ['lg', 'var(--ds-radius-lg)'],
          ['xl', 'var(--ds-radius-xl)'],
          ['2xl', 'var(--ds-radius-2xl)'],
          ['full', 'var(--ds-radius-full)'],
        ]),
        shadow: new Map([
          ['xs', 'var(--ds-elevation-1)'],
          ['sm', 'var(--ds-elevation-2)'],
          ['md', 'var(--ds-elevation-3)'],
          ['lg', 'var(--ds-elevation-4)'],
          ['xl', 'var(--ds-elevation-5)'],
          ['2xl', 'var(--ds-elevation-6)'],
        ]),
      },
    ],
    [
      'rustic',
      {
        radius: new Map([
          ['xs', 'var(--ds-radius-xs, 0.1875rem)'],
          ['sm', 'var(--ds-radius-sm, 0.375rem)'],
          ['md', 'var(--ds-radius-md, 0.5rem)'],
          ['lg', 'var(--ds-radius-lg, 0.75rem)'],
          ['xl', 'var(--ds-radius-xl, 1rem)'],
          ['2xl', 'var(--ds-radius-2xl, 1.25rem)'],
          ['full', 'var(--ds-radius-full, 9999px)'],
        ]),
        shadow: new Map([
          ['xs', 'var(--ds-elevation-1, 0 1px 2px 0 rgba(0, 0, 0, 0.05))'],
          ['sm', 'var(--ds-elevation-2, 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1))'],
          ['md', 'var(--ds-elevation-3, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1))'],
          ['lg', 'var(--ds-elevation-4, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1))'],
          ['xl', 'var(--ds-elevation-5, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1))'],
          ['2xl', '0 25px 50px -12px rgba(0, 0, 0, 0.25)'],
        ]),
      },
    ],
  ]);
  for (const engine of ['modern', 'rustic']) {
    const box = component(`primitives/layout/Box/engines/${engine}/index.tsx`);
    assert.equal(countArc09PaintInFile(box.source, box.file), 8, engine);
    assert.doesNotMatch(box.source, /style\.(?:borderRadius|boxShadow)\s*=/);
    assert.match(box.source, /const radiusValue = props\.borderRadius \|\| props\.rounded;/);
    assert.match(
      box.source,
      /["']data-radius["']:\s*!callerOwnsRadius && radiusValue && radiusValue !== ["']none["']/,
    );
    assert.match(
      box.source,
      /["']data-shadow["']:\s*!callerOwnsShadow && props\.shadow && props\.shadow !== ["']none["']/,
    );
    const boxCss = stylesheet(`runtime/engines/${engine}/skin/layout.css`);
    const { radius, shadow } = boxSkinExpectations.get(engine);
    for (const [token, value] of radius) {
      assertSoleRule(
        boxCss,
        `.rottay-box.rottay-box--${engine}[data-radius='${token}']`,
        `border-radius: ${value};`,
        `${engine} radius ${token}`
      );
    }
    for (const [token, value] of shadow) {
      assertSoleRule(
        boxCss,
        `.rottay-box.rottay-box--${engine}[data-shadow='${token}']`,
        `box-shadow: ${value};`,
        `${engine} shadow ${token}`
      );
    }
  }

  const toast = component('primitives/feedback/Toast/compound/Container/index.tsx');
  assert.equal(countArc09PaintInFile(toast.source, toast.file), 0);
  assert.doesNotMatch(toast.source, /base\.transform\s*=/);
  assert.match(toast.source, /data-center-transform=\{usesStaticCenterTransform \? 'true' : undefined\}/);
  assert.match(
    stylesheet('presentation/components/skin/toast-compounds.css'),
    /\[data-placement='top-center'\]\[data-center-transform='true'\],[\s\S]*?\[data-placement='bottom-center'\]\[data-center-transform='true'\][\s\S]*?transform: translateX\(-50%\);/
  );

  // Relocated by the chrome-ownership wave: the profile-defaults personality
  // owner now lives under `structures/foundation/chrome/`, not under
  // `surfaces/runtime/`. The move is byte-identical, so the assertions below
  // are unchanged -- only the path was stale, and it made the focal fail
  // before reaching assertions (fail-closed ENOENT on the read).
  const accent = component(
    'structures/foundation/chrome/runtime/profile-defaults/personality/index.tsx'
  );
  assert.equal(countArc09PaintInFile(accent.source, accent.file), 0);
  assert.doesNotMatch(accent.source, /baseStyle\.backgroundSize\s*=/);
  const accentSkin = stylesheet('presentation/components/skin/surface-accent-bar.css');
  assert.doesNotMatch(accentSkin, /background-size: 200% 100%;/);
  assert.match(
    accentSkin,
    /\.ds-surface\.ds-accent-bar\[data-part='bar'\]\s*\{\s*display: none;\s*\}/
  );
});
