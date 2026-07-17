#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { auditEffectProvenance } from '../../../scripts/effect-registry-audit.mjs';
import { checkCanvasSinkCensus } from './canvas-sink-census.mjs';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PACKAGE_ROOT = resolve(SCRIPT_DIRECTORY, '..');
const DEFAULT_REPOSITORY_ROOT = resolve(DEFAULT_PACKAGE_ROOT, '../..');
const DEFAULT_ARTIFACT_PATH = resolve(
  DEFAULT_REPOSITORY_ROOT,
  'test-artifacts/craft/cra-15/certification.json',
);

const REQUIRED_SOURCE_ASSERTIONS = Object.freeze([
  Object.freeze({
    path: 'packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/contracts/index.ts',
    label: 'one shared continuous graphics budget',
    patterns: [
      /maxActiveTotal:\s*1/u,
      /'decorative-2d':\s*1/u,
      /'immersive-spatial':\s*1/u,
    ],
  }),
  Object.freeze({
    path: 'packages/core/src/graphics/motion/react/presentation/effects/particles/runtime/canvas/governance/animation-lease/index.ts',
    label: 'Particle adapter delegates to the shared governor',
    patterns: [/acquireContinuousGraphicsRuntimeLease/u, /runtimeClass:\s*'decorative-2d'/u],
  }),
  Object.freeze({
    path: 'packages/core/src/infrastructure/runtime/spatial/runtime/browser/context-lease/index.ts',
    label: 'Spatial adapter delegates to the shared governor',
    patterns: [/acquireContinuousGraphicsRuntimeLease/u, /runtimeClass:\s*'immersive-spatial'/u],
  }),
  Object.freeze({
    path: 'packages/core/src/infrastructure/runtime/effects/runtime/registry/index.ts',
    label: 'ParticleField remains the sole measured certification',
    patterns: [
      /id:\s*'particle-field'[\s\S]*?admission:\s*'certified'/u,
      /bundleBudgetGzipBytes:\s*16_384/u,
      /maxContinuousLoops:\s*1/u,
      /runtimeControl:\s*'provider-and-instance'/u,
    ],
  }),
  Object.freeze({
    path: 'packages/core/src/infrastructure/runtime/effects/composition/react/provider/index.tsx',
    label: 'DS-owned provider and instance runtime control',
    patterns: [/parent\.enabled\s*&&\s*locallyEnabled/u, /instanceEnabled\s*\?\?\s*true/u],
  }),
  Object.freeze({
    path: 'packages/core/src/ui/primitives/display/QRCode/runtime/encoded-symbol/index.tsx',
    label: 'standards QR encoder honors output type and correction level',
    patterns: [/<AntQRCode/u, /type=\{type\}/u, /errorLevel=\{errorLevel\}/u],
  }),
  Object.freeze({
    path: 'packages/core/src/ui/primitives/overlay/Watermark/runtime/canvas-pattern/index.ts',
    label: 'Watermark allocation and stale image lifecycle are bounded',
    patterns: [/maxDpr:\s*2/u, /maxPixels:\s*4_194_304/u, /pendingImage\.onload\s*=\s*null/u],
  }),
  Object.freeze({
    path: 'packages/core/src/ui/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts',
    label: 'chart PNG allocation is bounded before Canvas creation',
    patterns: [/maxDimension:\s*8_192/u, /maxPixels:\s*16_777_216/u, /resolvePngRasterPlan/u],
  }),
  Object.freeze({
    path: 'packages/showroom/e2e/responsive/particle-runtime.spec.ts',
    label: 'Particle real-browser lifecycle matrix',
    patterns: [/contextlost/u, /reducedMotion/u, /hasTouch/u, /MAX_PIXELS/u],
  }),
  Object.freeze({
    path: 'packages/showroom/e2e/responsive/spatial-runtime.spec.ts',
    label: 'Spatial real-browser lifecycle matrix',
    patterns: [/webglcontextlost/u, /saveData/u, /webgl2-unsupported/u, /MAX_PIXELS/u],
  }),
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sourceReader(repositoryRoot, overrides) {
  return (relativePath) => {
    if (overrides?.has(relativePath)) return overrides.get(relativePath);
    return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
  };
}

export function auditCra15RuntimeHardening({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  packageRoot = resolve(repositoryRoot, 'packages/core'),
  sourceOverrides,
} = {}) {
  const errors = [];
  const readSource = sourceReader(repositoryRoot, sourceOverrides);
  const fingerprintParts = [];

  for (const assertion of REQUIRED_SOURCE_ASSERTIONS) {
    let source;
    try {
      source = readSource(assertion.path);
    } catch (error) {
      errors.push(`${assertion.label}: missing ${assertion.path} (${String(error)})`);
      continue;
    }
    fingerprintParts.push(`${assertion.path}\0${source}`);
    for (const pattern of assertion.patterns) {
      if (!pattern.test(source)) {
        errors.push(`${assertion.label}: ${assertion.path} lost ${String(pattern)}`);
      }
    }
  }

  let canvasCensus = null;
  try {
    canvasCensus = checkCanvasSinkCensus(packageRoot);
    if (!canvasCensus.ok) {
      errors.push(
        `Canvas sink census drifted: unknown=${canvasCensus.unknown.length}, `
        + `missing=${canvasCensus.missing.length}, changed=${canvasCensus.changed.length}`,
      );
    }
  } catch (error) {
    errors.push(`Canvas sink census threw: ${String(error)}`);
  }

  let effectProvenance = null;
  try {
    effectProvenance = auditEffectProvenance(
      resolve(packageRoot, 'provenance/effects'),
      resolve(packageRoot, 'src/infrastructure/runtime/effects/runtime/registry/index.ts'),
    );
  } catch (error) {
    errors.push(`Effect provenance failed: ${String(error)}`);
  }

  const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
  const artifact = Object.freeze({
    schemaVersion: 1,
    workOrder: 'WO-CRA-15',
    sourceId: 'DS-IMP-106',
    scope: 'ParticleField plus governed Canvas and WebGL lifecycle hardening',
    package: `${packageJson.name}@${packageJson.version}`,
    sourceFingerprint: sha256(fingerprintParts.sort().join('\0\0')),
    governance: Object.freeze({
      sharedContinuousRuntimeBudget: 1,
      decorative2dBudget: 1,
      immersiveSpatialBudget: 1,
      runtimeControl: 'provider-and-instance',
      certifiedEffects: effectProvenance?.certifiedDefinitions ?? 0,
      governedCanvasSinks: canvasCensus?.actual.length ?? 0,
    }),
    allocationBudgets: Object.freeze({
      particle: Object.freeze({ maxDpr: 2, maxParticles: 1_200, maxPixels: 4_194_304 }),
      watermark: Object.freeze({ maxDpr: 2, maxDimension: 2_048, maxPixels: 4_194_304 }),
      chartPng: Object.freeze({ maxScale: 4, maxDimension: 8_192, maxPixels: 16_777_216 }),
      particleBundleGzipBytes: 16_384,
    }),
    requiredBrowserEvidence: Object.freeze([
      'particle: provider color isolation, sole lease, viewport handoff, context recovery, reduced/coarse fallback',
      'spatial: sole context, viewport handoff, bounded backing store, context retry, reduced/coarse/save-data/unsupported fallback',
    ]),
    intentionallyDeferred: Object.freeze([
      'WebGPU admission',
      'Three/R3F scene supplier adoption',
      'Evento adoption',
      'general app-platform adoption',
    ]),
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    artifact,
  });
}

export function checkCra15CertificationArtifact(
  result,
  artifactPath = DEFAULT_ARTIFACT_PATH,
) {
  if (!result.ok) return result.errors;
  if (!existsSync(artifactPath)) return [`missing certification artifact ${artifactPath}`];
  const expected = stableJson(result.artifact);
  const actual = readFileSync(artifactPath, 'utf8');
  return actual === expected
    ? []
    : [`certification artifact drifted: ${relative(DEFAULT_REPOSITORY_ROOT, artifactPath)}`];
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = auditCra15RuntimeHardening();
  const shouldWrite = process.argv.includes('--write');
  const shouldCheck = process.argv.includes('--check');

  if (!result.ok) {
    throw new Error(`WO-CRA-15 runtime hardening gate failed:\n- ${result.errors.join('\n- ')}`);
  }
  if (shouldWrite) {
    mkdirSync(dirname(DEFAULT_ARTIFACT_PATH), { recursive: true });
    writeFileSync(DEFAULT_ARTIFACT_PATH, stableJson(result.artifact));
  }
  if (shouldCheck) {
    const artifactErrors = checkCra15CertificationArtifact(result);
    if (artifactErrors.length > 0) {
      throw new Error(`WO-CRA-15 certification artifact failed:\n- ${artifactErrors.join('\n- ')}`);
    }
  }

  process.stdout.write(`${stableJson({
    ok: true,
    workOrder: result.artifact.workOrder,
    package: result.artifact.package,
    sourceFingerprint: result.artifact.sourceFingerprint,
  })}`);
}
