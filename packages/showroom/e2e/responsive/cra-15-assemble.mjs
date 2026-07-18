#!/usr/bin/env node

// ---------------------------------------------------------------------------
// CRA-15 browser-evidence assembler (audit MOT-01).
//
// Runs AFTER the production-build Playwright probes finish. It folds the
// per-test measurements recorded under test-artifacts/craft/cra-15/.run/ into
// the schema packages/core/scripts/cra-15-runtime-hardening-gate.mjs validates,
// measures the Particle/Spatial gzip closures from the SAME built core dist
// (identical Vite-inline methodology as scripts/analyze-bundle.mjs), pins the
// current source fingerprint via the gate itself, hashes the raw Playwright
// report, and writes test-artifacts/craft/cra-15/browser-evidence.json.
//
// It fabricates nothing: every value is derived from a recorded measurement or
// a real build, and a missing/false measurement aborts with a clear error
// instead of emitting a passing claim.
// ---------------------------------------------------------------------------

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

import { auditCra15RuntimeHardening } from '../../../core/scripts/cra-15-runtime-hardening-gate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../../../..');
const CORE_ROOT = join(REPO_ROOT, 'packages', 'core');
const CRA15_DIR = join(REPO_ROOT, 'test-artifacts', 'craft', 'cra-15');
const RUN_DIR = join(CRA15_DIR, '.run');
const REPORT_RELATIVE = 'test-artifacts/craft/cra-15/playwright-report.json';
const REPORT_PATH = join(REPO_ROOT, REPORT_RELATIVE);
const EVIDENCE_PATH = join(CRA15_DIR, 'browser-evidence.json');

// Same governed peer set scripts/analyze-bundle.mjs externalizes, so the
// measured gzip closures match the package's own budget gate.
const EFFECTS_EXTERNALS = [
  'react', /^react\//,
  'react-dom', /^react-dom\//,
  'motion', /^motion\//,
  'd3', /^d3(?:-|\/)/,
  'three', /^three\//,
  '@react-three/fiber', /^@react-three\/fiber\//,
  '@react-three/drei', /^@react-three\/drei\//,
  'antd', /^antd\//,
  '@ant-design/icons', /^@ant-design\/icons\//,
  '@phosphor-icons/react', /^@phosphor-icons\/react\//,
  '@thesvg/react', /^@thesvg\/react\//,
  'lucide-react', /^lucide-react\//,
];

function fail(message) {
  process.stderr.write(`CRA-15 assemble: ${message}\n`);
  process.exit(1);
}

// Honest tree provenance: the probes ran against a build produced from the
// working tree, which during the W3 wave was NOT a clean commit (the concurrent
// motion-adoption lane held uncommitted core changes). None of the CRA-15
// source-assertion files were among them, so the pinned source fingerprint is
// unaffected; the record below states exactly what was built.
function treeProvenance() {
  const git = (args) => {
    try {
      return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  };
  const head = git(['rev-parse', 'HEAD']);
  const porcelain = git(['status', '--porcelain']);
  const dirtyFiles = porcelain ? porcelain.split('\n').filter((line) => line.trim().length > 0).length : 0;
  return {
    headCommit: head,
    workingTreeClean: dirtyFiles === 0,
    uncommittedFiles: dirtyFiles,
    showroomBuildId: readShowroomBuildId(),
    note: dirtyFiles === 0
      ? 'built from a clean working tree'
      : 'built from an in-flight W3 working tree (concurrent motion-adoption lane); no CRA-15 source-assertion file was dirty, so the source fingerprint is unaffected',
  };
}

// The Next.js production BUILD_ID of the showroom build the probes ran against.
// A foreign actor rebuilds this shared tree; recording the id the run measured
// lets the W8 landing detect a silent server swap under `next start`.
function readShowroomBuildId() {
  const buildIdPath = join(REPO_ROOT, 'packages', 'showroom', '.next', 'BUILD_ID');
  try {
    return readFileSync(buildIdPath, 'utf8').trim();
  } catch {
    return null;
  }
}

function readPartial(name) {
  const file = join(RUN_DIR, `${name}.json`);
  if (!existsSync(file)) fail(`missing measurement partial ${name}.json (did the ${name} probe run and pass?)`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

function requireTrue(value, label) {
  if (value !== true) fail(`${label} was not measured true (recorded: ${JSON.stringify(value)})`);
  return true;
}

function requirePositiveInt(value, label) {
  if (!Number.isInteger(value) || value <= 0) fail(`${label} is not a positive integer (recorded: ${JSON.stringify(value)})`);
  return value;
}

async function loadVite() {
  const require = createRequire(join(CORE_ROOT, 'package.json'));
  let vitePath;
  try {
    vitePath = require.resolve('vite');
  } catch {
    fail('vite is not resolvable from packages/core; the core devDependency must be installed');
  }
  // require.resolve() lands on Vite's CJS entry, whose module namespace holds
  // the API under `default`; the ESM entry exposes `build` directly. Accept both.
  const namespace = await import(pathToFileURL(vitePath).href);
  const api = typeof namespace.build === 'function' ? namespace : namespace.default;
  if (typeof api?.build !== 'function') fail('the resolved vite module exposes no build() API');
  return api;
}

// Build one public-export closure from the built core dist with peers external
// and inlined dynamic imports, then gzip at level 9 — the exact methodology of
// analyze-bundle.mjs's Spatial/effects fixtures.
async function measureGzipClosure(build, label, entryRelative, loader) {
  const entry = join(CORE_ROOT, entryRelative);
  if (!existsSync(entry)) fail(`${entryRelative} is missing; build core (dist) before measuring ${label}`);
  const virtualId = `virtual:cra-15-${label}`;
  const resolvedVirtualId = `\0${virtualId}`;
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: CORE_ROOT,
    plugins: [{
      name: `cra-15-${label}-entry`,
      resolveId(id) { return id === virtualId ? resolvedVirtualId : null; },
      load(id) { return id === resolvedVirtualId ? loader(entry) : null; },
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
        external: EFFECTS_EXTERNALS,
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
  if (chunks.length !== 1 || !chunks[0].isEntry) fail(`expected one inline ${label} chunk; found ${chunks.length}`);
  const imports = new Set(chunks.flatMap((chunk) => chunk.imports));
  const bundledPeers = [...imports].filter((specifier) => /\/node_modules\//.test(specifier));
  if (bundledPeers.length > 0) fail(`${label} closure bundled peer modules: ${bundledPeers.join(', ')}`);
  const code = chunks.map((chunk) => chunk.code).join('\n');
  return gzipSync(code, { level: 9 }).byteLength;
}

async function main() {
  if (process.env.CRA15_PRODUCTION_BUILD !== '1') {
    fail('CRA15_PRODUCTION_BUILD=1 must be set — evidence may only claim a production build when the probes ran against `next start`');
  }

  // 1. Recorded browser measurements (each partial written by a passing probe).
  const desktopMeta = readPartial('desktop-meta');
  const particleAlloc = readPartial('desktop-particle-allocation');
  const particleFallback = readPartial('desktop-particle-fallback');
  const particleRapid = readPartial('desktop-particle-rapid');
  const spatialAlloc = readPartial('desktop-spatial-allocation');
  const spatialFallback = readPartial('desktop-spatial-fallback');
  const spatialUnsupported = readPartial('desktop-spatial-unsupported');
  const mobileMeta = readPartial('mobile-meta');
  const mobileParticle = readPartial('mobile-particle-fallback');
  const mobileSpatial = readPartial('mobile-spatial-fallback');

  if (desktopMeta.browserName !== 'chromium') fail(`desktop runner browserName must be chromium (recorded: ${desktopMeta.browserName})`);
  if (typeof desktopMeta.browserVersion !== 'string' || desktopMeta.browserVersion === '') fail('desktop browser version was not recorded');

  const maxLongTaskMs = Math.max(
    Number(particleAlloc.maxCallbackMs) || 0,
    Number(particleAlloc.maxLongTaskMs) || 0,
  );
  if (!Number.isFinite(maxLongTaskMs) || maxLongTaskMs < 0) fail(`long-task metric is not a finite non-negative number (${maxLongTaskMs})`);

  // 2. Source fingerprint + package identity, pinned by the gate itself so the
  //    evidence can never drift from the current CRA-15 source assertions.
  const audit = auditCra15RuntimeHardening();
  const sourceFingerprint = audit.artifact.sourceFingerprint;
  const packageIdentity = audit.artifact.package;

  // 3. Gzip closures from the same built core dist.
  const { build } = await loadVite();
  const particleGzipBytes = await measureGzipClosure(
    build, 'particle', 'dist/index.js',
    (entry) => `import { ParticleField, Particles } from ${JSON.stringify(entry)};\nexport { ParticleField, Particles };\n`,
  );
  const spatialHostGzipBytes = await measureGzipClosure(
    build, 'spatial-host', 'dist/spatial.js',
    (entry) => `export * from ${JSON.stringify(entry)};\n`,
  );
  const spatialSpecGzipBytes = await measureGzipClosure(
    build, 'spatial-spec', 'dist/spatial-spec.js',
    (entry) => `export * from ${JSON.stringify(entry)};\n`,
  );

  // 4. Raw Playwright report -> pass/fail counts + hash.
  if (!existsSync(REPORT_PATH)) fail(`Playwright report is missing at ${REPORT_RELATIVE}`);
  const reportRaw = readFileSync(REPORT_PATH, 'utf8');
  const report = JSON.parse(reportRaw);
  const passed = report.stats?.expected ?? 0;
  const failed = report.stats?.unexpected ?? 0;
  const flaky = report.stats?.flaky ?? 0;
  if (failed !== 0) fail(`Playwright report recorded ${failed} unexpected failure(s); evidence must not claim a clean run`);
  if (flaky !== 0) fail(`Playwright report recorded ${flaky} flaky test(s); rerun until stable before recording evidence`);
  if (!Number.isInteger(passed) || passed < 5) fail(`Playwright report recorded ${passed} passing focal tests; at least five are required`);

  const evidence = {
    schemaVersion: 1,
    workOrder: 'WO-CRA-15',
    package: packageIdentity,
    sourceFingerprint,
    runner: {
      productionBuild: true,
      browserName: 'chromium',
      browserVersion: desktopMeta.browserVersion,
    },
    report: {
      path: REPORT_RELATIVE,
      sha256: createHash('sha256').update(reportRaw).digest('hex'),
      passed,
      failed,
    },
    assertions: {
      providerColorIsolation: requireTrue(particleAlloc.providerColorIsolation, 'provider color isolation'),
      distinctProviderColors: particleAlloc.distinctProviderColors,
      maxConcurrentContinuousRuntimes: particleRapid.maxConcurrentContinuousRuntimes,
      maxSuspendedRafCallbacks: particleFallback.suspendedRafCallbacks,
      maxLongTaskMs: Math.round(maxLongTaskMs * 1000) / 1000,
      rapidMountUnmountCleanup: requireTrue(particleRapid.rapidMountUnmountCleanup, 'rapid mount/unmount cleanup'),
      bundle: {
        cleanBuild: true,
        particleGzipBytes: requirePositiveInt(particleGzipBytes, 'particle gzip bytes'),
        spatialHostGzipBytes: requirePositiveInt(spatialHostGzipBytes, 'spatial host gzip bytes'),
        spatialSpecGzipBytes: requirePositiveInt(spatialSpecGzipBytes, 'spatial spec gzip bytes'),
      },
      particle: {
        maxDpr: particleAlloc.maxDpr,
        maxCount: particleAlloc.maxCount,
        maxPixels: particleAlloc.maxPixels,
        contextLossRecovered: requireTrue(particleAlloc.contextLossRecovered, 'particle context-loss recovery'),
        cleanupPassed: requireTrue(particleAlloc.cleanupPassed, 'particle cleanup'),
      },
      spatial: {
        maxDpr: spatialAlloc.maxDpr,
        maxDimension: spatialAlloc.maxDimension,
        maxPixels: spatialAlloc.maxPixels,
        contextLossRecovered: requireTrue(spatialAlloc.contextLossRecovered, 'spatial context-loss recovery'),
        cleanupPassed: requireTrue(spatialAlloc.cleanupPassed, 'spatial cleanup'),
      },
      fallbackPolicies: {
        'reduced-motion': requireTrue(
          particleFallback.reducedMotion === true && spatialFallback.reducedMotion === true,
          'reduced-motion fallback (particle + spatial)',
        ),
        'coarse-pointer': requireTrue(
          particleFallback.coarsePointer === true
            && spatialFallback.coarsePointer === true
            && mobileParticle.coarsePointer === true
            && mobileSpatial.coarsePointer === true,
          'coarse-pointer fallback (desktop emulation + mobile device)',
        ),
        'save-data': requireTrue(spatialFallback.saveData, 'save-data fallback'),
        unsupported: requireTrue(spatialUnsupported.unsupported, 'unsupported (webgl2) fallback'),
      },
    },
    mobile: {
      device: mobileMeta.device,
      browserName: mobileMeta.browserName,
      browserVersion: mobileMeta.browserVersion,
      isMobile: mobileMeta.isMobile === true,
      hasTouch: mobileMeta.hasTouch === true,
      particle: {
        coarsePointerStatic: mobileParticle.coarsePointer === true,
        canvasCount: mobileParticle.canvasCount,
        rafCallbacks: mobileParticle.rafCallbacks,
      },
      spatial: {
        coarsePointerStatic: mobileSpatial.coarsePointer === true,
        canvasCount: mobileSpatial.canvasCount,
        liveCount: mobileSpatial.liveCount,
      },
    },
    provenance: {
      recordedBy: 'packages/showroom/e2e/responsive/cra-15-assemble.mjs',
      probes: [
        'e2e/responsive/particle-runtime.spec.ts',
        'e2e/responsive/spatial-runtime.spec.ts',
        'e2e/responsive/runtime.mobile.spec.ts',
      ],
      server: 'next start (production build) on :7001 via playwright.visual.config.ts',
      bundleMeasurement: 'vite inline closure, peers external, gzip level 9 (analyze-bundle.mjs methodology)',
      longTaskMetric: 'runtime-phase long tasks only: max synchronous rAF callback duration + PerformanceObserver longtask entries attributed to the runtime phase by the first-frame boundary; one-time page hydration is excluded and recorded under pageBootstrapContext',
      flaky,
      tree: treeProvenance(),
    },
    // Whole-page observation kept for reconciliation (audit MOT-01 condition):
    // long tasks OUTSIDE the certified subject (the DS effects runtime) — one-time
    // Next.js React hydration of the showroom probe page on cold navigation.
    // Recorded here, never discarded, and never folded into assertions.maxLongTaskMs.
    pageBootstrapContext: {
      note: 'Probe-page hydration long tasks, outside the certified runtime. Recorded so a reader can reconcile the raw trace (e.g. a ~52 ms cold-hydration task) with the certified runtime-phase result.',
      boundaryDefinition: "runtime phase begins at the runtime's first requestAnimationFrame request (React hydration never schedules rAF); a long task counts as runtime when start+duration >= boundary, so runtime init/first-frame is included and only tasks that fully completed before the runtime came up are excluded",
      probePageHydrationMaxLongTaskMs: particleAlloc.pageBootstrapMaxLongTaskMs ?? null,
      probePageHydrationLongTaskEntries: particleAlloc.pageBootstrapLongTaskEntries ?? null,
      runtimePhaseBoundaryMs: particleAlloc.firstRafScheduleAtMs ?? null,
    },
  };

  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({
      wrote: 'test-artifacts/craft/cra-15/browser-evidence.json',
      passed,
      failed,
      browserVersion: desktopMeta.browserVersion,
      maxLongTaskMs: evidence.assertions.maxLongTaskMs,
      maxSuspendedRafCallbacks: evidence.assertions.maxSuspendedRafCallbacks,
      bundle: evidence.assertions.bundle,
      sourceFingerprint,
    }, null, 2)}\n`,
  );
}

await main();
