#!/usr/bin/env node

/**
 * Bundle Size Analyzer for @rottay/design-system
 *
 * Builds the library with Vite, measures every dist/ entry-point file,
 * and compares against the performance budget defined in PERFORMANCE_BUDGET.md.
 *
 * Usage:
 *   node scripts/analyze-bundle.mjs            # build + analyze
 *   node scripts/analyze-bundle.mjs --skip-build  # analyze existing dist/
 *   node scripts/analyze-bundle.mjs --chart-renderers  # isolated named-export budgets only
 *   node scripts/analyze-bundle.mjs --chart-access  # bounded data-access facade budgets only
 *   node scripts/analyze-bundle.mjs --chart-spec  # server-safe chart contract purity/budget only
 *   node scripts/analyze-bundle.mjs --effects  # EffectRegistry purity/budget only
 *   node scripts/analyze-bundle.mjs --spatial  # Spatial spec/host purity and isolation only
 *
 * Exit codes:
 *   0 - all files within budget
 *   1 - one or more files over budget
 */

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip, gzipSync } from 'node:zlib';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Writable } from 'node:stream';

// ---------------------------------------------------------------------------
// Configuration -- keep in sync with PERFORMANCE_BUDGET.md
// ---------------------------------------------------------------------------

/**
 * SPATIAL BASELINE INJECTION POINT (six exact byte measurements).
 *
 * Exact measurements from the cohesive 2.19.20 producer build on 2026-07-16.
 * Ceilings are derived as measured +10%, rounded up to 100 B.
 */
const SPATIAL_BASELINE_BYTES = Object.freeze({
  spatialEsmRaw: 257,
  spatialCjsRaw: 317,
  spatialSpecEsmRaw: 573,
  spatialSpecCjsRaw: 609,
  spatialHostFixtureGzip: 6_216,
  spatialSpecFixtureGzip: 1_097,
});

function deriveSpatialBudget(measuredBytes) {
  if (!Number.isInteger(measuredBytes) || measuredBytes <= 0) return null;
  return Math.ceil((measuredBytes * 1.1) / 100) * 100;
}

const SPATIAL_RAW_BUDGET = Object.freeze({
  'dist/spatial.js': deriveSpatialBudget(SPATIAL_BASELINE_BYTES.spatialEsmRaw),
  'dist/spatial.cjs': deriveSpatialBudget(SPATIAL_BASELINE_BYTES.spatialCjsRaw),
  'dist/spatial-spec.js': deriveSpatialBudget(SPATIAL_BASELINE_BYTES.spatialSpecEsmRaw),
  'dist/spatial-spec.cjs': deriveSpatialBudget(SPATIAL_BASELINE_BYTES.spatialSpecCjsRaw),
});

const SPATIAL_FIXTURE_BUDGET = Object.freeze({
  host: deriveSpatialBudget(SPATIAL_BASELINE_BYTES.spatialHostFixtureGzip),
  spec: deriveSpatialBudget(SPATIAL_BASELINE_BYTES.spatialSpecFixtureGzip),
});

/** Maximum uncompressed size in bytes for each entry-point file. */
const BUDGET = {
  'dist/index.js': 500_000,
  'dist/index.cjs': 500_000,
  'dist/icons.js': 150_000,
  'dist/icons.cjs': 150_000,
  'dist/marks.js': 100_000,
  'dist/marks.cjs': 100_000,
  // Measured from the VIZ-03D cohesive build on 2026-07-16: 443/495 B after
  // adding ChartInsightSummary. Both ceilings retain >10% headroom.
  'dist/charts.js': 500,
  'dist/charts.cjs': 600,
  // VIZ-03A cohesive-build measurements: 607/643 B. These ceilings retain
  // >10% headroom and round upward to the next 100 B.
  'dist/chart-spec.js': 700,
  'dist/chart-spec.cjs': 800,
  // VIZ-03C cohesive-build measurements: 651/695 B. These ceilings retain
  // >10% headroom and round upward to the next 100 B.
  'dist/chart-access.js': 800,
  'dist/chart-access.cjs': 800,
  // VIZ-03 renderer-facade measurements: 615/659 B after the pure datum-key
  // helper was added. Runtime costs are governed independently below.
  'dist/chart-renderers.js': 700,
  'dist/chart-renderers.cjs': 800,
  // Measured 2026-07-16: 922/930 B. Each ceiling keeps >10% headroom
  // and rounds upward to the next 100 B.
  'dist/motion.js': 1_100,
  'dist/motion.cjs': 1_100,
  // Measured 2026-07-16: 652/676 B. Each ceiling keeps >10% headroom
  // and rounds upward to the next 100 B.
  'dist/effects.js': 800,
  'dist/effects.cjs': 800,
  ...Object.fromEntries(
    Object.entries(SPATIAL_RAW_BUDGET).filter(([, limit]) => limit !== null),
  ),
  'dist/tokens.js': 80_000,
  'dist/tokens.cjs': 80_000,
  'dist/i18n.js': 80_000,
  'dist/i18n.cjs': 80_000,
};

/**
 * Maximum total uncompressed size for all .js + .cjs files under dist/.
 * This acts as a catch-all for preserveModules chunks that don't have an
 * individual entry in BUDGET.
 */
// Measured 2026-07-16 after preserveModules emits both ESM and CJS:
// 7,302,508 B. This is package footprint, not a consumer-route payload.
const TOTAL_JS_BUDGET = 8_100_000; // measured +10%, rounded upward to 100 KB

/**
 * Maximum gzip size for every top-level CSS artifact exposed by package
 * exports (including the dist/*.css compatibility wildcard). These are
 * consumer-selectable payloads; summing mutually exclusive vertical bundles
 * would not describe either a route payload or the packed install footprint.
 * Measured 2026-07-16, with >=10% headroom rounded upward deliberately.
 */
const CSS_BUDGET = {
  'dist/styles.css': 460_000, // 418,154 B measured
  'dist/platform.css': 425_000, // 383,113 B measured
  'dist/bithire.css': 430_000, // 389,050 B measured
  'dist/evnto.css': 410_000, // 368,166 B measured
  'dist/modern-engine.css': 30_000, // 25,744 B measured
  'dist/commercial.css': 8_000, // 7,080 B measured
  'dist/style.css': 2_500, // 2,161 B measured
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pct(actual, limit) {
  return ((actual / limit) * 100).toFixed(1);
}

/**
 * Estimate gzipped size of a file by streaming through zlib.
 */
async function gzipSize(filePath) {
  let size = 0;
  const sink = new Writable({
    write(chunk, _encoding, cb) {
      size += chunk.length;
      cb();
    },
  });
  await pipeline(createReadStream(filePath), createGzip({ level: 9 }), sink);
  return size;
}

/**
 * Recursively collect files matching a predicate.
 */
function collectFiles(dir, predicate, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules inside dist (e.g. re-exports)
      if (entry.name === 'node_modules') continue;
      collectFiles(full, predicate, results);
    } else if (predicate(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Per-component bundle budgets (WO-GAT-02, proposal P-14)
// ---------------------------------------------------------------------------
//
// Builds each flagship component as an INDIVIDUAL externals-heavy Vite library bundle (its own
// throwaway out dir, entry = the component's public `index.ts` barrel -- what an app actually
// imports), gzip-measures the result, and compares against COMPONENT_BUDGET below. This is a
// SEPARATE, smaller build path from the full-package `pnpm run build` above: it calls Vite's
// JS API directly with a minimal one-off config (no tsc/dts/CSS steps), so it stays fast and
// never triggers the package's own "build" script.

/**
 * Flagship component entries: Button/Input/Select/Card/Badge/Table/Tabs/Modal under
 * `primitives/**` + the data-table pattern, per WO-GAT-02. Entry paths are each component's
 * public barrel (`index.ts`), matching what an app actually imports
 * (`import { Button } from '@rottay/design-system'`).
 *
 * Two components share a category name with a non-flagship sibling that lives in a DIFFERENT
 * folder -- resolved by checking which one the public barrel actually exports as that name:
 *  - Modal: `primitives/feedback/Modal` is the canonical public `Modal` export (see
 *    `primitives/feedback/index.ts`); `primitives/overlay/Modal` is exported as `OverlayModal`
 *    (an internal/advanced primitive used by Sheet/Drawer), not this one.
 *  - Badge: `primitives/display/Badge` is the standalone flagship primitive;
 *    `primitives/display/Avatar/compound/Badge` is an Avatar-internal compound sub-part, not
 *    a top-level export.
 */
const COMPONENT_ENTRIES = {
  Button: 'src/components/primitives/inputs/Button/index.ts',
  Input: 'src/components/primitives/inputs/Input/index.ts',
  Select: 'src/components/primitives/inputs/Select/index.ts',
  Card: 'src/components/primitives/display/Card/index.ts',
  Badge: 'src/components/primitives/display/Badge/index.ts',
  Table: 'src/components/primitives/display/Table/index.ts',
  Tabs: 'src/components/primitives/navigation/Tabs/index.ts',
  Modal: 'src/components/primitives/feedback/Modal/index.ts',
  PatternDataTable: 'src/components/patterns/data/data-table/index.ts',
};

/**
 * Maximum GZIP size in bytes for each flagship component's standalone bundle (see
 * `buildComponentBundle` -- all three engines inlined into one file via
 * `inlineDynamicImports`, since `createEngineComponent`'s `lazy(() => import(...))` per-engine
 * loaders mean a bundler cannot statically tree-shake unused engines out of a single build the
 * way it can drop genuinely-unreachable code; measuring the worst case -- all engines present
 * -- is the honest per-component weight a budget should track).
 *
 * Measured 2026-07-09 (WO-GAT-02) with `DS_KEEP_BUNDLE_ANALYSIS=1 node scripts/analyze-bundle.mjs
 * --components` (keeps the throwaway `.bundle-analysis-components/` output instead of deleting
 * it) and exact-byte `gzip -9 -c <bundle> | wc -c` on each `bundle.js` (the printed table only
 * shows KB rounded to 1 decimal, too imprecise to derive a byte budget from). Exact measured
 * gzip bytes, then +10% headroom, then rounded UP to the nearest 500 B for a round number:
 *   Button 15,799 -> 17,500 | Input 11,047 -> 12,500 | Select 16,749 -> 18,500
 *   Card 14,963 -> 16,500 | Badge 12,387 -> 14,000 | Table 15,093 -> 17,000
 *   Tabs 7,376 -> 8,500 | Modal 8,805 -> 10,000 | PatternDataTable 60,808 -> 67,000
 * NOT an aspirational target -- re-measure and bump deliberately if a component's real weight
 * grows for a legitimate reason (a new required feature); never bump this table just to
 * silence a red CI run.
 */
const COMPONENT_BUDGET = {
  Button: 17_500,
  Input: 12_500,
  Select: 18_500,
  Card: 16_500,
  Badge: 14_000,
  Table: 17_000,
  Tabs: 8_500,
  Modal: 10_000,
  PatternDataTable: 67_000,
};

/** Same externals list as `vite.config.ts`'s `rollupOptions.external` -- keeps the per-component
 * measurement honest to what the published package actually externalizes (peer deps + other
 * `@rottay/*` packages), so it isn't inflated by bundling React/antd/d3/etc. into every entry. */
const COMPONENT_BUNDLE_EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'd3',
  /^d3\/.*/,
  'antd',
  '@ant-design/icons',
  'motion',
  'lucide-react',
  'dayjs',
  /^@rottay\/.*/,
  /^antd\/.*/,
  /^@ant-design\/icons\/.*/,
  /^lucide-react\/.*/,
  /^d3-.*/,
  /^motion\/.*/,
  /^dayjs\/.*/,
];

/**
 * Build a single flagship component as a standalone library bundle. `inlineDynamicImports:
 * true` folds `createEngineComponent`'s per-engine `lazy(() => import(...))` loaders into the
 * one output file instead of Rollup code-splitting them into separate chunks -- see
 * `COMPONENT_BUDGET`'s doc comment for why that is the size worth budgeting. Reuses the same
 * aliases as `vite.config.ts`; skips the `dts`/`preserveDirectives` plugins from that config
 * since this is a throwaway size measurement, not a shipped artifact.
 */
async function buildComponentBundle(entryRelPath, outDir) {
  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    resolve: {
      alias: {
        '@': join(ROOT, 'src'),
        '@types': join(ROOT, 'src', 'contracts'),
        '@components': join(ROOT, 'src', 'components'),
      },
    },
    plugins: [react()],
    build: {
      outDir,
      emptyOutDir: true,
      lib: {
        entry: join(ROOT, entryRelPath),
        formats: ['es'],
        fileName: () => 'bundle.js',
      },
      rollupOptions: {
        external: COMPONENT_BUNDLE_EXTERNALS,
        output: { inlineDynamicImports: true },
        onwarn: () => {}, // throwaway measurement build; suppress "use client" directive noise
      },
      sourcemap: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
    logLevel: 'silent',
  });
}

/** Run the `--components` mode: build + gzip-measure every `COMPONENT_ENTRIES` entry, compare
 * against `COMPONENT_BUDGET`, print a table, clean up the throwaway out dir, and return an exit
 * code (0 = all within budget, 1 = at least one over budget or failed to build). */
async function runComponentBudgets() {
  console.log('\n--- Per-component bundle budgets (--components) ---\n');
  const outRoot = join(ROOT, '.bundle-analysis-components');
  let failures = 0;
  const rows = [];

  for (const [name, entryRelPath] of Object.entries(COMPONENT_ENTRIES)) {
    const outDir = join(outRoot, name);
    try {
      await buildComponentBundle(entryRelPath, outDir);
    } catch (err) {
      failures++;
      rows.push({ file: name, raw: '-', gz: '-', limit: '-', usage: '-', status: 'BUILD FAIL' });
      console.error(`\x1b[31mFailed to build ${name}: ${err.message}\x1b[0m`);
      continue;
    }

    const jsFiles = collectFiles(outDir, (n) => n.endsWith('.js'));
    let raw = 0;
    let gz = 0;
    for (const f of jsFiles) {
      raw += statSync(f).size;
      gz += await gzipSize(f);
    }
    const limit = COMPONENT_BUDGET[name];
    const overBudget = limit !== undefined && gz > limit;
    if (overBudget) failures++;
    rows.push({
      file: name,
      raw: formatBytes(raw),
      gz: formatBytes(gz),
      limit: limit !== undefined ? formatBytes(limit) : '-',
      usage: limit !== undefined ? `${pct(gz, limit)}%` : '-',
      status: limit === undefined ? 'NO BUDGET' : overBudget ? 'FAIL' : 'PASS',
    });
  }

  if (!process.env.DS_KEEP_BUNDLE_ANALYSIS) rmSync(outRoot, { recursive: true, force: true }); // throwaway -- never committed

  const cols = ['file', 'raw', 'gz', 'limit', 'usage', 'status'];
  const headers = { file: 'Component', raw: 'Raw', gz: 'Gzip', limit: 'Budget (gzip)', usage: 'Usage', status: 'Status' };
  const widths = {};
  for (const col of cols) {
    widths[col] = headers[col].length;
    for (const row of rows) widths[col] = Math.max(widths[col], String(row[col]).length);
  }
  const pad = (str, len) => String(str).padEnd(len);
  console.log(cols.map((c) => pad(headers[c], widths[c])).join(' | '));
  console.log(cols.map((c) => '-'.repeat(widths[c])).join('-+-'));
  for (const row of rows) {
    const line = cols.map((c) => pad(row[c], widths[c])).join(' | ');
    if (row.status === 'FAIL' || row.status === 'BUILD FAIL') console.log(`\x1b[31m${line}\x1b[0m`);
    else if (row.status === 'PASS') console.log(`\x1b[32m${line}\x1b[0m`);
    else console.log(line);
  }
  console.log('');

  if (failures > 0) {
    console.error(`\x1b[31m${failures} component(s) over budget or failed to build.\x1b[0m\n`);
  } else {
    console.log('\x1b[32mAll components within budget.\x1b[0m\n');
  }
  return failures > 0 ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Named chart-renderer bundle budgets (VIZ-02)
// ---------------------------------------------------------------------------

/**
 * A budget on `dist/chart-renderers.js` alone is not sufficient because the
 * package build preserves modules: that file is only a small re-export while
 * the actual renderer and geometry code lives in reachable chunks. Build each
 * named public export in isolation so the measured gzip bytes are the real
 * first-party transitive cost a tree-shaking ESM consumer retains.
 *
 * Rebaselined for VIZ-03 on 2026-07-16 through the built public facade with
 * React/D3 external: Bar 11,427 B, Line 12,099 B, HeatMap 10,135 B gzip.
 * The deliberate increase is the shared accessible interaction, insight and
 * responsive surface runtime; sibling renderers remain absent. Each ceiling
 * adds at least 10% headroom and rounds upward to the next 100 B.
 */
const CHART_RENDERER_BUDGET = {
  SvgBarRenderer: 12_600,
  SvgLineRenderer: 13_400,
  SvgHeatMapRenderer: 11_200,
};

// Measured provisionally from the current source entry on 2026-07-16 at
// 101 B gzip with no imports. This helper must remain independently tree-shakeable; renderer
// component budget increases require an implementation fix, not wider limits.
const CHART_RENDERER_UTILITY_BUDGET = {
  createSvgLineDatumKey: 200,
};

// Measured 15,647 B gzip in the same build. The combined fixture proves that
// shared interaction/insight infrastructure is deduplicated instead of paying
// the three isolated costs additively; the ceiling retains >10% headroom.
const CHART_RENDERER_SUITE_BUDGET = 17_300;

const CHART_RENDERER_ENTRY = join(ROOT, 'dist', 'chart-renderers.js');
const CHART_RENDERER_SOURCE_DIR = '/components/patterns/visualization/charts/kernel/renderers/';
const CHART_GEOMETRY_MODULE = `${CHART_RENDERER_SOURCE_DIR}ChartGeometry.js`;
const CHART_RENDERER_BUILDERS = {
  SvgBarRenderer: 'buildSvgBarGeometry',
  SvgLineRenderer: 'buildSvgLineGeometry',
  SvgHeatMapRenderer: 'buildSvgHeatMapGeometry',
};
const CHART_RENDERER_EXTERNALS = [
  'react',
  /^react\//,
  'react-dom',
  /^react-dom\//,
  'd3',
  /^d3\//,
  /^d3-/,
];

function normalizedModuleId(value) {
  return value.replaceAll('\\', '/').split('?')[0];
}

function renderedModules(chunks) {
  const rendered = new Map();
  for (const chunk of chunks) {
    for (const [moduleId, details] of Object.entries(chunk.modules)) {
      if ((details.renderedLength ?? 0) > 0) {
        rendered.set(normalizedModuleId(moduleId), {
          renderedLength: details.renderedLength,
          renderedExports: details.renderedExports ?? [],
        });
      }
    }
  }
  return rendered;
}

function isExternalFamily(specifier, family) {
  if (family === 'react') return specifier === 'react' || specifier.startsWith('react/');
  if (family === 'motion') return specifier === 'motion' || specifier.startsWith('motion/');
  return specifier === 'd3' || specifier.startsWith('d3/') || specifier.startsWith('d3-');
}

/** Build one named export through the built public facade, never its private
 * leaf path. `write: false` keeps this gate in-memory and `inlineDynamicImports`
 * makes raw/gzip size a single, unambiguous transitive bundle. */
async function buildChartRendererExports(exportNames) {
  if (!existsSync(CHART_RENDERER_ENTRY)) {
    throw new Error('dist/chart-renderers.js is missing; build the package before measuring published renderers');
  }
  const names = Array.isArray(exportNames) ? exportNames : [exportNames];
  if (names.length === 0) throw new Error('at least one chart-renderer export is required');
  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const exportList = names.join(', ');
  const virtualId = `virtual:viz-02-chart-renderer:${names.join('-')}`;
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    resolve: {
      alias: {
        '@': join(ROOT, 'src'),
        '@types': join(ROOT, 'src', 'contracts'),
        '@components': join(ROOT, 'src', 'components'),
      },
    },
    plugins: [
      react(),
      {
        name: 'viz-02-named-chart-renderer-entry',
        resolveId(id) {
          return id === virtualId ? resolvedVirtualId : null;
        },
        load(id) {
          if (id !== resolvedVirtualId) return null;
          return (
            `import { ${exportList} } from ${JSON.stringify(CHART_RENDERER_ENTRY)};\n` +
            `export { ${exportList} };\n`
          );
        },
      },
    ],
    build: {
      write: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: CHART_RENDERER_EXTERNALS,
        output: {
          format: 'es',
          inlineDynamicImports: true,
          entryFileNames: 'bundle.js',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const outputs = (Array.isArray(result) ? result : [result]).flatMap((buildResult) => buildResult.output ?? []);
  const chunks = outputs.filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline entry chunk; found ${chunks.length}`);
  }

  const code = chunks.map((chunk) => chunk.code).join('\n');
  const modules = renderedModules(chunks);
  const imports = new Set(chunks.flatMap((chunk) => chunk.imports));
  const bundledPeerModules = [...modules.keys()].filter((moduleId) => (
    /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react(?:-dom)?|d3(?:-[^/]+)?)(?:\/|$)/.test(moduleId)
  ));

  return {
    raw: Buffer.byteLength(code),
    gzip: gzipSync(code, { level: 9 }).byteLength,
    modules,
    imports,
    bundledPeerModules,
  };
}

async function buildNamedChartRenderer(rendererName) {
  return buildChartRendererExports([rendererName]);
}

function printChartRendererRows(rows) {
  const cols = ['renderer', 'raw', 'gzip', 'limit', 'usage', 'isolation', 'status'];
  const headers = {
    renderer: 'Renderer',
    raw: 'Raw',
    gzip: 'Gzip',
    limit: 'Budget (gzip)',
    usage: 'Usage',
    isolation: 'Named isolation',
    status: 'Status',
  };
  const widths = {};
  for (const col of cols) {
    widths[col] = headers[col].length;
    for (const row of rows) widths[col] = Math.max(widths[col], String(row[col]).length);
  }
  const padValue = (value, width) => String(value).padEnd(width);
  console.log(cols.map((col) => padValue(headers[col], widths[col])).join(' | '));
  console.log(cols.map((col) => '-'.repeat(widths[col])).join('-+-'));
  for (const row of rows) {
    const line = cols.map((col) => padValue(row[col], widths[col])).join(' | ');
    console.log(row.status === 'PASS' ? `\x1b[32m${line}\x1b[0m` : `\x1b[31m${line}\x1b[0m`);
  }
  console.log('');
}

/** Measure every renderer component and its public utility export. Fail closed
 * if the contract drifts, a component retains a sibling, or peers are bundled. */
async function runChartRendererBudgets() {
  console.log('\n--- Named chart-renderer bundle budgets (VIZ-02) ---\n');
  const rendererNames = Object.keys(CHART_RENDERER_BUDGET);
  const utilityNames = Object.keys(CHART_RENDERER_UTILITY_BUDGET);
  const supplierContract = JSON.parse(readFileSync(join(ROOT, 'supplier-contract.json'), 'utf8'));
  const publicContract = supplierContract.entrypoints?.['./charts/renderers'];
  const publicExports = [...(publicContract?.exports ?? [])].sort();
  const governedExports = [...rendererNames, ...utilityNames].sort();
  if (JSON.stringify(publicExports) !== JSON.stringify(governedExports)) {
    console.error(
      `\x1b[31mChart-renderer budget inventory differs from the published supplier contract: ` +
      `budget=[${governedExports.join(', ')}], public=[${publicExports.join(', ')}].\x1b[0m\n`,
    );
    return 1;
  }
  const rows = [];
  let failures = 0;

  for (const rendererName of rendererNames) {
    const limit = CHART_RENDERER_BUDGET[rendererName];
    try {
      const result = await buildNamedChartRenderer(rendererName);
      const selectedSuffix = `${CHART_RENDERER_SOURCE_DIR}${rendererName}.js`;
      const siblings = rendererNames
        .filter((candidate) => candidate !== rendererName)
        .filter((candidate) => [...result.modules.keys()].some((moduleId) => (
          moduleId.endsWith(`${CHART_RENDERER_SOURCE_DIR}${candidate}.js`)
        )));
      const selectedRetained = [...result.modules.keys()].some((moduleId) => moduleId.endsWith(selectedSuffix));
      const expectedBuilder = CHART_RENDERER_BUILDERS[rendererName];
      const geometryDetails = [...result.modules.entries()]
        .find(([moduleId]) => moduleId.endsWith(CHART_GEOMETRY_MODULE))?.[1];
      const renderedBuilders = Object.values(CHART_RENDERER_BUILDERS)
        .filter((builder) => geometryDetails?.renderedExports.includes(builder));
      const siblingBuilders = renderedBuilders.filter((builder) => builder !== expectedBuilder);
      const expectsD3 = publicContract.symbols?.[rendererName]?.includes('d3') ?? false;
      const d3External = [...result.imports].some((specifier) => isExternalFamily(specifier, 'd3'));
      const reactExternal = [...result.imports].some((specifier) => isExternalFamily(specifier, 'react'));
      const isolationErrors = [];
      if (!selectedRetained) isolationErrors.push('selected export missing');
      if (siblings.length > 0) isolationErrors.push(`siblings: ${siblings.join(', ')}`);
      if (!geometryDetails?.renderedExports.includes(expectedBuilder)) isolationErrors.push('selected builder missing');
      if (siblingBuilders.length > 0) isolationErrors.push(`sibling builders: ${siblingBuilders.join(', ')}`);
      if (result.bundledPeerModules.length > 0) isolationErrors.push('React/D3 bundled');
      if (expectsD3 && !d3External) isolationErrors.push('D3 external missing');
      if (!expectsD3 && d3External) isolationErrors.push('unexpected D3 external');
      if (!reactExternal) isolationErrors.push('React external missing');
      const overBudget = result.gzip > limit;
      if (overBudget || isolationErrors.length > 0) failures += 1;
      rows.push({
        renderer: rendererName,
        raw: `${formatBytes(result.raw)} (${result.raw} B)`,
        gzip: `${formatBytes(result.gzip)} (${result.gzip} B)`,
        limit: formatBytes(limit),
        usage: `${pct(result.gzip, limit)}%`,
        isolation: isolationErrors.length === 0 ? 'isolated; peers external' : isolationErrors.join('; '),
        status: overBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS',
      });
    } catch (error) {
      failures += 1;
      rows.push({
        renderer: rendererName,
        raw: '-',
        gzip: '-',
        limit: formatBytes(limit),
        usage: '-',
        isolation: error instanceof Error ? error.message : String(error),
        status: 'BUILD FAIL',
      });
    }
  }

  for (const utilityName of utilityNames) {
    const limit = CHART_RENDERER_UTILITY_BUDGET[utilityName];
    try {
      const result = await buildNamedChartRenderer(utilityName);
      const definingModule = [...result.modules.entries()].find(([moduleId]) => (
        moduleId.endsWith(`${CHART_RENDERER_SOURCE_DIR}SvgLineDatumKey.js`)
      ))?.[1];
      const d3External = [...result.imports].some((specifier) => isExternalFamily(specifier, 'd3'));
      const isolationErrors = [];
      if (!definingModule?.renderedExports.includes(utilityName)) isolationErrors.push('utility export missing');
      if (result.bundledPeerModules.length > 0) isolationErrors.push('React/D3 bundled');
      if (d3External) isolationErrors.push('D3 retained by pure key helper');
      const overBudget = result.gzip > limit;
      if (overBudget || isolationErrors.length > 0) failures += 1;
      rows.push({
        renderer: utilityName,
        raw: `${formatBytes(result.raw)} (${result.raw} B)`,
        gzip: `${formatBytes(result.gzip)} (${result.gzip} B)`,
        limit: formatBytes(limit),
        usage: `${pct(result.gzip, limit)}%`,
        isolation: isolationErrors.length === 0 ? 'isolated; D3 absent; peers not bundled' : isolationErrors.join('; '),
        status: overBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS',
      });
    } catch (error) {
      failures += 1;
      rows.push({
        renderer: utilityName,
        raw: '-',
        gzip: '-',
        limit: formatBytes(limit),
        usage: '-',
        isolation: error instanceof Error ? error.message : String(error),
        status: 'BUILD FAIL',
      });
    }
  }

  try {
    const result = await buildChartRendererExports(rendererNames);
    const retainedRenderers = rendererNames.filter((rendererName) => (
      [...result.modules.keys()].some((moduleId) => (
        moduleId.endsWith(`${CHART_RENDERER_SOURCE_DIR}${rendererName}.js`)
      ))
    ));
    const geometryDetails = [...result.modules.entries()]
      .find(([moduleId]) => moduleId.endsWith(CHART_GEOMETRY_MODULE))?.[1];
    const retainedBuilders = Object.values(CHART_RENDERER_BUILDERS)
      .filter((builder) => geometryDetails?.renderedExports.includes(builder));
    const d3External = [...result.imports].some((specifier) => isExternalFamily(specifier, 'd3'));
    const reactExternal = [...result.imports].some((specifier) => isExternalFamily(specifier, 'react'));
    const isolationErrors = [];
    if (retainedRenderers.length !== rendererNames.length) isolationErrors.push('renderer family incomplete');
    if (retainedBuilders.length !== rendererNames.length) isolationErrors.push('geometry family incomplete');
    if (result.bundledPeerModules.length > 0) isolationErrors.push('React/D3 bundled');
    if (!d3External) isolationErrors.push('D3 external missing');
    if (!reactExternal) isolationErrors.push('React external missing');
    const overBudget = result.gzip > CHART_RENDERER_SUITE_BUDGET;
    if (overBudget || isolationErrors.length > 0) failures += 1;
    rows.push({
      renderer: 'All renderers',
      raw: `${formatBytes(result.raw)} (${result.raw} B)`,
      gzip: `${formatBytes(result.gzip)} (${result.gzip} B)`,
      limit: formatBytes(CHART_RENDERER_SUITE_BUDGET),
      usage: `${pct(result.gzip, CHART_RENDERER_SUITE_BUDGET)}%`,
      isolation: isolationErrors.length === 0 ? 'deduped; peers external' : isolationErrors.join('; '),
      status: overBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS',
    });
  } catch (error) {
    failures += 1;
    rows.push({
      renderer: 'All renderers',
      raw: '-',
      gzip: '-',
      limit: formatBytes(CHART_RENDERER_SUITE_BUDGET),
      usage: '-',
      isolation: error instanceof Error ? error.message : String(error),
      status: 'BUILD FAIL',
    });
  }

  printChartRendererRows(rows);
  if (failures > 0) {
    console.error(`\x1b[31m${failures} chart-renderer export bundle(s) failed budget or isolation.\x1b[0m\n`);
  } else {
    console.log('\x1b[32mAll chart-renderer exports are isolated and within budget.\x1b[0m\n');
  }
  return failures;
}

// ---------------------------------------------------------------------------
// Semantic motion facade isolation budgets (MOT-01)
// ---------------------------------------------------------------------------

const MOTION_ENTRY = join(ROOT, 'dist', 'motion.js');
const MOTION_FIXTURE_EXPORTS = Object.freeze({
  policy: Object.freeze([
    'MOTION_DIAL_BOUNDS',
    'MOTION_PROFILE_DEFAULTS',
    'MOTION_PROFILE_ENVELOPES',
    'MOTION_RECIPE_NAMES',
    'normalizeTenantMotionDial',
    'resolveMotionPolicy',
    'resolveMotionRecipe',
  ]),
  provider: Object.freeze(['MotionProvider']),
});

// Measured 2026-07-16 through the built public facade: pure policy 1,822 B
// gzip and provider 2,076 B gzip. Each ceiling adds 10% and rounds upward.
const MOTION_FIXTURE_BUDGET = Object.freeze({
  policy: 2_100,
  provider: 2_300,
});

const MOTION_EXTERNALS = [
  'react',
  /^react\//,
  'react-dom',
  /^react-dom\//,
  'motion',
  /^motion\//,
];

async function buildMotionFixture(name) {
  if (!existsSync(MOTION_ENTRY)) {
    throw new Error('dist/motion.js is missing; build the package before measuring semantic motion');
  }
  const exportedNames = MOTION_FIXTURE_EXPORTS[name];
  if (!exportedNames) throw new Error(`unknown semantic motion fixture ${name}`);

  const { build } = await import('vite');
  const virtualId = `virtual:mot-01-${name}`;
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    plugins: [{
      name: 'mot-01-semantic-motion-entry',
      resolveId(id) {
        return id === virtualId ? resolvedVirtualId : null;
      },
      load(id) {
        if (id !== resolvedVirtualId) return null;
        const names = exportedNames.join(', ');
        return `import { ${names} } from ${JSON.stringify(MOTION_ENTRY)};\nexport { ${names} };\n`;
      },
    }],
    build: {
      write: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: MOTION_EXTERNALS,
        output: {
          format: 'es',
          inlineDynamicImports: true,
          entryFileNames: 'bundle.js',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const outputs = (Array.isArray(result) ? result : [result])
    .flatMap((buildResult) => buildResult.output ?? []);
  const chunks = outputs.filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline entry chunk; found ${chunks.length}`);
  }

  const code = chunks.map((chunk) => chunk.code).join('\n');
  const modules = renderedModules(chunks);
  return {
    raw: Buffer.byteLength(code),
    gzip: gzipSync(code, { level: 9 }).byteLength,
    modules,
    imports: new Set(chunks.flatMap((chunk) => chunk.imports)),
    bundledPeerModules: [...modules.keys()].filter((moduleId) => (
      /\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react(?:-dom)?|motion)(?:\/|$)/.test(moduleId)
    )),
  };
}

function printMotionFixtureRows(rows) {
  const cols = ['fixture', 'raw', 'gzip', 'limit', 'isolation', 'status'];
  const widths = Object.fromEntries(cols.map((column) => [column, column.length]));
  for (const row of rows) {
    for (const column of cols) {
      widths[column] = Math.max(widths[column], String(row[column]).length);
    }
  }
  const line = (row) => cols
    .map((column) => String(row[column]).padEnd(widths[column]))
    .join(' | ');
  console.log(line(Object.fromEntries(cols.map((column) => [column, column]))));
  console.log(cols.map((column) => '-'.repeat(widths[column])).join('-+-'));
  for (const row of rows) {
    const rendered = line(row);
    console.log(row.status === 'PASS' ? `\x1b[32m${rendered}\x1b[0m` : `\x1b[31m${rendered}\x1b[0m`);
  }
  console.log('');
}

async function runMotionFixtureBudgets() {
  console.log('\n--- Semantic motion isolation budgets (MOT-01) ---\n');
  const supplierContract = JSON.parse(readFileSync(join(ROOT, 'supplier-contract.json'), 'utf8'));
  const publicContract = supplierContract.entrypoints?.['./motion'];
  const rows = [];
  let failures = 0;

  if (!publicContract?.symbols?.MotionProvider?.includes('motion')) {
    console.error('\x1b[31mMotionProvider must declare the motion supplier in supplier-contract.json.\x1b[0m\n');
    return 1;
  }
  for (const exportedName of MOTION_FIXTURE_EXPORTS.policy) {
    if (!publicContract.supplierFreeExports?.includes(exportedName)) {
      console.error(`\x1b[31m${exportedName} must remain supplier-free in the motion contract.\x1b[0m\n`);
      return 1;
    }
  }

  for (const name of Object.keys(MOTION_FIXTURE_EXPORTS)) {
    const limit = MOTION_FIXTURE_BUDGET[name];
    try {
      const result = await buildMotionFixture(name);
      const reactExternal = [...result.imports].some((specifier) => isExternalFamily(specifier, 'react'));
      const motionExternal = [...result.imports].some((specifier) => isExternalFamily(specifier, 'motion'));
      const isolationErrors = [];
      if (result.bundledPeerModules.length > 0) isolationErrors.push('React/Motion bundled');
      if (name === 'policy') {
        if (reactExternal || motionExternal) isolationErrors.push('supplier retained by pure policy');
        const clientRuntimeRetained = [...result.modules.keys()].some((moduleId) => (
          /\/runtime\/motion\/(?:MotionProvider|MotionPreference|motion-environment-store|reduced-motion-store)\.js$/.test(moduleId)
        ));
        if (clientRuntimeRetained) isolationErrors.push('client runtime retained');
      } else {
        if (!reactExternal) isolationErrors.push('React external missing');
        if (!motionExternal) isolationErrors.push('Motion external missing');
      }
      const overBudget = result.gzip > limit;
      if (overBudget || isolationErrors.length > 0) failures += 1;
      rows.push({
        fixture: name,
        raw: `${formatBytes(result.raw)} (${result.raw} B)`,
        gzip: `${formatBytes(result.gzip)} (${result.gzip} B)`,
        limit: formatBytes(limit),
        isolation: isolationErrors.length === 0
          ? name === 'policy' ? 'pure; no React/Motion' : 'React/Motion external'
          : isolationErrors.join('; '),
        status: overBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS',
      });
    } catch (error) {
      failures += 1;
      rows.push({
        fixture: name,
        raw: '-',
        gzip: '-',
        limit: formatBytes(limit),
        isolation: error instanceof Error ? error.message : String(error),
        status: 'BUILD FAIL',
      });
    }
  }

  printMotionFixtureRows(rows);
  return failures;
}

// ---------------------------------------------------------------------------
// Supplier-neutral EffectRegistry facade isolation budget (EFX-01A)
// ---------------------------------------------------------------------------

const EFFECTS_ENTRY = join(ROOT, 'dist', 'effects.js');
const EFFECTS_CJS_ENTRY = join(ROOT, 'dist', 'effects.cjs');
const EFFECTS_TYPES_ENTRY = join(ROOT, 'dist', 'effects.d.ts');
const EFFECTS_FIXTURE_EXPORTS = Object.freeze([
  'EFFECT_DEFINITIONS',
  'EFFECT_IDS',
  'EFFECT_REGISTRY',
  'EFFECT_REGISTRY_VERSION',
  'EFFECT_RESEARCH_PROVENANCE',
  'getEffectDefinition',
  'isEffectDefinition',
  'isEffectId',
  'resolveEffect',
]);

// Measured 2026-07-16 through all nine public values: 4,829 B gzip. The
// ceiling keeps >10% headroom and rounds upward to the next 500 B.
const EFFECTS_FIXTURE_BUDGET = 5_500;
const EFFECTS_EXTERNALS = [
  'react',
  /^react\//,
  'react-dom',
  /^react-dom\//,
  'motion',
  /^motion\//,
  'd3',
  /^d3(?:-|\/)/,
  'three',
  /^three\//,
  '@react-three/fiber',
  /^@react-three\/fiber\//,
  '@react-three/drei',
  /^@react-three\/drei\//,
  'antd',
  /^antd\//,
  '@ant-design/icons',
  /^@ant-design\/icons\//,
  '@phosphor-icons/react',
  /^@phosphor-icons\/react\//,
  '@thesvg/react',
  /^@thesvg\/react\//,
  'lucide-react',
  /^lucide-react\//,
];

// ---------------------------------------------------------------------------
// Server-safe chart specification facade isolation budget (VIZ-03A)
// ---------------------------------------------------------------------------

const CHART_SPEC_ENTRY = join(ROOT, 'dist', 'chart-spec.js');
const CHART_SPEC_CJS_ENTRY = join(ROOT, 'dist', 'chart-spec.cjs');
const CHART_SPEC_TYPES_ENTRY = join(ROOT, 'dist', 'chart-spec.d.ts');
const CHART_SPEC_SOURCE_TYPES_ENTRY = join(ROOT, 'dist', 'chart-spec-entry.d.ts');
const CHART_SPEC_FIXTURE_EXPORTS = Object.freeze([
  'CHART_GRAMMARS',
  'CHART_GRAMMAR_IDS',
  'CHART_GRAMMAR_REGISTRY',
  'isChartGrammar',
  'isChartGrammarId',
  'isChartInsightSpec',
  'isChartInsightSummary',
  'resolveChartGrammar',
]);

// The cohesive producer build on 2026-07-16 retained every public value at
// 1,787 B gzip. This ceiling keeps >20% headroom.
const CHART_SPEC_FIXTURE_BUDGET = 2_200;
const CHART_SPEC_ARTIFACT_FRAGMENT = '/components/patterns/visualization/charts/kernel/spec/';
const BROWSER_RUNTIME_PATTERN = /\b(?:window|document|navigator|localStorage|sessionStorage|fetch|requestAnimationFrame|cancelAnimationFrame|matchMedia|ResizeObserver|IntersectionObserver|MutationObserver|HTMLElement|HTMLCanvasElement|SVGElement|OffscreenCanvas|WebGLRenderingContext|WebGL2RenderingContext|GPUDevice|GPUCanvasContext)\b/;
const DOM_DECLARATION_PATTERN = /\b(?:Window|Document|Navigator|Storage|HTMLElement|HTMLCanvasElement|SVGElement|ResizeObserver|IntersectionObserver|MutationObserver|OffscreenCanvas|WebGLRenderingContext|WebGL2RenderingContext|GPUDevice|GPUCanvasContext)\b/;
const SPATIAL_BROWSER_RUNTIME_PATTERN = /\b(?:window|document|navigator|localStorage|sessionStorage|indexedDB|location|history|screen|fetch|requestAnimationFrame|cancelAnimationFrame|matchMedia|ResizeObserver|IntersectionObserver|MutationObserver|Worker|SharedWorker|ServiceWorker|WebSocket|EventSource|BroadcastChannel|HTMLElement|HTMLCanvasElement|SVGElement|OffscreenCanvas|WebGLRenderingContext|WebGL2RenderingContext|GPUDevice|GPUCanvasContext)\b/;
const SPATIAL_DOM_DECLARATION_PATTERN = /\b(?:Window|Document|Navigator|Storage|Location|History|Screen|Element|HTMLElement|HTMLCanvasElement|SVGElement|Node|Event|EventTarget|CustomEvent|MediaQueryList|ResizeObserver|IntersectionObserver|MutationObserver|Request|Response|Headers|URL|URLSearchParams|Blob|File|FormData|AbortController|AbortSignal|ReadableStream|WritableStream|TransformStream|Worker|SharedWorker|ServiceWorker|WebSocket|EventSource|BroadcastChannel|MessageChannel|MessagePort|ImageBitmap|ImageData|CanvasRenderingContext2D|OffscreenCanvas|WebGLRenderingContext|WebGL2RenderingContext|GPUDevice|GPUCanvasContext)\b/;
const BROWSER_DECLARATION_LIB_PATTERN = /^(?:dom(?:\..+)?|webworker(?:\..+)?|scripthost)$/i;

const CHART_ACCESS_ENTRY = join(ROOT, 'dist', 'chart-access.js');
const CHART_ACCESS_CJS_ENTRY = join(ROOT, 'dist', 'chart-access.cjs');
const CHART_ACCESS_TYPES_ENTRY = join(ROOT, 'dist', 'chart-access.d.ts');
const CHART_ACCESS_SOURCE_TYPES_ENTRY = join(ROOT, 'dist', 'chart-access-entry.d.ts');
const CHART_ACCESS_FIXTURE_EXPORTS = Object.freeze([
  'CHART_DATA_ACCESS_CSV_MIME_TYPE',
  'CHART_DATA_ACCESS_PAGE_SIZE_MAX',
  'CHART_DATA_ACCESS_SUMMARY_LIMIT',
  'ChartDataAccess',
  'sanitizeChartDataAccessCsvFilename',
  'serializeChartDataAccessCsv',
]);
const CHART_ACCESS_PURE_EXPORTS = Object.freeze([
  'CHART_DATA_ACCESS_CSV_MIME_TYPE',
  'sanitizeChartDataAccessCsvFilename',
  'serializeChartDataAccessCsv',
]);
// VIZ-03C cohesive-build measurements: all exports 2,380 B gzip and pure CSV
// exports 791 B gzip. The ceilings retain >15% and >25% headroom.
const CHART_ACCESS_FIXTURE_BUDGET = 2_800;
const CHART_ACCESS_PURE_BUDGET = 1_000;
const CHART_ACCESS_ARTIFACT_FRAGMENT = '/components/patterns/visualization/charts/kernel/access/';

// ---------------------------------------------------------------------------
// Spatial policy/host facade isolation gate (SPATIAL-01)
// ---------------------------------------------------------------------------

const SPATIAL_ENTRY = join(ROOT, 'dist', 'spatial.js');
const SPATIAL_CJS_ENTRY = join(ROOT, 'dist', 'spatial.cjs');
const SPATIAL_TYPES_ENTRY = join(ROOT, 'dist', 'spatial.d.ts');
const SPATIAL_SOURCE_TYPES_ENTRY = join(ROOT, 'dist', 'spatial-entry.d.ts');
const SPATIAL_SPEC_ENTRY = join(ROOT, 'dist', 'spatial-spec.js');
const SPATIAL_SPEC_CJS_ENTRY = join(ROOT, 'dist', 'spatial-spec.cjs');
const SPATIAL_SPEC_TYPES_ENTRY = join(ROOT, 'dist', 'spatial-spec.d.ts');
const SPATIAL_SPEC_SOURCE_TYPES_ENTRY = join(ROOT, 'dist', 'spatial-spec-entry.d.ts');

const SPATIAL_HOST_FIXTURE_EXPORTS = Object.freeze([
  'SPATIAL_SCENE_MODULE_VERSION',
  'SpatialExperience',
]);
const SPATIAL_SPEC_FIXTURE_EXPORTS = Object.freeze([
  'SPATIAL_QUALITY_BUDGETS',
  'SPATIAL_SCENE_MODULE_VERSION',
  'downgradeSpatialMode',
  'isSpatialSceneModule',
  'resolveSpatialPolicy',
  'resolveSpatialQualityBudget',
]);

const SPATIAL_SPEC_ARTIFACT_FRAGMENTS = Object.freeze([
  '/contracts/spatial/',
  '/runtime/spatial/',
]);
// SpatialExperience consumes the supplier-neutral motion policy hook directly.
// Keep this allowlist finite so MotionProvider, recipes and renderer adapters
// cannot enter the host closure while the external Motion package stays banned.
const SPATIAL_HOST_BRIDGE_ARTIFACT_FRAGMENTS = Object.freeze([
  '/contracts/motion/',
  '/contracts/verticals/',
  '/runtime/motion/MotionPreference.',
  '/runtime/motion/motion-environment-store.',
  '/runtime/motion/policy.',
  '/runtime/motion/reduced-motion-store.',
  '/runtime/spatial-react/',
]);
const SPATIAL_ASSET_MODULE_PATTERN = /\.(?:avif|bmp|css|eot|gif|glb|gltf|ico|jpe?g|less|mp3|mp4|ogg|otf|png|sass|scss|svg|ttf|wav|wasm|webm|webp|woff2?)$/i;
const SPATIAL_INLINE_ASSET_PATTERN = /\bdata:(?:application\/wasm|audio\/|font\/|image\/|model\/|video\/)/i;

function isChartSpecArtifact(file) {
  const normalized = file.replaceAll('\\', '/');
  return normalized === CHART_SPEC_ENTRY.replaceAll('\\', '/')
    || normalized === CHART_SPEC_CJS_ENTRY.replaceAll('\\', '/')
    || normalized === CHART_SPEC_TYPES_ENTRY.replaceAll('\\', '/')
    || normalized === CHART_SPEC_SOURCE_TYPES_ENTRY.replaceAll('\\', '/')
    || normalized.includes(CHART_SPEC_ARTIFACT_FRAGMENT);
}

function isChartAccessArtifact(file) {
  const normalized = file.replaceAll('\\', '/');
  return normalized === CHART_ACCESS_ENTRY.replaceAll('\\', '/')
    || normalized === CHART_ACCESS_CJS_ENTRY.replaceAll('\\', '/')
    || normalized === CHART_ACCESS_TYPES_ENTRY.replaceAll('\\', '/')
    || normalized === CHART_ACCESS_SOURCE_TYPES_ENTRY.replaceAll('\\', '/')
    || normalized.includes(CHART_ACCESS_ARTIFACT_FRAGMENT);
}

function isSpatialSpecArtifact(file) {
  const normalized = file.replaceAll('\\', '/');
  return normalized === SPATIAL_SPEC_ENTRY.replaceAll('\\', '/')
    || normalized === SPATIAL_SPEC_CJS_ENTRY.replaceAll('\\', '/')
    || normalized === SPATIAL_SPEC_TYPES_ENTRY.replaceAll('\\', '/')
    || normalized === SPATIAL_SPEC_SOURCE_TYPES_ENTRY.replaceAll('\\', '/')
    || SPATIAL_SPEC_ARTIFACT_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function isSpatialHostArtifact(file) {
  const normalized = file.replaceAll('\\', '/');
  return normalized === SPATIAL_ENTRY.replaceAll('\\', '/')
    || normalized === SPATIAL_CJS_ENTRY.replaceAll('\\', '/')
    || normalized === SPATIAL_TYPES_ENTRY.replaceAll('\\', '/')
    || normalized === SPATIAL_SOURCE_TYPES_ENTRY.replaceAll('\\', '/')
    || isSpatialSpecArtifact(file)
    || SPATIAL_HOST_BRIDGE_ARTIFACT_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function resolveArtifactSpecifier(fromFile, specifier, extension) {
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}${extension}`,
    join(base, `index${extension}`),
  ];
  if (extension === '.d.ts' && /\.[cm]?js$/.test(base)) {
    candidates.unshift(base.replace(/\.[cm]?js$/, '.d.ts'));
  }
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function stripJsComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function containsImportExpression(ast) {
  if (!ast || typeof ast !== 'object') return false;
  const pending = [ast];
  const visited = new Set();
  while (pending.length > 0) {
    const node = pending.pop();
    if (!node || typeof node !== 'object' || visited.has(node)) continue;
    visited.add(node);
    if (node.type === 'ImportExpression') return true;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) pending.push(...value);
      else if (value && typeof value === 'object') pending.push(value);
    }
  }
  return false;
}

function isSpatialReactEdge(specifier) {
  return specifier === 'react' || specifier.startsWith('react/');
}

function auditSpatialCjsClosure({
  entry,
  label,
  isAllowedArtifact,
  browserSafe,
  reactRequired,
}) {
  if (!existsSync(entry)) return [`${relative(ROOT, entry)} is missing`];
  const pending = [entry];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    const requireCalls = [...source.matchAll(/\brequire\s*\(/g)].length;
    const literalRequires = [...source.matchAll(/\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g)];
    if (requireCalls !== literalRequires.length) {
      errors.push(`computed/non-literal require in ${relative(ROOT, file)}`);
    }
    if (/\bimport\s*\(/.test(source)) {
      errors.push(`dynamic import in ${relative(ROOT, file)}`);
    }
    if (browserSafe && /(?:^|[;\n])\s*['"]use client['"]/.test(source)) {
      errors.push(`client directive in ${relative(ROOT, file)}`);
    }
    if (browserSafe && SPATIAL_BROWSER_RUNTIME_PATTERN.test(source)) {
      errors.push(`browser runtime in ${relative(ROOT, file)}`);
    }
    for (const match of literalRequires) {
      const specifier = match[2];
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.cjs');
      if (!target) errors.push(`unresolved CJS edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const unexpectedExternal = [...external].filter((specifier) => !(
    reactRequired && isSpatialReactEdge(specifier)
  ));
  const foreign = [...visited].filter((file) => !isAllowedArtifact(file));
  if (unexpectedExternal.length > 0) {
    errors.push(`${label} CJS non-React requires retained: ${unexpectedExternal.join(', ')}`);
  }
  if (reactRequired && ![...external].some(isSpatialReactEdge)) {
    errors.push(`${label} CJS React external missing`);
  }
  if (foreign.length > 0) {
    errors.push(`${label} CJS foreign modules retained: ${foreign.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function auditSpatialDeclarationClosure({
  entry,
  label,
  isAllowedArtifact,
  browserSafe,
  reactRequired,
}) {
  if (!existsSync(entry)) return [`${relative(ROOT, entry)} is missing`];
  const pending = [entry];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const rawSource = readFileSync(file, 'utf8');
    const source = stripJsComments(rawSource);
    const referencePaths = [
      ...rawSource.matchAll(/<reference\s+path\s*=\s*['"]([^'"]+)['"]/g),
    ].map((match) => match[1]);
    const referenceTypes = [
      ...rawSource.matchAll(/<reference\s+types\s*=\s*['"]([^'"]+)['"]/g),
    ].map((match) => match[1]);
    const referenceLibs = [
      ...rawSource.matchAll(/<reference\s+lib\s*=\s*['"]([^'"]+)['"]/g),
    ].map((match) => match[1]);
    if (
      browserSafe
      && (
        SPATIAL_DOM_DECLARATION_PATTERN.test(source)
        || SPATIAL_BROWSER_RUNTIME_PATTERN.test(source)
        || referenceLibs.some((lib) => BROWSER_DECLARATION_LIB_PATTERN.test(lib.trim()))
      )
    ) {
      errors.push(`browser declaration in ${relative(ROOT, file)}`);
    }
    for (const specifier of new Set(referencePaths)) {
      const target = resolveArtifactSpecifier(file, specifier, '.d.ts');
      if (!target) errors.push(`unresolved declaration reference ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
    const specifiers = [
      ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
      ...source.matchAll(/\bimport\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((match) => match[1]).concat(referenceTypes);
    for (const specifier of new Set(specifiers)) {
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.d.ts');
      if (!target) errors.push(`unresolved declaration edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const unexpectedExternal = [...external].filter((specifier) => !(
    reactRequired && isSpatialReactEdge(specifier)
  ));
  const foreign = [...visited].filter((file) => !isAllowedArtifact(file));
  if (unexpectedExternal.length > 0) {
    errors.push(`${label} declaration non-React suppliers retained: ${unexpectedExternal.join(', ')}`);
  }
  if (reactRequired && ![...external].some(isSpatialReactEdge)) {
    errors.push(`${label} declaration React external missing`);
  }
  if (foreign.length > 0) {
    errors.push(`${label} declaration foreign modules retained: ${foreign.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function auditEffectsCjsClosure() {
  if (!existsSync(EFFECTS_CJS_ENTRY)) {
    return ['dist/effects.cjs is missing'];
  }
  const pending = [EFFECTS_CJS_ENTRY];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    const requireCalls = [...source.matchAll(/\brequire\s*\(/g)].length;
    const literalRequires = [...source.matchAll(/\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g)];
    if (requireCalls !== literalRequires.length) {
      errors.push(`computed/non-literal require in ${relative(ROOT, file)}`);
    }
    if (/\bimport\s*\(/.test(source)) {
      errors.push(`dynamic import in ${relative(ROOT, file)}`);
    }
    for (const match of literalRequires) {
      const specifier = match[2];
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.cjs');
      if (!target) errors.push(`unresolved CJS edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const forbidden = [...visited].filter((file) => (
    /\/(?:components|hooks|motion)\//.test(file)
  ));
  if (external.size > 0) errors.push(`CJS external requires retained: ${[...external].join(', ')}`);
  if (forbidden.length > 0) {
    errors.push(`CJS visual/client modules retained: ${forbidden.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function auditEffectsDeclarationClosure() {
  if (!existsSync(EFFECTS_TYPES_ENTRY)) {
    return ['dist/effects.d.ts is missing'];
  }
  const pending = [EFFECTS_TYPES_ENTRY];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    const specifiers = [
      ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
      ...source.matchAll(/\bimport\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/<reference\s+types=['"]([^'"]+)['"]/g),
      ...source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((match) => match[1]);
    for (const specifier of new Set(specifiers)) {
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.d.ts');
      if (!target) errors.push(`unresolved declaration edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const forbidden = [...visited].filter((file) => (
    /\/(?:components|hooks|motion)\//.test(file)
  ));
  if (external.size > 0) {
    errors.push(`declaration suppliers retained: ${[...external].join(', ')}`);
  }
  if (forbidden.length > 0) {
    errors.push(`declaration visual/client modules retained: ${forbidden.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function auditChartSpecCjsClosure() {
  if (!existsSync(CHART_SPEC_CJS_ENTRY)) {
    return ['dist/chart-spec.cjs is missing'];
  }
  const pending = [CHART_SPEC_CJS_ENTRY];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    const requireCalls = [...source.matchAll(/\brequire\s*\(/g)].length;
    const literalRequires = [...source.matchAll(/\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g)];
    if (requireCalls !== literalRequires.length) {
      errors.push(`computed/non-literal require in ${relative(ROOT, file)}`);
    }
    if (/\bimport\s*\(/.test(source)) {
      errors.push(`dynamic import in ${relative(ROOT, file)}`);
    }
    if (/(?:^|[;\n])\s*['"]use client['"]/.test(source)) {
      errors.push(`client directive in ${relative(ROOT, file)}`);
    }
    if (BROWSER_RUNTIME_PATTERN.test(source)) {
      errors.push(`browser runtime in ${relative(ROOT, file)}`);
    }
    for (const match of literalRequires) {
      const specifier = match[2];
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.cjs');
      if (!target) errors.push(`unresolved CJS edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const foreign = [...visited].filter((file) => !isChartSpecArtifact(file));
  if (external.size > 0) errors.push(`CJS external requires retained: ${[...external].join(', ')}`);
  if (foreign.length > 0) {
    errors.push(`CJS client/foreign modules retained: ${foreign.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function auditChartSpecDeclarationClosure() {
  if (!existsSync(CHART_SPEC_TYPES_ENTRY)) {
    return ['dist/chart-spec.d.ts is missing'];
  }
  const pending = [CHART_SPEC_TYPES_ENTRY];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    if (DOM_DECLARATION_PATTERN.test(source) || /<reference\s+lib=['"]dom['"]/.test(source)) {
      errors.push(`browser declaration in ${relative(ROOT, file)}`);
    }
    const specifiers = [
      ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
      ...source.matchAll(/\bimport\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/<reference\s+types=['"]([^'"]+)['"]/g),
      ...source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((match) => match[1]);
    for (const specifier of new Set(specifiers)) {
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.d.ts');
      if (!target) errors.push(`unresolved declaration edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const foreign = [...visited].filter((file) => !isChartSpecArtifact(file));
  if (external.size > 0) errors.push(`declaration suppliers retained: ${[...external].join(', ')}`);
  if (foreign.length > 0) {
    errors.push(`declaration client/foreign modules retained: ${foreign.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function isAllowedChartAccessReactEdge(specifier) {
  return specifier === 'react' || specifier.startsWith('react/');
}

function auditChartAccessCjsClosure() {
  if (!existsSync(CHART_ACCESS_CJS_ENTRY)) {
    return ['dist/chart-access.cjs is missing'];
  }
  const pending = [CHART_ACCESS_CJS_ENTRY];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    const requireCalls = [...source.matchAll(/\brequire\s*\(/g)].length;
    const literalRequires = [...source.matchAll(/\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g)];
    if (requireCalls !== literalRequires.length) {
      errors.push(`computed/non-literal require in ${relative(ROOT, file)}`);
    }
    if (/\bimport\s*\(/.test(source)) {
      errors.push(`dynamic import in ${relative(ROOT, file)}`);
    }
    for (const match of literalRequires) {
      const specifier = match[2];
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.cjs');
      if (!target) errors.push(`unresolved CJS edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const unexpectedExternal = [...external].filter((specifier) => (
    !isAllowedChartAccessReactEdge(specifier)
  ));
  const foreign = [...visited].filter((file) => !isChartAccessArtifact(file));
  if (unexpectedExternal.length > 0) {
    errors.push(`CJS non-React requires retained: ${unexpectedExternal.join(', ')}`);
  }
  if (foreign.length > 0) {
    errors.push(`CJS foreign modules retained: ${foreign.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

function auditChartAccessDeclarationClosure() {
  if (!existsSync(CHART_ACCESS_TYPES_ENTRY)) {
    return ['dist/chart-access.d.ts is missing'];
  }
  const pending = [CHART_ACCESS_TYPES_ENTRY];
  const visited = new Set();
  const external = new Set();
  const errors = [];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = stripJsComments(readFileSync(file, 'utf8'));
    const specifiers = [
      ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
      ...source.matchAll(/\bimport\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/<reference\s+types=['"]([^'"]+)['"]/g),
      ...source.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((match) => match[1]);
    for (const specifier of new Set(specifiers)) {
      if (!specifier.startsWith('.')) {
        external.add(specifier);
        continue;
      }
      const target = resolveArtifactSpecifier(file, specifier, '.d.ts');
      if (!target) errors.push(`unresolved declaration edge ${specifier} from ${relative(ROOT, file)}`);
      else pending.push(target);
    }
  }

  const unexpectedExternal = [...external].filter((specifier) => (
    !isAllowedChartAccessReactEdge(specifier)
  ));
  const foreign = [...visited].filter((file) => !isChartAccessArtifact(file));
  if (unexpectedExternal.length > 0) {
    errors.push(`declaration non-React suppliers retained: ${unexpectedExternal.join(', ')}`);
  }
  if (foreign.length > 0) {
    errors.push(`declaration foreign modules retained: ${foreign.map((file) => relative(ROOT, file)).join(', ')}`);
  }
  return errors;
}

async function buildEffectsFixture() {
  if (!existsSync(EFFECTS_ENTRY)) {
    throw new Error('dist/effects.js is missing; build the package before measuring EffectRegistry');
  }

  const { build } = await import('vite');
  const virtualId = 'virtual:efx-01-effect-registry';
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    plugins: [{
      name: 'efx-01-effect-registry-entry',
      resolveId(id) {
        return id === virtualId ? resolvedVirtualId : null;
      },
      load(id) {
        if (id !== resolvedVirtualId) return null;
        const names = EFFECTS_FIXTURE_EXPORTS.join(', ');
        return `import { ${names} } from ${JSON.stringify(EFFECTS_ENTRY)};\nexport { ${names} };\n`;
      },
    }],
    build: {
      write: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: EFFECTS_EXTERNALS,
        output: {
          format: 'es',
          inlineDynamicImports: true,
          entryFileNames: 'bundle.js',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const outputs = (Array.isArray(result) ? result : [result])
    .flatMap((buildResult) => buildResult.output ?? []);
  const chunks = outputs.filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline EffectRegistry entry chunk; found ${chunks.length}`);
  }

  const code = chunks.map((chunk) => chunk.code).join('\n');
  const modules = renderedModules(chunks);
  return {
    raw: Buffer.byteLength(code),
    gzip: gzipSync(code, { level: 9 }).byteLength,
    modules,
    imports: new Set(chunks.flatMap((chunk) => chunk.imports)),
    dynamicImports: new Set(chunks.flatMap((chunk) => chunk.dynamicImports ?? [])),
    emittedAssets: outputs.filter((output) => output.type === 'asset').map((asset) => asset.fileName),
    supplierModules: [...modules.keys()].filter((moduleId) => moduleId.includes('/node_modules/')),
  };
}

async function runEffectsFixtureBudget() {
  console.log('\n--- EffectRegistry purity and isolation budget (EFX-01A) ---\n');
  const supplierContract = JSON.parse(readFileSync(join(ROOT, 'supplier-contract.json'), 'utf8'));
  const publicContract = supplierContract.entrypoints?.['./effects'];
  const contractExports = [...(publicContract?.exports ?? [])].sort();
  const fixtureExports = [...EFFECTS_FIXTURE_EXPORTS].sort();
  const contractErrors = [];
  if (JSON.stringify(contractExports) !== JSON.stringify(fixtureExports)) {
    contractErrors.push('public export inventory drifted');
  }
  if (Object.keys(publicContract?.symbols ?? {}).length !== 0) {
    contractErrors.push('supplier symbols declared');
  }
  if (JSON.stringify([...(publicContract?.supplierFreeExports ?? [])].sort()) !== JSON.stringify(fixtureExports)) {
    contractErrors.push('not every runtime export is supplier-free');
  }
  if (contractErrors.length > 0) {
    console.error(`\x1b[31mEffectRegistry supplier contract failed: ${contractErrors.join('; ')}.\x1b[0m\n`);
    return 1;
  }

  try {
    const result = await buildEffectsFixture();
    const clientRuntimeModules = [...result.modules.keys()].filter((moduleId) => (
      /\/(?:components|hooks|motion)\//.test(moduleId)
      || /\/runtime\/motion\//.test(moduleId)
    ));
    const isolationErrors = [];
    if (result.imports.size > 0) {
      isolationErrors.push(`external imports retained: ${[...result.imports].join(', ')}`);
    }
    if (result.dynamicImports.size > 0) {
      isolationErrors.push(`dynamic imports retained: ${[...result.dynamicImports].join(', ')}`);
    }
    if (result.emittedAssets.length > 0) {
      isolationErrors.push(`assets emitted: ${result.emittedAssets.join(', ')}`);
    }
    if (result.supplierModules.length > 0) isolationErrors.push('supplier module bundled');
    if (clientRuntimeModules.length > 0) isolationErrors.push('client/visual runtime retained');
    isolationErrors.push(...auditEffectsCjsClosure());
    isolationErrors.push(...auditEffectsDeclarationClosure());
    const overBudget = result.gzip > EFFECTS_FIXTURE_BUDGET;
    const status = overBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS';
    console.log(
      `EffectRegistry | raw ${formatBytes(result.raw)} (${result.raw} B) | ` +
      `gzip ${formatBytes(result.gzip)} (${result.gzip} B) | ` +
      `limit ${formatBytes(EFFECTS_FIXTURE_BUDGET)} | ` +
      `${isolationErrors.length === 0 ? 'pure; no suppliers/client runtime' : isolationErrors.join('; ')} | ${status}\n`,
    );
    return status === 'PASS' ? 0 : 1;
  } catch (error) {
    console.error(`\x1b[31mEffectRegistry fixture build failed: ${error instanceof Error ? error.message : String(error)}\x1b[0m\n`);
    return 1;
  }
}

async function buildChartSpecFixture() {
  if (!existsSync(CHART_SPEC_ENTRY)) {
    throw new Error('dist/chart-spec.js is missing; build the package before measuring the chart specification facade');
  }

  const { build } = await import('vite');
  const virtualId = 'virtual:viz-03a-chart-spec';
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    plugins: [{
      name: 'viz-03a-chart-spec-entry',
      resolveId(id) {
        return id === virtualId ? resolvedVirtualId : null;
      },
      load(id) {
        if (id !== resolvedVirtualId) return null;
        const names = CHART_SPEC_FIXTURE_EXPORTS.join(', ');
        return `import { ${names} } from ${JSON.stringify(CHART_SPEC_ENTRY)};\nexport { ${names} };\n`;
      },
    }],
    build: {
      write: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: EFFECTS_EXTERNALS,
        output: {
          format: 'es',
          inlineDynamicImports: true,
          entryFileNames: 'bundle.js',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const outputs = (Array.isArray(result) ? result : [result])
    .flatMap((buildResult) => buildResult.output ?? []);
  const chunks = outputs.filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline chart-spec entry chunk; found ${chunks.length}`);
  }

  const code = chunks.map((chunk) => chunk.code).join('\n');
  const modules = renderedModules(chunks);
  return {
    code,
    raw: Buffer.byteLength(code),
    gzip: gzipSync(code, { level: 9 }).byteLength,
    modules,
    imports: new Set(chunks.flatMap((chunk) => chunk.imports)),
    dynamicImports: new Set(chunks.flatMap((chunk) => chunk.dynamicImports ?? [])),
    emittedAssets: outputs.filter((output) => output.type === 'asset').map((asset) => asset.fileName),
    supplierModules: [...modules.keys()].filter((moduleId) => moduleId.includes('/node_modules/')),
  };
}

async function runChartSpecFixtureBudget() {
  console.log('\n--- Chart specification purity and isolation budget (VIZ-03A) ---\n');
  const supplierContract = JSON.parse(readFileSync(join(ROOT, 'supplier-contract.json'), 'utf8'));
  const publicContract = supplierContract.entrypoints?.['./charts/spec'];
  const contractExports = [...(publicContract?.exports ?? [])].sort();
  const fixtureExports = [...CHART_SPEC_FIXTURE_EXPORTS].sort();
  const contractErrors = [];
  if (JSON.stringify(contractExports) !== JSON.stringify(fixtureExports)) {
    contractErrors.push('public export inventory drifted');
  }
  if (Object.keys(publicContract?.symbols ?? {}).length !== 0) {
    contractErrors.push('supplier symbols declared');
  }
  if (JSON.stringify([...(publicContract?.supplierFreeExports ?? [])].sort()) !== JSON.stringify(fixtureExports)) {
    contractErrors.push('not every runtime export is supplier-free');
  }
  if (contractErrors.length > 0) {
    console.error(`\x1b[31mChart-spec supplier contract failed: ${contractErrors.join('; ')}.\x1b[0m\n`);
    return 1;
  }

  try {
    const result = await buildChartSpecFixture();
    const foreignModules = [...result.modules.keys()].filter((moduleId) => (
      moduleId !== '\0virtual:viz-03a-chart-spec' && !isChartSpecArtifact(moduleId)
    ));
    const isolationErrors = [];
    if (result.imports.size > 0) {
      isolationErrors.push(`external imports retained: ${[...result.imports].join(', ')}`);
    }
    if (result.dynamicImports.size > 0) {
      isolationErrors.push(`dynamic imports retained: ${[...result.dynamicImports].join(', ')}`);
    }
    if (result.emittedAssets.length > 0) {
      isolationErrors.push(`assets emitted: ${result.emittedAssets.join(', ')}`);
    }
    if (result.supplierModules.length > 0) isolationErrors.push('supplier module bundled');
    if (foreignModules.length > 0) isolationErrors.push('client/foreign runtime retained');
    if (BROWSER_RUNTIME_PATTERN.test(result.code)) isolationErrors.push('browser runtime retained');
    if (/(?:^|[;\n])\s*['"]use client['"]/.test(result.code)) isolationErrors.push('client directive retained');
    isolationErrors.push(...auditChartSpecCjsClosure());
    isolationErrors.push(...auditChartSpecDeclarationClosure());

    const rawEntries = [CHART_SPEC_ENTRY, CHART_SPEC_CJS_ENTRY].map((entry) => ({
      entry,
      size: existsSync(entry) ? statSync(entry).size : Number.POSITIVE_INFINITY,
      limit: BUDGET[`dist/${entry.split('/').at(-1)}`],
    }));
    for (const { entry, size, limit } of rawEntries) {
      if (!Number.isFinite(size)) isolationErrors.push(`${relative(ROOT, entry)} is missing`);
      else if (size > limit) isolationErrors.push(`${relative(ROOT, entry)} is over its ${limit} B raw budget`);
    }

    const overBudget = result.gzip > CHART_SPEC_FIXTURE_BUDGET;
    const status = overBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS';
    const rawSummary = rawEntries
      .map(({ entry, size, limit }) => `${relative(ROOT, entry)} ${Number.isFinite(size) ? `${size} B` : 'missing'}/${limit} B`)
      .join('; ');
    console.log(
      `ChartSpec | raw entries ${rawSummary} | fixture raw ${formatBytes(result.raw)} (${result.raw} B) | ` +
      `gzip ${formatBytes(result.gzip)} (${result.gzip} B) | ` +
      `limit ${formatBytes(CHART_SPEC_FIXTURE_BUDGET)} | ` +
      `${isolationErrors.length === 0 ? 'pure JSON contract; no suppliers/client/browser runtime' : isolationErrors.join('; ')} | ${status}\n`,
    );
    return status === 'PASS' ? 0 : 1;
  } catch (error) {
    console.error(`\x1b[31mChart-spec fixture build failed: ${error instanceof Error ? error.message : String(error)}\x1b[0m\n`);
    return 1;
  }
}

async function buildChartAccessFixture(name, fixtureExports) {
  if (!existsSync(CHART_ACCESS_ENTRY)) {
    throw new Error('dist/chart-access.js is missing; build the package before measuring chart data access');
  }

  const { build } = await import('vite');
  const virtualId = `virtual:viz-03c-chart-access:${name}`;
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    plugins: [{
      name: `viz-03c-chart-access-${name}`,
      resolveId(id) {
        return id === virtualId ? resolvedVirtualId : null;
      },
      load(id) {
        if (id !== resolvedVirtualId) return null;
        const names = fixtureExports.join(', ');
        return `import { ${names} } from ${JSON.stringify(CHART_ACCESS_ENTRY)};\nexport { ${names} };\n`;
      },
    }],
    build: {
      write: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        external: EFFECTS_EXTERNALS,
        output: {
          format: 'es',
          inlineDynamicImports: true,
          entryFileNames: 'bundle.js',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const outputs = (Array.isArray(result) ? result : [result])
    .flatMap((buildResult) => buildResult.output ?? []);
  const chunks = outputs.filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline chart-access ${name} chunk; found ${chunks.length}`);
  }
  const code = chunks.map((chunk) => chunk.code).join('\n');
  const modules = renderedModules(chunks);
  return {
    code,
    raw: Buffer.byteLength(code),
    gzip: gzipSync(code, { level: 9 }).byteLength,
    modules,
    imports: new Set(chunks.flatMap((chunk) => chunk.imports)),
    dynamicImports: new Set(chunks.flatMap((chunk) => chunk.dynamicImports ?? [])),
    emittedAssets: outputs.filter((output) => output.type === 'asset').map((asset) => asset.fileName),
    supplierModules: [...modules.keys()].filter((moduleId) => moduleId.includes('/node_modules/')),
  };
}

async function runChartAccessFixtureBudgets() {
  console.log('\n--- Chart data-access isolation budgets (VIZ-03C) ---\n');
  const supplierContract = JSON.parse(readFileSync(join(ROOT, 'supplier-contract.json'), 'utf8'));
  const publicContract = supplierContract.entrypoints?.['./charts/access'];
  const contractExports = [...(publicContract?.exports ?? [])].sort();
  const fixtureExports = [...CHART_ACCESS_FIXTURE_EXPORTS].sort();
  const contractErrors = [];
  if (JSON.stringify(contractExports) !== JSON.stringify(fixtureExports)) {
    contractErrors.push('public export inventory drifted');
  }
  if (Object.keys(publicContract?.symbols ?? {}).length !== 0) {
    contractErrors.push('governed supplier symbols declared');
  }
  if (JSON.stringify([...(publicContract?.supplierFreeExports ?? [])].sort()) !== JSON.stringify(fixtureExports)) {
    contractErrors.push('not every runtime export is governed-supplier-free');
  }
  if (contractErrors.length > 0) {
    console.error(`\x1b[31mChart-access supplier contract failed: ${contractErrors.join('; ')}.\x1b[0m\n`);
    return 1;
  }

  try {
    const [all, pure] = await Promise.all([
      buildChartAccessFixture('all', CHART_ACCESS_FIXTURE_EXPORTS),
      buildChartAccessFixture('pure-csv', CHART_ACCESS_PURE_EXPORTS),
    ]);
    const isolationErrors = [];
    const unexpectedImports = [...all.imports].filter((specifier) => (
      !isAllowedChartAccessReactEdge(specifier)
    ));
    if (unexpectedImports.length > 0) {
      isolationErrors.push(`non-React imports retained: ${unexpectedImports.join(', ')}`);
    }
    if (![...all.imports].some((specifier) => isAllowedChartAccessReactEdge(specifier))) {
      isolationErrors.push('React external missing from component fixture');
    }
    if (all.dynamicImports.size > 0) {
      isolationErrors.push(`dynamic imports retained: ${[...all.dynamicImports].join(', ')}`);
    }
    if (all.emittedAssets.length > 0) {
      isolationErrors.push(`assets emitted: ${all.emittedAssets.join(', ')}`);
    }
    if (all.supplierModules.length > 0) isolationErrors.push('supplier module bundled');
    const foreignModules = [...all.modules.keys()].filter((moduleId) => (
      !moduleId.startsWith('\0virtual:viz-03c-chart-access:')
      && !isChartAccessArtifact(moduleId)
    ));
    if (foreignModules.length > 0) isolationErrors.push('foreign runtime retained');
    isolationErrors.push(...auditChartAccessCjsClosure());
    isolationErrors.push(...auditChartAccessDeclarationClosure());

    const pureErrors = [];
    if (pure.imports.size > 0) pureErrors.push(`imports retained: ${[...pure.imports].join(', ')}`);
    if (pure.dynamicImports.size > 0) pureErrors.push('dynamic import retained');
    if (pure.emittedAssets.length > 0) pureErrors.push('asset emitted');
    if (pure.supplierModules.length > 0) pureErrors.push('supplier module bundled');
    const pureClientModules = [...pure.modules.keys()].filter((moduleId) => (
      moduleId.endsWith(`${CHART_ACCESS_ARTIFACT_FRAGMENT}ChartDataAccess.js`)
    ));
    if (pureClientModules.length > 0) pureErrors.push('client component retained by pure CSV fixture');

    const rawEntries = [CHART_ACCESS_ENTRY, CHART_ACCESS_CJS_ENTRY].map((entry) => ({
      entry,
      size: existsSync(entry) ? statSync(entry).size : Number.POSITIVE_INFINITY,
      limit: BUDGET[`dist/${entry.split('/').at(-1)}`],
    }));
    for (const { entry, size, limit } of rawEntries) {
      if (!Number.isFinite(size)) isolationErrors.push(`${relative(ROOT, entry)} is missing`);
      else if (size > limit) isolationErrors.push(`${relative(ROOT, entry)} is over its ${limit} B raw budget`);
    }

    const allOverBudget = all.gzip > CHART_ACCESS_FIXTURE_BUDGET;
    const pureOverBudget = pure.gzip > CHART_ACCESS_PURE_BUDGET;
    const failed = allOverBudget || pureOverBudget || isolationErrors.length > 0 || pureErrors.length > 0;
    const rawSummary = rawEntries
      .map(({ entry, size, limit }) => `${relative(ROOT, entry)} ${Number.isFinite(size) ? `${size} B` : 'missing'}/${limit} B`)
      .join('; ');
    console.log(
      `ChartDataAccess all | raw entries ${rawSummary} | fixture ${all.raw} B raw / ${all.gzip} B gzip ` +
      `(limit ${CHART_ACCESS_FIXTURE_BUDGET} B) | ` +
      `${isolationErrors.length === 0 ? 'access-only; React external' : isolationErrors.join('; ')} | ` +
      `${allOverBudget || isolationErrors.length > 0 ? 'FAIL' : 'PASS'}\n`,
    );
    console.log(
      `ChartDataAccess pure CSV | ${pure.raw} B raw / ${pure.gzip} B gzip ` +
      `(limit ${CHART_ACCESS_PURE_BUDGET} B) | ` +
      `${pureErrors.length === 0 ? 'import-free; client component absent' : pureErrors.join('; ')} | ` +
      `${pureOverBudget || pureErrors.length > 0 ? 'FAIL' : 'PASS'}\n`,
    );
    return failed ? 1 : 0;
  } catch (error) {
    console.error(`\x1b[31mChart-access fixture build failed: ${error instanceof Error ? error.message : String(error)}\x1b[0m\n`);
    return 1;
  }
}

async function buildSpatialFixture(name, entry) {
  if (!existsSync(entry)) {
    throw new Error(`${relative(ROOT, entry)} is missing; build the package before measuring Spatial`);
  }

  const { build } = await import('vite');
  const virtualId = `virtual:spatial-01-${name}`;
  const resolvedVirtualId = `\0${virtualId}`;
  const normalizedEntry = normalizedModuleId(entry);
  const entryRuntimeExports = new Set();
  const sourceDynamicImports = new Set();
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    plugins: [{
      name: `spatial-01-${name}-entry`,
      resolveId(id) {
        return id === virtualId ? resolvedVirtualId : null;
      },
      load(id) {
        if (id !== resolvedVirtualId) return null;
        return `export * from ${JSON.stringify(entry)};\n`;
      },
      moduleParsed(moduleInfo) {
        const moduleId = normalizedModuleId(moduleInfo.id);
        if (moduleId === normalizedEntry) {
          for (const exported of moduleInfo.exports ?? []) entryRuntimeExports.add(exported);
        }
        if (
          (moduleInfo.dynamicallyImportedIds?.length ?? 0) > 0
          || containsImportExpression(moduleInfo.ast)
        ) {
          sourceDynamicImports.add(moduleId);
        }
      },
    }],
    build: {
      write: false,
      assetsInlineLimit: 0,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
      rollupOptions: {
        input: virtualId,
        preserveEntrySignatures: 'strict',
        // Known peers stay external so an accidental edge is visible in the
        // output import inventory instead of being hidden inside the fixture.
        external: EFFECTS_EXTERNALS,
        output: {
          format: 'es',
          inlineDynamicImports: true,
          entryFileNames: 'bundle.js',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
  });

  const outputs = (Array.isArray(result) ? result : [result])
    .flatMap((buildResult) => buildResult.output ?? []);
  const chunks = outputs.filter((output) => output.type === 'chunk');
  if (chunks.length !== 1 || !chunks[0].isEntry) {
    throw new Error(`expected one inline Spatial ${name} chunk; found ${chunks.length}`);
  }
  const code = chunks.map((chunk) => chunk.code).join('\n');
  const modules = renderedModules(chunks);
  return {
    code,
    raw: Buffer.byteLength(code),
    gzip: gzipSync(code, { level: 9 }).byteLength,
    modules,
    imports: new Set(chunks.flatMap((chunk) => chunk.imports)),
    dynamicImports: new Set(chunks.flatMap((chunk) => chunk.dynamicImports ?? [])),
    emittedAssets: outputs.filter((output) => output.type === 'asset').map((asset) => asset.fileName),
    assetModuleIds: [...modules.keys()].filter((moduleId) => SPATIAL_ASSET_MODULE_PATTERN.test(moduleId)),
    bundledExternalModules: [...modules.keys()].filter((moduleId) => moduleId.includes('/node_modules/')),
    entryRuntimeExports,
    fixtureRuntimeExports: new Set(chunks[0].exports ?? []),
    sourceDynamicImports,
    virtualId: resolvedVirtualId,
  };
}

function validateSpatialPublicContract(publicContract, expectedExports) {
  const expected = [...expectedExports].sort();
  const errors = [];
  if (JSON.stringify([...(publicContract?.exports ?? [])].sort()) !== JSON.stringify(expected)) {
    errors.push('public export inventory drifted');
  }
  if (Object.keys(publicContract?.symbols ?? {}).length !== 0) {
    errors.push('governed supplier symbols declared');
  }
  if (
    JSON.stringify([...(publicContract?.supplierFreeExports ?? [])].sort())
    !== JSON.stringify(expected)
  ) {
    errors.push('not every runtime export is governed-supplier-free');
  }
  return errors;
}

function validateSpatialRuntimeExports(result, expectedExports) {
  const expected = [...expectedExports].sort();
  const entryRuntime = [...result.entryRuntimeExports].sort();
  const fixtureRuntime = [...result.fixtureRuntimeExports].sort();
  const errors = [];
  if (JSON.stringify(entryRuntime) !== JSON.stringify(expected)) {
    errors.push(`built facade export inventory drifted (found: ${entryRuntime.join(', ') || 'none'})`);
  }
  if (JSON.stringify(fixtureRuntime) !== JSON.stringify(expected)) {
    errors.push(`all-export fixture inventory drifted (found: ${fixtureRuntime.join(', ') || 'none'})`);
  }
  return errors;
}

function inspectSpatialRawFacade(entry, baselineKey) {
  const relPath = relative(ROOT, entry).replaceAll('\\', '/');
  const size = existsSync(entry) ? statSync(entry).size : Number.POSITIVE_INFINITY;
  const limit = SPATIAL_RAW_BUDGET[relPath] ?? null;
  const errors = [];
  if (!Number.isFinite(size)) errors.push(`${relPath} is missing`);
  else if (limit !== null && size > limit) errors.push(`${relPath} exceeds ${limit} B`);
  return { baselineKey, entry, relPath, size, limit, errors };
}

function formatSpatialRawFacades(measurements) {
  return measurements.map(({ relPath, size, limit }) => (
    `${relPath} ${Number.isFinite(size) ? `${size} B` : 'missing'}`
    + `/${limit === null ? 'PENDING' : `${limit} B`}`
  )).join('; ');
}

async function runSpatialFixtureBudgets() {
  console.log('\n--- Spatial policy/host purity and isolation (SPATIAL-01) ---\n');
  const supplierContract = JSON.parse(readFileSync(join(ROOT, 'supplier-contract.json'), 'utf8'));
  const hostContractErrors = validateSpatialPublicContract(
    supplierContract.entrypoints?.['./spatial'],
    SPATIAL_HOST_FIXTURE_EXPORTS,
  );
  const specContractErrors = validateSpatialPublicContract(
    supplierContract.entrypoints?.['./spatial/spec'],
    SPATIAL_SPEC_FIXTURE_EXPORTS,
  );
  if (hostContractErrors.length > 0 || specContractErrors.length > 0) {
    console.error(
      '\x1b[31mSpatial supplier contract failed: '
      + [
        ...hostContractErrors.map((error) => `host ${error}`),
        ...specContractErrors.map((error) => `spec ${error}`),
      ].join('; ')
      + '.\x1b[0m\n',
    );
    return 1;
  }

  try {
    // Sequential builds keep peak memory bounded during normal CI analysis.
    const spec = await buildSpatialFixture(
      'spec',
      SPATIAL_SPEC_ENTRY,
    );
    const host = await buildSpatialFixture(
      'host',
      SPATIAL_ENTRY,
    );

    const specIsolationErrors = validateSpatialRuntimeExports(
      spec,
      SPATIAL_SPEC_FIXTURE_EXPORTS,
    );
    const specForeignModules = [...spec.modules.keys()].filter((moduleId) => (
      moduleId !== spec.virtualId && !isSpatialSpecArtifact(moduleId)
    ));
    if (spec.imports.size > 0) {
      specIsolationErrors.push(`external imports retained: ${[...spec.imports].join(', ')}`);
    }
    if (spec.dynamicImports.size > 0) {
      specIsolationErrors.push(`dynamic imports retained: ${[...spec.dynamicImports].join(', ')}`);
    }
    if (spec.sourceDynamicImports.size > 0) {
      specIsolationErrors.push(`source dynamic imports found: ${[...spec.sourceDynamicImports].join(', ')}`);
    }
    if (spec.emittedAssets.length > 0) {
      specIsolationErrors.push(`assets emitted: ${spec.emittedAssets.join(', ')}`);
    }
    if (spec.assetModuleIds.length > 0) {
      specIsolationErrors.push(`asset modules retained: ${spec.assetModuleIds.join(', ')}`);
    }
    if (SPATIAL_INLINE_ASSET_PATTERN.test(spec.code)) {
      specIsolationErrors.push('inline asset retained');
    }
    if (spec.bundledExternalModules.length > 0) {
      specIsolationErrors.push('external supplier module bundled');
    }
    if (specForeignModules.length > 0) {
      specIsolationErrors.push(`client/foreign runtime retained: ${specForeignModules.join(', ')}`);
    }
    if (SPATIAL_BROWSER_RUNTIME_PATTERN.test(spec.code)) {
      specIsolationErrors.push('browser runtime retained');
    }
    if (/(?:^|[;\n])\s*['"]use client['"]/.test(spec.code)) {
      specIsolationErrors.push('client directive retained');
    }
    specIsolationErrors.push(...auditSpatialCjsClosure({
      entry: SPATIAL_SPEC_CJS_ENTRY,
      label: 'Spatial spec',
      isAllowedArtifact: isSpatialSpecArtifact,
      browserSafe: true,
      reactRequired: false,
    }));
    specIsolationErrors.push(...auditSpatialDeclarationClosure({
      entry: SPATIAL_SPEC_TYPES_ENTRY,
      label: 'Spatial spec',
      isAllowedArtifact: isSpatialSpecArtifact,
      browserSafe: true,
      reactRequired: false,
    }));

    const hostIsolationErrors = validateSpatialRuntimeExports(
      host,
      SPATIAL_HOST_FIXTURE_EXPORTS,
    );
    const unexpectedHostImports = [...host.imports].filter((specifier) => (
      !isSpatialReactEdge(specifier)
    ));
    const hostForeignModules = [...host.modules.keys()].filter((moduleId) => (
      moduleId !== host.virtualId && !isSpatialHostArtifact(moduleId)
    ));
    if (unexpectedHostImports.length > 0) {
      hostIsolationErrors.push(`non-React imports retained: ${unexpectedHostImports.join(', ')}`);
    }
    if (![...host.imports].some(isSpatialReactEdge)) {
      hostIsolationErrors.push('React external missing');
    }
    if (host.dynamicImports.size > 0) {
      hostIsolationErrors.push(`dynamic imports retained: ${[...host.dynamicImports].join(', ')}`);
    }
    if (host.sourceDynamicImports.size > 0) {
      hostIsolationErrors.push(`source dynamic imports found: ${[...host.sourceDynamicImports].join(', ')}`);
    }
    if (host.emittedAssets.length > 0) {
      hostIsolationErrors.push(`assets emitted: ${host.emittedAssets.join(', ')}`);
    }
    if (host.assetModuleIds.length > 0) {
      hostIsolationErrors.push(`asset modules retained: ${host.assetModuleIds.join(', ')}`);
    }
    if (SPATIAL_INLINE_ASSET_PATTERN.test(host.code)) {
      hostIsolationErrors.push('inline asset retained');
    }
    if (host.bundledExternalModules.length > 0) {
      hostIsolationErrors.push('external supplier module bundled');
    }
    if (hostForeignModules.length > 0) {
      hostIsolationErrors.push(`foreign runtime retained: ${hostForeignModules.join(', ')}`);
    }
    hostIsolationErrors.push(...auditSpatialCjsClosure({
      entry: SPATIAL_CJS_ENTRY,
      label: 'Spatial host',
      isAllowedArtifact: isSpatialHostArtifact,
      browserSafe: false,
      reactRequired: true,
    }));
    hostIsolationErrors.push(...auditSpatialDeclarationClosure({
      entry: SPATIAL_TYPES_ENTRY,
      label: 'Spatial host',
      isAllowedArtifact: isSpatialHostArtifact,
      browserSafe: false,
      reactRequired: true,
    }));

    const hostRaw = [
      inspectSpatialRawFacade(SPATIAL_ENTRY, 'spatialEsmRaw'),
      inspectSpatialRawFacade(SPATIAL_CJS_ENTRY, 'spatialCjsRaw'),
    ];
    const specRaw = [
      inspectSpatialRawFacade(SPATIAL_SPEC_ENTRY, 'spatialSpecEsmRaw'),
      inspectSpatialRawFacade(SPATIAL_SPEC_CJS_ENTRY, 'spatialSpecCjsRaw'),
    ];
    const pendingBaselines = [
      ...hostRaw,
      ...specRaw,
    ].filter(({ limit }) => limit === null).map(({ baselineKey }) => baselineKey);
    if (SPATIAL_FIXTURE_BUDGET.host === null) {
      pendingBaselines.push('spatialHostFixtureGzip');
    }
    if (SPATIAL_FIXTURE_BUDGET.spec === null) {
      pendingBaselines.push('spatialSpecFixtureGzip');
    }
    const hostRawErrors = hostRaw.flatMap(({ errors }) => errors);
    const specRawErrors = specRaw.flatMap(({ errors }) => errors);
    const hostOverBudget = SPATIAL_FIXTURE_BUDGET.host !== null
      && host.gzip > SPATIAL_FIXTURE_BUDGET.host;
    const specOverBudget = SPATIAL_FIXTURE_BUDGET.spec !== null
      && spec.gzip > SPATIAL_FIXTURE_BUDGET.spec;
    const hostFailed = hostIsolationErrors.length > 0
      || hostRawErrors.length > 0
      || hostOverBudget
      || pendingBaselines.some((key) => key.startsWith('spatial') && !key.startsWith('spatialSpec'));
    const specFailed = specIsolationErrors.length > 0
      || specRawErrors.length > 0
      || specOverBudget
      || pendingBaselines.some((key) => key.startsWith('spatialSpec'));

    console.log(
      `Spatial spec | raw facades ${formatSpatialRawFacades(specRaw)} | `
      + `fixture ${spec.raw} B raw / ${spec.gzip} B gzip `
      + `(limit ${SPATIAL_FIXTURE_BUDGET.spec === null ? 'PENDING' : `${SPATIAL_FIXTURE_BUDGET.spec} B`}) | `
      + `${specIsolationErrors.length === 0 ? 'no imports/React/DOM/browser/Three/R3F/assets/dynamic' : specIsolationErrors.join('; ')} | `
      + `${specFailed ? 'FAIL' : 'PASS'}\n`,
    );
    console.log(
      `Spatial host | raw facades ${formatSpatialRawFacades(hostRaw)} | `
      + `fixture ${host.raw} B raw / ${host.gzip} B gzip `
      + `(limit ${SPATIAL_FIXTURE_BUDGET.host === null ? 'PENDING' : `${SPATIAL_FIXTURE_BUDGET.host} B`}) | `
      + `${hostIsolationErrors.length === 0 ? 'React-only external; no Three/R3F/Motion/D3/assets/dynamic' : hostIsolationErrors.join('; ')} | `
      + `${hostFailed ? 'FAIL' : 'PASS'}\n`,
    );
    if (pendingBaselines.length > 0) {
      console.error(
        '\x1b[31mSpatial byte baseline pending. Paste the six exact measurements into '
        + `SPATIAL_BASELINE_BYTES: ${pendingBaselines.join(', ')}.\x1b[0m\n`,
      );
    }
    if (hostRawErrors.length > 0 || specRawErrors.length > 0) {
      console.error(`\x1b[31mSpatial raw facade failures: ${[...hostRawErrors, ...specRawErrors].join('; ')}.\x1b[0m\n`);
    }
    return hostFailed || specFailed ? 1 : 0;
  } catch (error) {
    console.error(`\x1b[31mSpatial fixture build failed: ${error instanceof Error ? error.message : String(error)}\x1b[0m\n`);
    return 1;
  }
}

if (process.argv.includes('--chart-renderers')) {
  const failures = await runChartRendererBudgets();
  process.exit(failures > 0 ? 1 : 0);
}

if (process.argv.includes('--chart-access')) {
  const failures = await runChartAccessFixtureBudgets();
  process.exit(failures > 0 ? 1 : 0);
}

if (process.argv.includes('--chart-spec')) {
  const failures = await runChartSpecFixtureBudget();
  process.exit(failures > 0 ? 1 : 0);
}

if (process.argv.includes('--motion')) {
  const failures = await runMotionFixtureBudgets();
  process.exit(failures > 0 ? 1 : 0);
}

if (process.argv.includes('--effects')) {
  const failures = await runEffectsFixtureBudget();
  process.exit(failures > 0 ? 1 : 0);
}

if (process.argv.includes('--spatial')) {
  const failures = await runSpatialFixtureBudgets();
  process.exit(failures > 0 ? 1 : 0);
}

if (process.argv.includes('--components')) {
  const code = await runComponentBudgets();
  process.exit(code);
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  console.log('\n--- Building @rottay/design-system ---\n');
  try {
    execSync('pnpm run build', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('\nBuild failed. Cannot analyze bundle.\n');
    process.exit(1);
  }
}

const distDir = join(ROOT, 'dist');
if (!existsSync(distDir)) {
  console.error(`\ndist/ directory not found at ${distDir}. Run a build first.\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Analyze
// ---------------------------------------------------------------------------

console.log('\n--- Bundle Size Analysis ---\n');

let failures = 0;
const rows = [];

// 1. Check budgeted entry-point files
for (const [relPath, limit] of Object.entries(BUDGET)) {
  const absPath = join(ROOT, relPath);
  if (!existsSync(absPath)) {
    rows.push({
      file: relPath,
      raw: '-',
      gz: '-',
      limit: formatBytes(limit),
      usage: '-',
      status: 'SKIP (not found)',
    });
    continue;
  }

  const raw = statSync(absPath).size;
  const gz = await gzipSize(absPath);
  const overBudget = raw > limit;
  if (overBudget) failures++;

  rows.push({
    file: relPath,
    raw: formatBytes(raw),
    gz: formatBytes(gz),
    limit: formatBytes(limit),
    usage: `${pct(raw, limit)}%`,
    status: overBudget ? 'FAIL' : 'PASS',
  });
}

// 2. Total JS size
const jsFiles = collectFiles(distDir, (name) => name.endsWith('.js') || name.endsWith('.cjs'));
let totalJS = 0;
for (const f of jsFiles) {
  totalJS += statSync(f).size;
}
{
  const overBudget = totalJS > TOTAL_JS_BUDGET;
  if (overBudget) failures++;
  rows.push({
    file: 'TOTAL JS (dist/**/*.{js,cjs})',
    raw: formatBytes(totalJS),
    gz: '-',
    limit: formatBytes(TOTAL_JS_BUDGET),
    usage: `${pct(totalJS, TOTAL_JS_BUDGET)}%`,
    status: overBudget ? 'FAIL' : 'PASS',
  });
}

// 3. Public CSS payloads. Each exported artifact is governed independently;
// vertical bundles are alternatives, so summing them would be a false route payload.
const publicCssFiles = readdirSync(distDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
  .map((entry) => `dist/${entry.name}`)
  .sort();
const budgetedCssFiles = Object.keys(CSS_BUDGET).sort();
if (JSON.stringify(publicCssFiles) !== JSON.stringify(budgetedCssFiles)) {
  failures += 1;
  rows.push({
    file: 'PUBLIC CSS INVENTORY',
    raw: '-',
    gz: '-',
    limit: budgetedCssFiles.join(', '),
    usage: '-',
    status: `FAIL (found: ${publicCssFiles.join(', ')})`,
  });
}
for (const [relPath, limit] of Object.entries(CSS_BUDGET)) {
  const absPath = join(ROOT, relPath);
  if (!existsSync(absPath)) {
    failures += 1;
    rows.push({
      file: relPath,
      raw: '-',
      gz: '-',
      limit: formatBytes(limit),
      usage: '-',
      status: 'FAIL (missing public CSS)',
    });
    continue;
  }

  const raw = statSync(absPath).size;
  const gz = await gzipSize(absPath);
  const overBudget = gz > limit;
  if (overBudget) failures += 1;
  rows.push({
    file: relPath,
    raw: formatBytes(raw),
    gz: formatBytes(gz),
    limit: formatBytes(limit),
    usage: `${pct(gz, limit)}%`,
    status: overBudget ? 'FAIL' : 'PASS',
  });
}

// 4. A preserveModules entry budget cannot prove named-export tree-shaking.
// Run the in-memory public-facade fixtures as part of every normal
// analysis (including --skip-build), as well as via --chart-renderers alone.
failures += await runChartRendererBudgets();
failures += await runChartAccessFixtureBudgets();
failures += await runChartSpecFixtureBudget();
failures += await runMotionFixtureBudgets();
failures += await runEffectsFixtureBudget();
failures += await runSpatialFixtureBudgets();

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

// Print table
const cols = ['file', 'raw', 'gz', 'limit', 'usage', 'status'];
const headers = { file: 'File', raw: 'Raw', gz: 'Gzip', limit: 'Limit', usage: 'Usage', status: 'Status' };

const widths = {};
for (const col of cols) {
  widths[col] = headers[col].length;
  for (const row of rows) {
    widths[col] = Math.max(widths[col], String(row[col]).length);
  }
}

function pad(str, len) {
  return String(str).padEnd(len);
}

const separator = cols.map((c) => '-'.repeat(widths[c])).join('-+-');
const headerLine = cols.map((c) => pad(headers[c], widths[c])).join(' | ');

console.log(headerLine);
console.log(separator);
for (const row of rows) {
  const line = cols.map((c) => {
    const val = row[c];
    return pad(val, widths[c]);
  }).join(' | ');

  // Highlight failures
  if (row.status === 'FAIL') {
    console.log(`\x1b[31m${line}\x1b[0m`);
  } else if (row.status === 'PASS') {
    console.log(`\x1b[32m${line}\x1b[0m`);
  } else {
    console.log(line);
  }
}

console.log('');

if (failures > 0) {
  console.error(`\x1b[31m${failures} file(s) over budget. See PERFORMANCE_BUDGET.md for limits.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log('\x1b[32mAll files within budget.\x1b[0m\n');
  process.exit(0);
}
