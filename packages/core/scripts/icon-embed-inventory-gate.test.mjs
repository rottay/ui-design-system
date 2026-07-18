// Self-test for icon-embed-inventory-gate.mjs (packaging honesty).
//
// Hermetic: drills the pure functions with synthetic file lists, no real
// dist/ dependency, so it is safe in the pre-build test:scripts slot.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyVendoredFile,
  evaluateCeiling,
  summarizeVendoredModules,
} from './icon-embed-inventory-gate.mjs';

const PHOSPHOR_SSR =
  'dist/node_modules/.pnpm/@phosphor-icons_react@2.1.10_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@phosphor-icons/react/dist/ssr/Plus.es.js';
const PHOSPHOR_SSR_CJS = PHOSPHOR_SSR.replace(/\.js$/u, '.cjs');
const PHOSPHOR_DEFS = PHOSPHOR_SSR.replace('/dist/ssr/', '/dist/defs/');
const PHOSPHOR_DEFS_CJS = PHOSPHOR_DEFS.replace(/\.js$/u, '.cjs');
const FLAT_SUPPLIER = 'dist/node_modules/left-pad/index.js';

test('classifyVendoredFile counts the ESM/module file and skips its CJS twin', () => {
  assert.deepEqual(classifyVendoredFile(PHOSPHOR_SSR), {
    supplier: '@phosphor-icons/react',
    counted: true,
  });
  assert.deepEqual(classifyVendoredFile(PHOSPHOR_SSR_CJS), {
    supplier: '@phosphor-icons/react',
    counted: false,
  });
});

test('classifyVendoredFile attributes an unscoped package by its top folder', () => {
  assert.deepEqual(classifyVendoredFile(FLAT_SUPPLIER), {
    supplier: 'left-pad',
    counted: true,
  });
});

test('classifyVendoredFile keys off the LAST node_modules segment (pnpm virtual store)', () => {
  // Two "node_modules/" occurrences: dist/node_modules/... and the pnpm
  // virtual store's own nested node_modules/. Supplier attribution must use
  // the second one, not dist's.
  assert.equal((PHOSPHOR_SSR.match(/node_modules\//gu) ?? []).length, 2);
  assert.equal(classifyVendoredFile(PHOSPHOR_SSR).supplier, '@phosphor-icons/react');
});

test('summarizeVendoredModules counts one entry per logical module and groups by supplier', () => {
  const files = [
    { path: PHOSPHOR_SSR, size: 1000 },
    { path: PHOSPHOR_SSR_CJS, size: 900 },
    { path: PHOSPHOR_DEFS, size: 500 },
    { path: PHOSPHOR_DEFS_CJS, size: 450 },
    { path: FLAT_SUPPLIER, size: 200 },
  ];

  const summary = summarizeVendoredModules(files);

  assert.equal(summary.totalFiles, 5);
  // Plus.es.js (ssr) + Plus.es.js (defs) + left-pad/index.js; both .cjs
  // twins excluded.
  assert.equal(summary.moduleCount, 3);
  assert.equal(summary.totalBytes, 1000 + 900 + 500 + 450 + 200);
  assert.deepEqual(summary.bySupplier, {
    '@phosphor-icons/react': 2,
    'left-pad': 1,
  });
});

test('summarizeVendoredModules on an empty tree is zero, not an error', () => {
  const summary = summarizeVendoredModules([]);
  assert.equal(summary.moduleCount, 0);
  assert.equal(summary.totalFiles, 0);
  assert.equal(summary.totalBytes, 0);
  assert.deepEqual(summary.bySupplier, {});
});

test('evaluateCeiling passes at or under the ceiling and fails strictly above it', () => {
  assert.equal(evaluateCeiling(700, 721).ok, true);
  assert.equal(evaluateCeiling(721, 721).ok, true);
  assert.equal(evaluateCeiling(722, 721).ok, false);
});

test('evaluateCeiling failure message names the reseed command', () => {
  const { message } = evaluateCeiling(722, 721);
  assert.match(message, /--write --allow-increase/u);
});

test('evaluateCeiling under the ceiling suggests tightening rather than failing', () => {
  const { ok, message } = evaluateCeiling(300, 721);
  assert.equal(ok, true);
  assert.match(message, /slack/u);
});
