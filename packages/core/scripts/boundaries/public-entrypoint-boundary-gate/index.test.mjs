import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runPublicEntrypointGate } from './index.mjs';

function write(root, relativePath, source) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, source);
}

function runtimeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'public-entrypoint-gate-'));
  const source = 'src/entrypoints/public/primitives/box/index.ts';
  const output = 'entrypoints/public/primitives/box/index';
  const manifest = {
    schemaVersion: 2,
    package: '@rottay/design-system',
    coverage: { runtimeSymbols: 1, typeSymbols: 0, totalSymbols: 1 },
    entries: {
      './primitives/box': {
        owner: 'primitives',
        family: 'box',
        boundary: 'runtime',
        client: true,
        source,
        output,
        budget: { maxDirectSources: 1, maxReachableModules: 3, maxSourceBytes: 1000 },
        symbols: [{ name: 'Box', kind: 'value' }],
      },
    },
  };
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  write(root, 'package.json', `${JSON.stringify({
    name: '@rottay/design-system',
    exports: {
      './primitives/box': {
        types: `./dist/${output}.d.ts`,
        import: `./dist/${output}.js`,
        require: `./dist/${output}.cjs`,
      },
      './public-entrypoints-manifest': { default: './public-entrypoints.manifest.json' },
    },
    files: ['public-entrypoints.manifest.json'],
    releaseSync: { sourceEntrypoints: { './primitives/box': source.slice(4) } },
  }, null, 2)}\n`);
  write(root, 'vite.config.ts', `
readFileSync(resolve(__dirname, 'public-entrypoints.manifest.json'), 'utf8');
const entry = { ...publicEntries };
const output = { preserveModules: true, preserveModulesRoot: 'src' };
`);
  write(root, source, `'use client';\nexport { Box } from '../../../../ui/primitives/layout/Box';\n`);
  write(root, 'src/ui/primitives/layout/Box/index.ts', 'export const Box = 1;\n');
  return { root, manifest };
}

test('accepts a direct family wrapper within its graph budget', () => {
  const { root } = runtimeFixture();
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('rejects a graph that reaches a tier barrel', () => {
  const { root } = runtimeFixture();
  write(root, 'src/ui/primitives/layout/Box/index.ts', "export { Box } from '../../index';\n");
  write(root, 'src/ui/primitives/index.ts', 'export const Box = 1;\n');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /forbidden root\/tier barrel src\/ui\/primitives\/index\.ts/,
  );
});

test('rejects reachable fan-out above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxReachableModules = 1;
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /reachable fan-out 2 exceeds 1/,
  );
});

test('rejects source bytes above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxSourceBytes = 1;
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /source bytes \d+ exceeds 1/,
  );
});

test('rejects a client directive on a pure contracts boundary', () => {
  const { root, manifest } = runtimeFixture();
  const entry = manifest.entries['./primitives/box'];
  delete manifest.entries['./primitives/box'];
  Object.assign(entry, {
    owner: 'contracts',
    family: 'primitives',
    boundary: 'contracts',
    client: false,
    source: 'src/entrypoints/public/contracts/primitives/index.ts',
    output: 'entrypoints/public/contracts/primitives/index',
    symbols: [{ name: 'BoxProps', kind: 'type' }],
  });
  manifest.entries['./contracts/primitives'] = entry;
  manifest.coverage = { runtimeSymbols: 0, typeSymbols: 1, totalSymbols: 1 };
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  delete packageJson.exports['./primitives/box'];
  packageJson.exports['./contracts/primitives'] = {
    types: `./dist/${entry.output}.d.ts`,
    import: `./dist/${entry.output}.js`,
    require: `./dist/${entry.output}.cjs`,
  };
  packageJson.releaseSync.sourceEntrypoints = {
    './contracts/primitives': entry.source.slice(4),
  };
  write(root, 'package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  write(root, entry.source, `'use client';\nexport type { BoxProps } from '../../../../ui/primitives/layout/Box/contracts';\n`);
  write(root, 'src/ui/primitives/layout/Box/contracts/index.ts', 'export interface BoxProps {}\n');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /non-client boundary must remain directive-free/,
  );
});
