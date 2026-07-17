#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'vite';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const packageRootFlag = process.argv.indexOf('--package-root');
const packageRoot = packageRootFlag >= 0
  ? resolve(process.argv[packageRootFlag + 1])
  : resolve(scriptDirectory, '..');
const packageJsonPath = resolve(packageRoot, 'package.json');

function fail(message) {
  throw new Error(`WO-CRA-14 public-barrel gate: ${message}`);
}

if (!existsSync(packageJsonPath)) fail(`missing package.json under ${packageRoot}`);

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const rootEntry = resolve(packageRoot, packageJson.exports?.['.']?.import ?? 'dist/index.js');
const platformCss = resolve(packageRoot, 'dist/platform.css');
const particleBoundary = resolve(packageRoot, 'dist/graphics/motion/react/presentation/effects/particles/index.js');

if (!existsSync(rootEntry)) fail(`missing built public entry ${rootEntry}`);
if (!existsSync(platformCss)) fail(`missing consumable CSS ${platformCss}`);
if (!existsSync(particleBoundary)) fail(`missing public ParticleField boundary ${particleBoundary}`);
if (!readFileSync(platformCss, 'utf8').includes('.ds-collection-shell__static-particle-field')) {
  fail('dist/platform.css does not contain the CRA-14 static fallback selector');
}
if (/style\s*:\s*\{/.test(readFileSync(particleBoundary, 'utf8'))) {
  fail('public ParticleField boundary adds inline style objects outside the governed census');
}

const COLLECTION_ENTRY = '\0cra-14-collection-consumer';
const PARTICLE_API_ENTRY = '\0cra-14-particle-api-consumer';
const virtualEntries = new Map([
  [
    COLLECTION_ENTRY,
    `import { CollectionWorkspace } from ${JSON.stringify(rootEntry)};\n` +
      'globalThis.__cra14CollectionWorkspace = CollectionWorkspace;\n',
  ],
  [
    PARTICLE_API_ENTRY,
    `import { ParticleField } from ${JSON.stringify(rootEntry)};\n` +
      'globalThis.__cra14ParticleField = ParticleField;\n',
  ],
]);

const result = await build({
  configFile: false,
  logLevel: 'silent',
  root: packageRoot,
  plugins: [
    {
      name: 'cra-14-public-consumer-fixtures',
      resolveId(id) {
        return virtualEntries.has(id) ? id : null;
      },
      load(id) {
        return virtualEntries.get(id) ?? null;
      },
    },
  ],
  build: {
    minify: false,
    modulePreload: false,
    write: false,
    rollupOptions: {
      input: {
        collection: COLLECTION_ENTRY,
        particleApi: PARTICLE_API_ENTRY,
      },
      external(id) {
        return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: '[name].js',
        format: 'es',
      },
    },
  },
});

const rollupOutput = Array.isArray(result) ? result[0] : result;
const chunks = rollupOutput.output.filter((item) => item.type === 'chunk');
const chunkByFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));

function normalizedModules(chunk) {
  return Object.keys(chunk.modules).map((moduleId) => moduleId.split(sep).join('/'));
}

function containsModule(chunk, suffix) {
  return normalizedModules(chunk).some((moduleId) => moduleId.endsWith(suffix));
}

function reachableFrom(entry, edgeName) {
  const reachable = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const chunk = queue.shift();
    if (!chunk || reachable.has(chunk.fileName)) continue;
    reachable.add(chunk.fileName);
    for (const importedFile of chunk[edgeName]) {
      const importedChunk = chunkByFile.get(importedFile);
      if (importedChunk) queue.push(importedChunk);
    }
  }
  return [...reachable].map((fileName) => chunkByFile.get(fileName)).filter(Boolean);
}

function allReachableWithDynamic(entry) {
  const reachable = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const chunk = queue.shift();
    if (!chunk || reachable.has(chunk.fileName)) continue;
    reachable.add(chunk.fileName);
    for (const importedFile of [...chunk.imports, ...chunk.dynamicImports]) {
      const importedChunk = chunkByFile.get(importedFile);
      if (importedChunk) queue.push(importedChunk);
    }
  }
  return [...reachable].map((fileName) => chunkByFile.get(fileName)).filter(Boolean);
}

const collectionEntry = chunks.find((chunk) => chunk.isEntry && chunk.name === 'collection');
const particleApiEntry = chunks.find((chunk) => chunk.isEntry && chunk.name === 'particleApi');
if (!collectionEntry || !particleApiEntry) fail('consumer entry chunks were not emitted');

const runtimeSuffix = '/graphics/motion/react/presentation/effects/particles/runtime/canvas/index.js';
const boundarySuffix = '/graphics/motion/react/presentation/effects/particles/index.js';

for (const [label, entry] of [
  ['CollectionWorkspace', collectionEntry],
  ['ParticleField API', particleApiEntry],
]) {
  const staticChunks = reachableFrom(entry, 'imports');
  if (staticChunks.some((chunk) => containsModule(chunk, runtimeSuffix))) {
    fail(`${label} statically requests the ParticleField canvas runtime`);
  }
  const allChunks = allReachableWithDynamic(entry);
  if (!allChunks.some((chunk) => containsModule(chunk, runtimeSuffix))) {
    fail(`${label} lost the explicit dynamic path to the ParticleField canvas runtime`);
  }
}

const particleApiStaticChunks = reachableFrom(particleApiEntry, 'imports');
if (!particleApiStaticChunks.some((chunk) => containsModule(chunk, boundarySuffix))) {
  fail('the public ParticleField API no longer resolves through its lazy boundary');
}

console.log(
  [
    'WO-CRA-14 public-barrel gate passed',
    `package=${packageJson.name}@${packageJson.version}`,
    'CollectionWorkspace static-runtime-requests=0',
    'ParticleField API static-runtime-requests=0',
    'dynamic opt-in path=present',
    'dist fallback CSS=present',
  ].join(' | '),
);
