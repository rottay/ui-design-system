#!/usr/bin/env node

/**
 * kernel-bundle — the layout kernel's only BYTE authority, and its supplier-edge guard.
 *
 * WHY THIS GATE EXISTS AT ALL. `public-entrypoints:check` does not govern the
 * kernel: `./runtime/motion`'s source exports GridPattern/NoiseTexture/CountUp/
 * FadeIn/ScaleIn/useInView and no motion kernel, and the ceilings file has no `.`
 * row -- the kernel reaches the public API through the root barrel. So no
 * existing gate reads its bytes.
 *
 * WHY RETENTION IS THE LOAD-BEARING CLAUSE. `graphics/motion/.../reduced-motion`
 * imports `@/infrastructure/runtime/motion`, whose facade's first export is
 * `MotionProvider`, which imports `motion/react`. Rollup shakes that edge today,
 * so "zero dependency" is a property of ONE barrel edge's shakeability, not a
 * structural guarantee. An externals-only predicate cannot see the regression:
 * a fixture that adds `MotionProvider` bundles framer-motion/motion-dom modules
 * while its `externalImports` stay `['react','react/jsx-runtime']`, because
 * `motion` is not in REACT_EXTERNALS and therefore arrives BUNDLED. Measured, not
 * assumed: `retainedNodeModules === 0` is what bites.
 *
 * The instrument is the bundle checker's own (`scripts/check/automation/bundle`):
 * a virtual entry importing named exports from a built `dist/` file, Vite/rollup,
 * `external: ['react', /^react\//]`, `minify: 'esbuild'`, `treeShaking: true`,
 * `inlineDynamicImports: true`, `gzipSync(code, { level: 9 })`. A seed from any
 * other instrument is a number nobody can reproduce at closure time.
 */

import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../..');
const BUDGET_PATH = join(PACKAGE_ROOT, 'scripts/check/motion-budget/budget/index.json');

/** The externals the instrument declares. Anything else arrives bundled. */
const REACT_EXTERNALS = ['react', /^react\//];
/** The kernel's own source root; a fixture that resolved nothing retains none of it. */
const KERNEL_MODULE_FRAGMENT = 'graphics/motion/react/runtime/layout';

export function readBudget(path = BUDGET_PATH) {
  return JSON.parse(readFileSync(path, 'utf8')).kernelBundle;
}

function normalizeModuleId(moduleId) {
  const normalized = moduleId.replaceAll('\\', '/');
  const marker = '/node_modules/';
  const index = normalized.lastIndexOf(marker);
  if (index >= 0) return `node_modules/${normalized.slice(index + marker.length)}`;
  const absolute = resolve(normalized);
  return absolute.startsWith(`${PACKAGE_ROOT}/`)
    ? relative(PACKAGE_ROOT, absolute).replaceAll('\\', '/')
    : normalized;
}

/**
 * Builds one fixture through the governing instrument. `exports` is the pinned
 * export list: three arms of the same instrument differ by 731 B purely by naming
 * different exports, so the list is part of the measurement, not a detail.
 */
export async function measureFixture({ exports: exportNames, entryEsm }) {
  const entry = join(PACKAGE_ROOT, entryEsm);
  if (!existsSync(entry)) {
    throw new Error(`${entryEsm} is missing; build the package before measuring the kernel bundle`);
  }
  const { build } = await import('vite');
  const virtualId = 'virtual:inv-08-kernel-bundle';
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: PACKAGE_ROOT,
    plugins: [{
      name: 'inv-08-kernel-bundle-entry',
      resolveId: (id) => (id === virtualId ? resolvedVirtualId : null),
      load: (id) => (id === resolvedVirtualId
        ? `import { ${exportNames.join(', ')} } from ${JSON.stringify(entry)};\n`
          + `export { ${exportNames.join(', ')} };\n`
        : null),
    }],
    build: {
      write: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: REACT_EXTERNALS,
        output: { format: 'es', inlineDynamicImports: true, entryFileNames: 'bundle.js' },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const chunks = (Array.isArray(result) ? result : [result])
    .flatMap((buildResult) => buildResult.output ?? [])
    .filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline ESM entry chunk; found ${chunks.length}`);
  }

  const { code, modules, imports } = chunks[0];
  const retainedModuleIds = [...new Set(
    Object.entries(modules)
      .filter(([, details]) => (details.renderedLength ?? 0) > 0)
      .map(([moduleId]) => normalizeModuleId(moduleId)),
  )].sort();

  return {
    exports: [...exportNames],
    entryEsm,
    rawBytes: Buffer.byteLength(code),
    gzipBytes: gzipSync(code, { level: 9 }).byteLength,
    externalImports: [...new Set(imports)].sort(),
    retainedModuleIds,
    retainedNodeModules: retainedModuleIds.filter((id) => id.startsWith('node_modules/')),
    kernelModulesRetained: retainedModuleIds.filter((id) => id.includes(KERNEL_MODULE_FRAGMENT)),
  };
}

const allows = (allowed, specifier) => allowed.some(
  (pattern) => (pattern.endsWith('/*')
    ? specifier.startsWith(pattern.slice(0, -1))
    : specifier === pattern),
);

/**
 * The verdict. `retainedNodeModules === 0` first, because it is the clause the
 * planted negative proves and the only one the regression cannot slip past.
 */
export function verdictForBundle(measurement, budget) {
  const failures = [];

  if (measurement.retainedNodeModules.length > budget.maxRetainedNodeModules) {
    failures.push({
      arm: 'retainedNodeModules',
      detail: `${measurement.retainedNodeModules.length} node_modules module(s) retained (allowed `
        + `${budget.maxRetainedNodeModules}): ${measurement.retainedNodeModules.join(', ')}`,
    });
  }

  const foreign = measurement.externalImports.filter(
    (specifier) => !allows(budget.allowedExternalImports, specifier),
  );
  if (foreign.length > 0) {
    failures.push({ arm: 'externalImports', detail: `external import(s) outside the allowance: ${foreign.join(', ')}` });
  }

  if (measurement.gzipBytes > budget.maxGzipBytes) {
    failures.push({
      arm: 'gzipBytes',
      detail: `${measurement.gzipBytes} B gzip exceeds the ${budget.maxGzipBytes} B cap`,
    });
  }

  const delta = measurement.gzipBytes - budget.seed.gzipBytes;
  if (delta > budget.maxDeltaGzipBytes) {
    failures.push({
      arm: 'delta',
      detail: `delta ${delta} B against the pinned seed (${budget.seed.gzipBytes} B for `
        + `[${budget.seed.exports.join(', ')}]) exceeds ${budget.maxDeltaGzipBytes} B`,
    });
  }
  const ceiling = budget.ratchet?.deltaGzipBytes;
  if (typeof ceiling === 'number' && delta > ceiling) {
    failures.push({
      arm: 'ratchet.delta',
      detail: `delta ${delta} B exceeds the decrease-only ceiling ${ceiling} B`,
    });
  }

  // The floor that stops an empty bundle passing every byte ceiling: a fixture
  // whose export list drifted out of the barrel resolves nothing and weighs ~0.
  if (measurement.kernelModulesRetained.length === 0) {
    failures.push({
      arm: 'exportsResolved',
      detail: `the built chunk retains no module under ${KERNEL_MODULE_FRAGMENT}: the fixture's `
        + 'export list does not reach the kernel, so its size measures nothing',
    });
  }

  return { ok: failures.length === 0, failures, measured: { ...measurement, deltaGzipBytes: delta } };
}

async function main() {
  const budget = readBudget();
  const measurement = await measureFixture({ exports: budget.exports, entryEsm: budget.entryEsm });
  const verdict = verdictForBundle(measurement, budget);
  console.log(
    `kernel-bundle | gzip=${measurement.gzipBytes}B | raw=${measurement.rawBytes}B | `
    + `delta=${verdict.measured.deltaGzipBytes}B | externals=[${measurement.externalImports.join(' ')}] | `
    + `node_modules=${measurement.retainedNodeModules.length} | kernel modules=${measurement.kernelModulesRetained.length}`,
  );
  if (process.argv.includes('--json')) console.log(JSON.stringify(verdict, null, 2));
  if (!verdict.ok) {
    for (const failure of verdict.failures) console.error(`  - [${failure.arm}] ${failure.detail}`);
    process.exit(1);
  }
  console.log('kernel-bundle: passed (zero retained supplier modules, inside the cap and the delta).');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) await main();
