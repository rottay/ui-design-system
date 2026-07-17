#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const CANVAS_SINK_MANIFEST = Object.freeze([
  Object.freeze({
    path: 'src/graphics/motion/react/presentation/effects/particles/runtime/canvas/index.tsx',
    assetClass: 'decorative-effect',
    sinks: Object.freeze(['context:2d']),
  }),
  Object.freeze({
    path: 'src/infrastructure/runtime/spatial/runtime/browser/capability/webgl2/index.ts',
    assetClass: 'capability-probe',
    sinks: Object.freeze(['allocation:canvas', 'context:webgl2']),
  }),
  Object.freeze({
    path: 'src/ui/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts',
    assetClass: 'functional-export',
    sinks: Object.freeze(['allocation:canvas', 'context:2d', 'encode:blob']),
  }),
  Object.freeze({
    path: 'src/ui/primitives/display/QRCode/engines/classic/index.tsx',
    assetClass: 'functional-encoding',
    sinks: Object.freeze(['supplier:qr-encoder']),
  }),
  Object.freeze({
    path: 'src/ui/primitives/display/QRCode/runtime/encoded-symbol/index.tsx',
    assetClass: 'functional-encoding',
    sinks: Object.freeze(['supplier:qr-encoder']),
  }),
  Object.freeze({
    path: 'src/ui/primitives/overlay/Watermark/runtime/canvas-pattern/index.ts',
    assetClass: 'functional-raster',
    sinks: Object.freeze(['allocation:canvas', 'context:2d', 'encode:data-url']),
  }),
]);

const SOURCE_EXTENSION = /\.(?:js|mjs|ts|tsx)$/;

function sourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === '__tests__') continue;
      files.push(...sourceFiles(absolute));
      continue;
    }
    if (!SOURCE_EXTENSION.test(entry.name)) continue;
    if (/\.(?:test|stories)\./.test(entry.name)) continue;
    files.push(absolute);
  }
  return files;
}

function detectSinks(source) {
  const sinks = new Set();
  const literalContexts = [...source.matchAll(/\.getContext\(\s*(['"`])([^'"`]+)\1/g)];
  const contextCallCount = [...source.matchAll(/\.getContext\s*\(/g)].length;
  for (const match of literalContexts) {
    sinks.add(`context:${match[2]}`);
  }
  if (contextCallCount > literalContexts.length) {
    sinks.add('context:dynamic');
  }
  if (/document\.createElement\(\s*(['"`])canvas\1\s*\)/.test(source)) {
    sinks.add('allocation:canvas');
  }
  if (/\bnew\s+OffscreenCanvas\s*\(/.test(source)) sinks.add('allocation:offscreen');
  if (/\.toDataURL\s*\(/.test(source)) sinks.add('encode:data-url');
  if (/\.toBlob\s*\(/.test(source)) sinks.add('encode:blob');
  if (/\.convertToBlob\s*\(/.test(source)) sinks.add('encode:offscreen-blob');
  if (/\.transferControlToOffscreen\s*\(/.test(source)) sinks.add('transfer:offscreen');
  if (/\bQRCode\s+as\s+AntQRCode\b|<AntQRCode\b/.test(source)) {
    sinks.add('supplier:qr-encoder');
  }
  return [...sinks].sort();
}

export function collectCanvasSinkCensus(coreRoot = CORE_ROOT) {
  const sourceRoot = join(coreRoot, 'src');
  return sourceFiles(sourceRoot)
    .map((absolute) => ({
      path: relative(coreRoot, absolute).replaceAll('\\', '/'),
      sinks: detectSinks(readFileSync(absolute, 'utf8')),
    }))
    .filter((entry) => entry.sinks.length > 0)
    .sort((left, right) => left.path.localeCompare(right.path));
}

function normalizedManifest() {
  return CANVAS_SINK_MANIFEST.map(({ path, sinks }) => ({
    path,
    sinks: [...sinks].sort(),
  })).sort((left, right) => left.path.localeCompare(right.path));
}

export function compareCanvasSinkCensus(actual) {
  const expected = normalizedManifest();
  const actualByPath = new Map(actual.map((entry) => [entry.path, entry.sinks]));
  const expectedByPath = new Map(expected.map((entry) => [entry.path, entry.sinks]));
  const unknown = actual.filter((entry) => !expectedByPath.has(entry.path));
  const missing = expected.filter((entry) => !actualByPath.has(entry.path));
  const changed = expected.flatMap((entry) => {
    const actualSinks = actualByPath.get(entry.path);
    if (!actualSinks) return [];
    return JSON.stringify([...actualSinks].sort()) === JSON.stringify(entry.sinks)
      ? []
      : [{ path: entry.path, expected: entry.sinks, actual: [...actualSinks].sort() }];
  });

  return {
    ok: unknown.length === 0 && missing.length === 0 && changed.length === 0,
    actual,
    expected,
    unknown,
    missing,
    changed,
  };
}

export function checkCanvasSinkCensus(coreRoot = CORE_ROOT) {
  return compareCanvasSinkCensus(collectCanvasSinkCensus(coreRoot));
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const result = checkCanvasSinkCensus();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
