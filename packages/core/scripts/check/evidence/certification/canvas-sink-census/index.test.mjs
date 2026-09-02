import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  CANVAS_SINK_MANIFEST,
  checkCanvasSinkCensus,
  compareCanvasSinkCensus,
} from './index.mjs';

test('Canvas sinks have an exact, classified owner census', () => {
  const result = checkCanvasSinkCensus();
  assert.equal(result.ok, true, JSON.stringify(result, null, 2));

  const functional = CANVAS_SINK_MANIFEST
    .filter((entry) => entry.assetClass.startsWith('functional-'))
    .map((entry) => entry.path);
  assert.deepEqual(functional, [
    'src/components/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts',
    'src/components/primitives/display/qr-code/engines/classic/index.tsx',
    'src/components/primitives/display/qr-code/runtime/encoded-symbol/index.tsx',
    'src/components/primitives/overlay/watermark/runtime/canvas-pattern/index.ts',
  ]);
});

test('Canvas census fails closed for an unknown or removed sink', () => {
  const baseline = checkCanvasSinkCensus().actual;
  const unknown = compareCanvasSinkCensus([
    ...baseline,
    { path: 'src/unclassified-canvas.ts', sinks: ['context:2d'] },
  ]);
  assert.equal(unknown.ok, false);
  assert.equal(unknown.unknown[0]?.path, 'src/unclassified-canvas.ts');

  const missing = compareCanvasSinkCensus(baseline.slice(1));
  assert.equal(missing.ok, false);
  assert.equal(missing.missing.length, 1);
});

test('modern and rustic QR skins delegate encoding to the governed runtime', () => {
  for (const engine of ['modern', 'rustic']) {
    const path = new URL(
      `../../../../../src/components/primitives/display/qr-code/engines/${engine}/index.tsx`,
      import.meta.url,
    );
    const source = readFileSync(path, 'utf8');
    assert.match(source, /EncodedQRCodeSymbol/);
    assert.doesNotMatch(source, /generatePattern|\.getContext\(/);
  }
});
