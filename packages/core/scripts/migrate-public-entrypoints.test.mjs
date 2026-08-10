import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { transformPublicImports } from './migrate-public-entrypoints.mjs';

const manifest = {
  package: '@rottay/design-system',
  entries: {
    './primitives/box': { symbols: [{ name: 'Box', kind: 'value' }] },
    './contracts/primitives': { symbols: [{ name: 'BoxProps', kind: 'type' }] },
  },
};

test('splits governed values and types while retaining legacy-root symbols', () => {
  const input = `import { Box, type BoxProps, DesignSystemProvider } from '@rottay/design-system';\n`;
  const result = transformPublicImports(input, manifest);
  assert.equal(result.migratedSymbols, 2);
  assert.match(result.source, /import \{ DesignSystemProvider \} from '@rottay\/design-system';/);
  assert.match(result.source, /import type \{ BoxProps \} from '@rottay\/design-system\/contracts\/primitives';/);
  assert.match(result.source, /import \{ Box \} from '@rottay\/design-system\/primitives\/box';/);
});

test('preserves local aliases', () => {
  const result = transformPublicImports(
    `import { Box as SurfaceBox } from "@rottay/design-system";`,
    manifest,
  );
  assert.match(result.source, /\{ Box as SurfaceBox \}/);
  assert.match(result.source, /"@rottay\/design-system\/primitives\/box"/);
});

test('is idempotent for mixed aliased value, type and legacy symbols', () => {
  const input = `import { Box as LayoutBox, type BoxProps as LayoutBoxProps, DesignSystemProvider as Provider } from '@rottay/design-system';\n`;
  const first = transformPublicImports(input, manifest);
  const second = transformPublicImports(first.source, manifest);

  assert.equal(first.changed, true);
  assert.equal(first.migratedSymbols, 2);
  assert.match(first.source, /\{ DesignSystemProvider as Provider \}/);
  assert.match(first.source, /\{ Box as LayoutBox \}/);
  assert.match(first.source, /\{ BoxProps as LayoutBoxProps \}/);
  assert.equal(second.changed, false);
  assert.equal(second.migratedSymbols, 0);
  assert.equal(second.source, first.source);
});

test('leaves files without governed root imports byte-identical', () => {
  const input = `import { Box } from '@rottay/design-system/primitives/box';\n`;
  const result = transformPublicImports(input, manifest);
  assert.equal(result.changed, false);
  assert.equal(result.source, input);
});

test('CLI accepts one file operand without writing it', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'public-entrypoint-codemod-'));
  const manifestPath = path.join(directory, 'manifest.json');
  const sourcePath = path.join(directory, 'consumer.tsx');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  fs.writeFileSync(sourcePath, `import { Box } from '@rottay/design-system';\n`);
  const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrate-public-entrypoints.mjs');
  const result = spawnSync(process.execPath, [scriptPath, '--manifest', manifestPath, sourcePath], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /planned files=1 symbols=1/);
  assert.equal(fs.readFileSync(sourcePath, 'utf8'), `import { Box } from '@rottay/design-system';\n`);
});
