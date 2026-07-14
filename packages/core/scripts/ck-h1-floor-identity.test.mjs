import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const paths = {
  modern: join(packageRoot, 'src/components/patterns/misc/tenant-preview/engines/modern.tsx'),
  rustic: join(packageRoot, 'src/components/patterns/misc/tenant-preview/engines/rustic.tsx'),
  studio: join(packageRoot, 'src/components/patterns/misc/brand-studio/index.tsx'),
};

function source(path) {
  return readFileSync(path, 'utf8');
}

function occurrences(text, fragment) {
  return text.split(fragment).length - 1;
}

function initializerOccurrences(text, fragment) {
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.match(new RegExp(`${escaped}(?=\\s*[,}])`, 'g'))?.length ?? 0;
}

function assertOnce(text, fragment, label) {
  assert.equal(occurrences(text, fragment), 1, `${label} must remain one exact, source-identifiable floor site`);
}

const PALETTE_FLOOR_FRAGMENTS = [
  "{ step: 50, color: mixColor(base, '#ffffff', 0.92) }",
  "{ step: 100, color: mixColor(base, '#ffffff', 0.82) }",
  "{ step: 200, color: mixColor(base, '#ffffff', 0.68) }",
  "{ step: 300, color: mixColor(base, '#ffffff', 0.48) }",
  "{ step: 400, color: mixColor(base, '#ffffff', 0.2) }",
  '{ step: 500, color: base }',
  "{ step: 600, color: mixColor(base, '#000000', 0.12) }",
  "{ step: 700, color: mixColor(base, '#000000', 0.24) }",
  "{ step: 800, color: mixColor(base, '#000000', 0.36) }",
  "{ step: 900, color: mixColor(base, '#000000', 0.48) }",
];

test('CK-H1 tenant-preview floors retain the exact tenant-derived identities', () => {
  const modern = source(paths.modern);
  const rustic = source(paths.rustic);

  for (const fragment of PALETTE_FLOOR_FRAGMENTS) {
    assertOnce(modern, fragment, `modern palette: ${fragment}`);
    assertOnce(rustic, fragment, `rustic palette: ${fragment}`);
  }

  const modernRenderFloor = [
    'backgroundColor: color',
    'backgroundColor: color',
    'color: primaryFg',
    'backgroundColor: primary500',
    'color: primaryFg',
    'border: `1px solid ${primary500}`',
    'color: primary500',
    'backgroundColor: primary500',
    'backgroundColor: primary500',
    'color: primaryFg',
    'backgroundColor: `${primary500}18`',
    'color: primary500',
  ];
  const rusticRenderFloor = [
    'backgroundColor: color',
    'color: primaryFg',
    'backgroundColor: color',
    'backgroundColor: primary500',
  ];

  for (const fragment of new Set(modernRenderFloor)) {
    assert.equal(
      initializerOccurrences(modern, fragment),
      modernRenderFloor.filter((candidate) => candidate === fragment).length,
      `modern runtime render identity drifted: ${fragment}`
    );
  }
  for (const fragment of new Set(rusticRenderFloor)) {
    assert.equal(
      initializerOccurrences(rustic, fragment),
      rusticRenderFloor.filter((candidate) => candidate === fragment).length,
      `rustic runtime render identity drifted: ${fragment}`
    );
  }
});

test('CK-H1 brand-studio floors retain one live swatch and eight domain-object sites', () => {
  const studio = source(paths.studio);

  assertOnce(studio, "background: isHex(value) ? value : 'transparent'", 'live ColorField swatch');

  const notPaint = [
    "background: pickHex(vars, backgroundKeys) ?? ''",
    "color: '#fbfbfb'",
    "borderRadius: { sm: '40px', md: '48px', lg: '64px', xl: '80px' }",
    'ctl.buttonPrimary = { ...(ctl.buttonPrimary ?? {}), color: v }',
    'ctl.input = { ...(ctl.input ?? {}), border: v }',
    'c.cardComponent = { ...(c.cardComponent ?? {}), color: v }',
    'c.cardComponent = { ...(c.cardComponent ?? {}), border: v }',
    'c.tabs = { ...(c.tabs ?? {}), border: v }',
  ];
  for (const fragment of notPaint) {
    assertOnce(studio, fragment, `brand-studio NOT-PAINT: ${fragment}`);
  }
});

test('CK-H1 counters cannot fall below their certified identity floors', () => {
  const expected = new Map([
    [paths.modern, 22],
    [paths.rustic, 14],
    [paths.studio, 9],
  ]);

  for (const [path, floor] of expected) {
    const count = countArc09PaintInFile(source(path), path);
    // Before migration a source may be above its floor. It may never fall below
    // it, and once it reaches the floor every residual's identity is pinned by
    // the two tests above.
    assert.ok(count >= floor, `${path} dropped below its certified floor ${floor}`);
  }
});
